import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, X, Grid3x3, Play, ArrowLeft, MoreHorizontal, ThumbsUp, ThumbsDown, Bell, FileText } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from '../components/layout/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

type CallType = 'outgoing' | 'incoming' | 'secretary' | 'safe' | 'protected' | 'blocked'
type FilterTab = 'Все' | 'Записи' | 'Секретарь'

interface SummaryBlock { title: string; content: string }
interface SummaryAction { type: 'reminder' | 'share'; text: string }

interface CallSummary {
  tplLabel: string
  tplColor: string
  blocks: SummaryBlock[]
  actions: SummaryAction[]
  shareText: string
}

interface TranscriptMsg { speaker: string; self: boolean; text: string }

interface CallEntry {
  id: string
  name: string
  initials?: string
  initialsColor?: string
  callType: CallType
  typeLabel: string
  time: string
  date?: string
  voicemail?: boolean
  secretaryIcon?: boolean
  hasRecording?: boolean
  notRecorded?: boolean
  duration?: string
  secretaryDuration?: string
  callerPhone?: string
  topic?: string
  summary?: CallSummary
  transcript?: TranscriptMsg[]
}

const PHONE_NUMBER = '+7 916 708-20-28'

const CALL_LOG: { date: string; calls: CallEntry[] }[] = [
  {
    date: 'СЕГОДНЯ',
    calls: [
      {
        id: '1', name: 'Мама', initials: 'М', initialsColor: '#FF2D55',
        callType: 'outgoing', typeLabel: 'Исходящий', time: '09:56',
        date: 'Сегодня, 09:56 · Исходящий · 02:29',
        hasRecording: true, duration: '02:29',
        topic: 'Поговорили о поездке на дачу в выходные, обещал приехать в субботу',
        summary: {
          tplLabel: 'Звонок с родственником', tplColor: '#FF2D55',
          blocks: [
            { title: 'О чём говорили', content: 'Договорились о поездке на дачу в эти выходные.' },
            { title: 'Договорились', content: 'Приехать в субботу к обеду. Мама приготовит обед.' },
          ],
          actions: [
            { type: 'reminder', text: 'Поездка на дачу в субботу' },
            { type: 'share', text: 'Поделиться итогами с Мамой' },
          ],
          shareText: 'Итоги разговора с Мамой:\n\nДоговорились приехать на дачу в субботу к обеду.',
        },
        transcript: [
          { speaker: 'Мама', self: false, text: 'Алло, сынок, как ты там?' },
          { speaker: 'Я', self: true, text: 'Всё хорошо, мам. Ты как?' },
          { speaker: 'Мама', self: false, text: 'Нормально. Ты в эти выходные на дачу приедешь?' },
          { speaker: 'Я', self: true, text: 'Да, приеду в субботу' },
          { speaker: 'Мама', self: false, text: 'Хорошо, обед приготовлю. Пораньше приезжай' },
          { speaker: 'Я', self: true, text: 'Договорились, мам' },
        ],
      },
    ],
  },
  {
    date: 'ВЧЕРА',
    calls: [
      {
        id: '2', name: 'Оля Баба', initials: 'ОБ', initialsColor: '#7B8EC8',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '21:26',
        date: 'Вчера, 21:26 · Секретарь · 02:40',
        secretaryIcon: true, hasRecording: true, duration: '02:40',
        topic: 'Просила передать маме, чтобы перезвонила',
        summary: {
          tplLabel: 'Личный звонок', tplColor: '#34C759',
          blocks: [
            { title: 'О чём говорили', content: 'Оля звонила и просила передать маме, чтобы та перезвонила.' },
            { title: 'Задачи', content: 'Передать маме — Оля ждёт звонка' },
          ],
          actions: [
            { type: 'reminder', text: 'Передать маме: Оля ждёт звонка' },
          ],
          shareText: 'Оля Баба просила передать маме, чтобы та перезвонила.',
        },
        transcript: [
          { speaker: 'Оля Баба', self: false, text: 'Алло!' },
          { speaker: 'Секретарь', self: true, text: 'Здравствуйте, хозяин сейчас занят. Чем могу помочь?' },
          { speaker: 'Оля Баба', self: false, text: 'Передайте, чтоб маме перезвонил.' },
          { speaker: 'Секретарь', self: true, text: 'Хорошо, обязательно передам.' },
        ],
      },
      {
        id: '3', name: 'Оля Баба', initials: 'ОБ', initialsColor: '#7B8EC8',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '21:22',
        date: 'Вчера, 21:22 · Секретарь · 00:15',
        secretaryIcon: true, hasRecording: true, duration: '00:15',
        topic: 'Короткий звонок, не оставила сообщения',
        transcript: [
          { speaker: 'Оля Баба', self: false, text: 'Алло, ты там?' },
          { speaker: 'Секретарь', self: true, text: 'Хозяин сейчас занят.' },
          { speaker: 'Оля Баба', self: false, text: 'Ладно, потом.' },
        ],
      },
      { id: '10', name: '+7 926 777 88 16', callType: 'safe', typeLabel: 'Безопасный звонок', time: '18:45' },
    ],
  },
  {
    date: '13 ФЕВРАЛЯ',
    calls: [
      { id: '5', name: 'Марвин', callType: 'outgoing', typeLabel: 'Исходящий', time: '18:04' },
      { id: '6', name: '3620', callType: 'outgoing', typeLabel: 'Исходящий · Не записан', time: '18:01', notRecorded: true, hasRecording: true },
      { id: '11', name: '+7 925 878 98 76', callType: 'protected', typeLabel: 'Базовая защита', time: '15:22' },
    ],
  },
  {
    date: '12 ФЕВРАЛЯ',
    calls: [
      { id: '7', name: 'Мама', initials: 'МА', initialsColor: '#E91E8C', callType: 'incoming', typeLabel: 'Входящий', time: '20:15' },
      { id: '12', name: '+7 989 777 88 11', callType: 'blocked', typeLabel: 'Ответил Защитник', time: '17:33' },
      { id: '8', name: '+7 926 111-22-33', callType: 'outgoing', typeLabel: 'Исходящий', time: '14:30', voicemail: true },
      { id: '9', name: 'МТС', initials: 'МТ', initialsColor: '#E30611', callType: 'incoming', typeLabel: 'Входящий · Не записан', time: '11:00', notRecorded: true, hasRecording: true },
    ],
  },
]

// ─── Recordings log (8 real scenarios for "Записи" tab) ──────────────────────

const RECORDING_LOG: { date: string; calls: CallEntry[] }[] = [
  {
    date: 'СЕГОДНЯ',
    calls: [
      {
        id: 'r1', name: 'Реклама и опросы',
        callType: 'incoming', typeLabel: 'Входящий', time: '22:22',
        date: 'Сегодня, 22:22 · Входящий · 01:45',
        hasRecording: true, duration: '01:45',
        topic: 'Предложили участие в опросе по качеству связи, отказался',
        summary: {
          tplLabel: 'Сервисный / госорган', tplColor: '#8D969F',
          blocks: [
            { title: 'О чём говорили', content: 'Входящий звонок от рекламного агентства. Предложили пройти опрос о качестве мобильной связи за вознаграждение — подарочная карта на 500 рублей.' },
            { title: 'Итог', content: 'Отказался от участия в опросе. Разговор завершён.' },
            { title: 'На что обратить внимание', content: 'Возможный фишинг или сбор персональных данных под видом опроса. Номер не из официального списка МТС.' },
          ],
          actions: [],
          shareText: 'Входящий от рекламного агентства — предложили опрос за вознаграждение. Отказался.',
        },
        transcript: [
          { speaker: 'Неизвестный номер', self: false, text: 'Здравствуйте! Вас беспокоит агентство «МаркетПро». Вы являетесь клиентом МТС?' },
          { speaker: 'Я', self: true, text: 'Да, являюсь' },
          { speaker: 'Неизвестный номер', self: false, text: 'Отлично! Мы проводим опрос о качестве мобильной связи. Займёт 3 минуты, за участие — подарочная карта на 500 рублей.' },
          { speaker: 'Я', self: true, text: 'Нет, спасибо, не интересует' },
          { speaker: 'Неизвестный номер', self: false, text: 'Но это займёт совсем немного времени, и вы получите—' },
          { speaker: 'Я', self: true, text: 'Спасибо, до свидания' },
        ],
      },
      {
        id: 'r2', name: 'Товары и услуги',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '21:35',
        date: 'Сегодня, 21:35 · Секретарь · 01:12',
        hasRecording: true, duration: '01:12',
        topic: 'Звонили по поводу доставки посылки, уточнили адрес',
        summary: {
          tplLabel: 'Сервисный / госорган', tplColor: '#8D969F',
          blocks: [
            { title: 'О чём говорили', content: 'Звонок по поводу доставки посылки с Ozon. Курьер уточнял адрес и удобное время доставки — не смог найти нужный подъезд по указанному адресу.' },
            { title: 'Договорились', content: 'Доставка сегодня с 18:00 до 21:00. Подъезд №2, домофон 47.' },
            { title: 'Примечание', content: 'Звонок был принят Секретарём — вы были недоступны. Расшифровка сохранена автоматически.' },
          ],
          actions: [
            { type: 'reminder', text: 'Ждать доставку Ozon сегодня с 18:00 до 21:00' },
          ],
          shareText: 'Курьер Ozon уточнял адрес — не мог найти подъезд. Договорились: доставка сегодня 18:00–21:00, подъезд №2, домофон 47.',
        },
        transcript: [
          { speaker: 'Товары и услуги', self: false, text: 'Алло, здравствуйте. Я курьер, у меня для вас посылка с Ozon. Вы сейчас дома?' },
          { speaker: 'Товары и услуги', self: false, text: 'Не могу найти нужный подъезд — написан адрес Ленина 42, но подъездов несколько.' },
          { speaker: 'Товары и услуги', self: false, text: 'Можете уточнить подъезд и домофон? Буду ждать 10 минут.' },
        ],
      },
      {
        id: 'r3', name: 'Алёна Романова', initials: 'АР', initialsColor: '#7B8EC8',
        callType: 'incoming', typeLabel: 'Входящий', time: '19:01',
        date: 'Сегодня, 19:01 · Входящий · 06:44',
        hasRecording: true, duration: '06:44',
        topic: 'Обсудили правки по презентации, договорились созвониться в пятницу',
        summary: {
          tplLabel: 'Созвон с коллегами', tplColor: '#5856D6',
          blocks: [
            { title: 'О чём говорили', content: 'Обсудили финальные правки презентации для клиента, согласовали структуру и визуал. Алёна подняла вопрос по срокам и ресурсам команды.' },
            { title: 'Решения', content: 'Убрать слайд с финансовой моделью — перегружает\nЗаменить графики на инфографику\nДобавить кейсы в раздел «Результаты»' },
            { title: 'Задачи и ответственные', content: 'Алёна — переделать слайды 4–7 → до четверга\nЯ — согласовать с клиентом → пятница до 17:00\nДизайнер — обновить визуал → сегодня' },
            { title: 'Открытые вопросы', content: 'Не решили, включать ли блок с конкурентами. Обсудим в пятницу.' },
            { title: 'На что обратить внимание', content: 'Дизайнер в отпуске в четверг — правки нужно передать сегодня.' },
          ],
          actions: [
            { type: 'reminder', text: 'Передать правки дизайнеру сегодня до конца дня' },
            { type: 'reminder', text: 'Созвон с Алёной в пятницу по открытым вопросам' },
            { type: 'share', text: 'Поделиться итогами с Алёной' },
          ],
          shareText: 'Итоги созвона с Алёной:\n\nРешения: убрать финмодель, заменить графики, добавить кейсы.\nЗадачи:\n— Алёна: слайды 4–7 → до четверга\n— Дизайнер: визуал → сегодня\n— Я: согласование с клиентом → пятница до 17:00',
        },
        transcript: [
          { speaker: 'Алёна Романова', self: false, text: 'Привет, у меня вопрос по презентации — клиент смотрел черновик?' },
          { speaker: 'Я', self: true, text: 'Нет ещё, планирую отправить в пятницу' },
          { speaker: 'Алёна Романова', self: false, text: 'Тогда давай сегодня обсудим правки. Слайды 4-7 надо переделать' },
          { speaker: 'Я', self: true, text: 'Согласен, и убрать финансовую модель — она перегружает' },
          { speaker: 'Алёна Романова', self: false, text: 'Точно. И добавить кейсы в раздел с результатами' },
          { speaker: 'Я', self: true, text: 'Хорошо. По срокам — дизайнер в четверг в отпуске, надо передать ему правки сегодня' },
          { speaker: 'Алёна Романова', self: false, text: 'Да, я помню. Слайды сделаю до четверга со своей стороны' },
          { speaker: 'Я', self: true, text: 'Ок, созвонимся в пятницу?' },
          { speaker: 'Алёна Романова', self: false, text: 'Договорились' },
        ],
      },
      {
        id: 'r8', name: '3620',
        callType: 'outgoing', typeLabel: 'Исходящий · Не записан', time: '14:22',
        date: 'Сегодня, 14:22 · Исходящий',
        notRecorded: true, hasRecording: true,
        topic: 'Сервисный номер — запись недоступна',
      },
    ],
  },
  {
    date: '1 АПРЕЛЯ',
    calls: [
      {
        id: 'r4', name: 'Иван Васильев', initials: 'ИВ', initialsColor: '#7B8EC8',
        callType: 'outgoing', typeLabel: 'Исходящий', time: '17:30',
        date: '1 апреля, 17:30 · Исходящий · 02:15',
        hasRecording: true, duration: '02:15',
        topic: 'Договорились пойти в ресторан Hite на Серпуховской',
        summary: {
          tplLabel: 'Личный звонок', tplColor: '#34C759',
          blocks: [
            { title: 'О чём говорили', content: 'Договорились вместе погулять и зайти в корейский ресторан Hite на Большой Серпуховской.' },
            { title: 'Договорились', content: 'Встреча вечером, Hite, ул. Большая Серпуховская 12/11 стр 2.' },
          ],
          actions: [
            { type: 'reminder', text: 'Встреча с Иваном в Hite' },
            { type: 'share', text: 'Поделиться итогами с Иваном' },
          ],
          shareText: 'Итоги разговора с Иваном:\n\nДоговорились встретиться вечером в Hite, ул. Большая Серпуховская, 12/11 стр 2.',
        },
        transcript: [
          { speaker: 'Иван Васильев', self: false, text: 'Алло, привет! Как ты там?' },
          { speaker: 'Я', self: true, text: 'Привет, отлично. А ты?' },
          { speaker: 'Иван Васильев', self: false, text: 'Тоже хорошо. Го погулять?' },
          { speaker: 'Я', self: true, text: 'Давай, как насчёт Hite?' },
          { speaker: 'Иван Васильев', self: false, text: 'Который на Серпуховской? Погнали' },
          { speaker: 'Я', self: true, text: 'Договорились' },
        ],
      },
    ],
  },
  {
    date: '31 МАРТА',
    calls: [
      {
        id: 'r5', name: 'Яндекс Еда', initials: 'ЯЕ', initialsColor: '#FF2D55',
        callType: 'incoming', typeLabel: 'Входящий', time: '13:15',
        date: '31 марта, 13:15 · Входящий · 00:58',
        hasRecording: true, duration: '00:58',
        topic: 'Курьер уточнил подъезд, доставка через 10 минут',
        summary: {
          tplLabel: 'Покупка / доставка', tplColor: '#FF9500',
          blocks: [
            { title: 'О чём говорили', content: 'Курьер Яндекс Еды звонил уточнить подъезд — не мог найти вход в здание. Заказ уже рядом, ждёт у входа.' },
            { title: 'Договорились', content: 'Встреча у второго входа со стороны парковки. Курьер подождёт 5 минут.' },
          ],
          actions: [
            { type: 'share', text: 'Поделиться итогами' },
          ],
          shareText: 'Курьер Яндекс Еды уточнял подъезд. Договорились встретиться у второго входа со стороны парковки.',
        },
        transcript: [
          { speaker: 'Яндекс Еда', self: false, text: 'Алло, здравствуйте! Я курьер Яндекс Еды, уже рядом с вашим адресом' },
          { speaker: 'Я', self: true, text: 'Да, привет' },
          { speaker: 'Яндекс Еда', self: false, text: 'Не могу найти вход — тут два входа, какой ваш?' },
          { speaker: 'Я', self: true, text: 'Второй вход, со стороны парковки' },
          { speaker: 'Яндекс Еда', self: false, text: 'Понял, иду. Подождите у входа, буду через минуту' },
          { speaker: 'Я', self: true, text: 'Хорошо, выхожу' },
        ],
      },
    ],
  },
  {
    date: '30 МАРТА',
    calls: [
      {
        id: 'r6', name: 'Курьер Ozon', initials: 'OZ', initialsColor: '#0070E5',
        callType: 'incoming', typeLabel: 'Входящий', time: '16:20',
        date: '30 марта, 16:20 · Входящий · 01:30',
        hasRecording: true, duration: '01:30',
        topic: 'Не смог найти домофон, договорились встретиться у подъезда №2',
        summary: {
          tplLabel: 'Покупка / доставка', tplColor: '#FF9500',
          blocks: [
            { title: 'О чём говорили', content: 'Курьер Ozon не смог найти домофон — стоит у подъезда, но кнопки не видно. Заказ — коробка с техникой, габаритная.' },
            { title: 'Договорились', content: 'Встреча у подъезда №2. Домофон спрятан справа от двери за козырьком.' },
          ],
          actions: [
            { type: 'share', text: 'Поделиться итогами' },
          ],
          shareText: 'Курьер Ozon не нашёл домофон. Встретились у подъезда №2 — домофон справа от двери за козырьком.',
        },
        transcript: [
          { speaker: 'Курьер Ozon', self: false, text: 'Добрый день! Я курьер Ozon, стою у вашего дома. Не могу найти домофон' },
          { speaker: 'Я', self: true, text: 'Домофон справа от двери, за козырьком спрятан — его не сразу видно' },
          { speaker: 'Курьер Ozon', self: false, text: 'А, вижу теперь. Но у меня тут коробка большая, сам не занесу — можете выйти?' },
          { speaker: 'Я', self: true, text: 'Да, сейчас спущусь. Какой подъезд?' },
          { speaker: 'Курьер Ozon', self: false, text: 'Второй, я у ступенек стою' },
          { speaker: 'Я', self: true, text: 'Иду' },
        ],
      },
      {
        id: 'r7', name: 'Мама', initials: 'М', initialsColor: '#FF2D55',
        callType: 'outgoing', typeLabel: 'Исходящий', time: '10:45',
        date: '30 марта, 10:45 · Исходящий · 04:17',
        hasRecording: true, duration: '04:17',
        topic: 'Поговорили о поездке на дачу, обещал приехать в субботу',
        summary: {
          tplLabel: 'Звонок с родственником', tplColor: '#FF2D55',
          blocks: [
            { title: 'О чём говорили', content: 'Мама предложила приехать на дачу в эти выходные. Обсудили, что привезти — попросила лекарства из аптеки и немного продуктов.' },
            { title: 'Договорились', content: 'Приеду в субботу на электричке, отправление в 10:22 с Курского вокзала.\nКупить: ибупрофен, валерьянка, хлеб, сыр, кефир.' },
            { title: 'Открытые вопросы', content: 'Уточнить, нужно ли что-то ещё из инструментов для дачи.' },
          ],
          actions: [
            { type: 'reminder', text: 'Электричка в субботу 10:22, Курский вокзал' },
            { type: 'reminder', text: 'Купить: ибупрофен, валерьянка, хлеб, сыр, кефир' },
            { type: 'share', text: 'Поделиться итогами с Мамой' },
          ],
          shareText: 'Звонок с мамой:\n\nЕду на дачу в субботу, электричка 10:22 с Курского.\nКупить: ибупрофен, валерьянка, хлеб, сыр, кефир.',
        },
        transcript: [
          { speaker: 'Мама', self: false, text: 'Алло, сынок! Ты как, всё хорошо?' },
          { speaker: 'Я', self: true, text: 'Привет, мам! Да всё хорошо, работаю' },
          { speaker: 'Мама', self: false, text: 'Ну и ладно. Слушай, ты в эти выходные сможешь на дачу приехать?' },
          { speaker: 'Я', self: true, text: 'В субботу могу. На электричке приеду, в 10:22 с Курского' },
          { speaker: 'Мама', self: false, text: 'Хорошо! Привези, пожалуйста, ибупрофен и валерьянку из аптеки' },
          { speaker: 'Я', self: true, text: 'Хорошо, запишу. Что-нибудь из продуктов нужно?' },
          { speaker: 'Мама', self: false, text: 'Хлеб возьми, сыр и кефир. Тут ничего нет нормального' },
          { speaker: 'Я', self: true, text: 'Ладно, всё куплю. До субботы тогда!' },
          { speaker: 'Мама', self: false, text: 'Жду тебя, целую!' },
        ],
      },
    ],
  },
]

// ─── Secretary log (8 real scenarios for "Секретарь" tab) ────────────────────

const SECRETARY_LOG: { date: string; calls: CallEntry[] }[] = [
  {
    date: 'СЕГОДНЯ',
    calls: [
      {
        id: 's1', name: 'Оля Баба', initials: 'ОБ', initialsColor: '#7B8EC8',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '21:26',
        date: 'Сегодня, 21:26',
        secretaryDuration: '40 сек', callerPhone: '+7 916 445-21-83',
        hasRecording: true, duration: '00:40',
        topic: 'Просила передать, чтобы маме перезвонил',
        transcript: [
          { speaker: 'Секретарь', self: true, text: 'Здравствуйте, хозяин сейчас занят. Чем могу помочь?' },
          { speaker: 'Оля Баба', self: false, text: 'Алло, это Оля. Передайте, пожалуйста, чтобы маме перезвонил — она ждёт.' },
          { speaker: 'Секретарь', self: true, text: 'Хорошо, обязательно передам. Есть ещё что-нибудь?' },
          { speaker: 'Оля Баба', self: false, text: 'Нет, спасибо.' },
          { speaker: 'Секретарь', self: true, text: 'Хорошо, до свидания!' },
        ],
      },
      {
        id: 's2', name: 'Алёна Романова', initials: 'АР', initialsColor: '#7B8EC8',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '18:40',
        date: 'Сегодня, 18:40',
        secretaryDuration: '55 сек', callerPhone: '+7 925 117-44-02',
        hasRecording: true, duration: '00:55',
        topic: 'Спрашивала насчёт встречи завтра в 15:00, просит подтвердить',
        transcript: [
          { speaker: 'Секретарь', self: true, text: 'Здравствуйте, хозяин сейчас занят. Чем могу помочь?' },
          { speaker: 'Алёна Романова', self: false, text: 'Привет, это Алёна. Скажите, встреча завтра в 15:00 — всё в силе? Хочу убедиться.' },
          { speaker: 'Секретарь', self: true, text: 'Записал ваш вопрос. Передам, что вы звонили насчёт завтрашней встречи в 15:00.' },
          { speaker: 'Алёна Романова', self: false, text: 'Хорошо, спасибо. Пусть напишет, если что-то изменится.' },
          { speaker: 'Секретарь', self: true, text: 'Понял, обязательно передам. Всего доброго!' },
        ],
      },
    ],
  },
  {
    date: '1 АПРЕЛЯ',
    calls: [
      {
        id: 's3', name: 'Иван Васильев', initials: 'ИВ', initialsColor: '#7B8EC8',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '20:05',
        date: '1 апреля, 20:05',
        secretaryDuration: '1 мин 10 сек', callerPhone: '+7 926 831-77-55',
        hasRecording: true, duration: '01:10',
        topic: 'Уточнял про ресторан завтра — нужно ли бронировать столик',
        transcript: [
          { speaker: 'Секретарь', self: true, text: 'Добрый вечер! Хозяин недоступен. Могу принять сообщение.' },
          { speaker: 'Иван Васильев', self: false, text: 'Привет, это Иван. Мы идём завтра в Hite или нет? Просто хочу уточнить, мне столик бронировать.' },
          { speaker: 'Секретарь', self: true, text: 'Слушаю вас, записываю.' },
          { speaker: 'Иван Васильев', self: false, text: 'Если идём — пусть напишет мне до 21:00, иначе забронирую на другой день.' },
          { speaker: 'Секретарь', self: true, text: 'Записал — вы ждёте ответа по Hite до 21:00, иначе перенесёте. Передам.' },
          { speaker: 'Иван Васильев', self: false, text: 'Спасибо, буду ждать!' },
        ],
      },
      {
        id: 's4', name: 'Мама', initials: 'М', initialsColor: '#FF2D55',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '14:30',
        date: '1 апреля, 14:30',
        secretaryDuration: '45 сек', callerPhone: '+7 909 765-32-10',
        hasRecording: true, duration: '00:45',
        topic: 'Напоминала про аптеку — купить ибупрофен и валерьянку',
        transcript: [
          { speaker: 'Секретарь', self: true, text: 'Здравствуйте! Хозяин сейчас занят, могу передать сообщение.' },
          { speaker: 'Мама', self: false, text: 'Сынок, это мама. Ты не забыл про аптеку? Купи ибупрофен и валерьянку.' },
          { speaker: 'Секретарь', self: true, text: 'Хорошо, передам — вы напоминаете про ибупрофен и валерьянку из аптеки.' },
          { speaker: 'Мама', self: false, text: 'Спасибо, жду тебя!' },
        ],
      },
    ],
  },
  {
    date: '31 МАРТА',
    calls: [
      {
        id: 's5', name: 'Курьер Ozon', initials: 'OZ', initialsColor: '#0070E5',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '16:05',
        date: '31 марта, 16:05',
        secretaryDuration: '1 мин 20 сек', callerPhone: '+7 800 250-02-02',
        hasRecording: true, duration: '01:20',
        topic: 'Курьер не нашёл подъезд, ждёт 10 минут у первого входа',
        transcript: [
          { speaker: 'Секретарь', self: true, text: 'Добрый день! Хозяин недоступен. Слушаю вас.' },
          { speaker: 'Курьер Ozon', self: false, text: 'Здравствуйте, я курьер Ozon. У меня посылка, не могу найти нужный подъезд — их тут несколько.' },
          { speaker: 'Секретарь', self: true, text: 'К сожалению, уточнить у хозяина прямо сейчас не могу. Оставьте сообщение.' },
          { speaker: 'Курьер Ozon', self: false, text: 'Хорошо, подожду 10 минут у первого подъезда слева.' },
          { speaker: 'Секретарь', self: true, text: 'Понял, передам — вы ждёте 10 минут у первого подъезда слева.' },
        ],
      },
    ],
  },
  {
    date: '30 МАРТА',
    calls: [
      {
        id: 's6', name: 'МТС', initials: 'МТ', initialsColor: '#E30611',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '13:00',
        date: '30 марта, 13:00',
        secretaryDuration: '30 сек', callerPhone: '+7 800 250-08-90',
        hasRecording: true, duration: '00:30',
        topic: 'Автоуведомление о низком балансе',
        transcript: [
          { speaker: 'МТС', self: false, text: 'Здравствуйте! Это автоматическое уведомление МТС. Ваш баланс ниже 50 рублей. Рекомендуем пополнить счёт для сохранения услуг.' },
          { speaker: 'Секретарь', self: true, text: 'Сообщение получено и записано.' },
        ],
      },
      {
        id: 's7', name: 'Яндекс Еда', initials: 'ЯЕ', initialsColor: '#FF2D55',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '11:15',
        date: '30 марта, 11:15',
        secretaryDuration: '50 сек', callerPhone: '+7 495 739-70-00',
        hasRecording: true, duration: '00:50',
        topic: 'Курьер не мог найти подъезд, ждал 5 минут у первого входа',
        transcript: [
          { speaker: 'Секретарь', self: true, text: 'Здравствуйте! Хозяин занят. Слушаю.' },
          { speaker: 'Яндекс Еда', self: false, text: 'Алло, я курьер Яндекс Еды. Стою у дома, не могу найти подъезд — тут два входа.' },
          { speaker: 'Секретарь', self: true, text: 'К сожалению, не могу уточнить детали прямо сейчас. Оставьте сообщение.' },
          { speaker: 'Яндекс Еда', self: false, text: 'Подожду 5 минут у первого входа слева, потом уеду.' },
          { speaker: 'Секретарь', self: true, text: 'Записал — курьер ждёт 5 минут у первого входа слева.' },
        ],
      },
    ],
  },
  {
    date: '29 МАРТА',
    calls: [
      {
        id: 's8', name: '+7 926 555 33 11',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '19:30',
        date: '29 марта, 19:30',
        secretaryDuration: '35 сек', callerPhone: '+7 926 555-33-11',
        hasRecording: true, duration: '00:35',
        topic: 'Интересовался объявлением о продаже, попросил перезвонить',
        transcript: [
          { speaker: 'Секретарь', self: true, text: 'Добрый вечер! Хозяин недоступен. Могу принять сообщение.' },
          { speaker: '+7 926 555 33 11', self: false, text: 'Здравствуйте, я по поводу объявления на Авито. Квартира ещё продаётся?' },
          { speaker: 'Секретарь', self: true, text: 'Записал ваш вопрос по объявлению. Хозяин вам перезвонит.' },
          { speaker: '+7 926 555 33 11', self: false, text: 'Спасибо, буду ждать.' },
        ],
      },
    ],
  },
]

function getFilteredLog(tab: FilterTab) {
  if (tab === 'Записи') return RECORDING_LOG
  if (tab === 'Секретарь') return SECRETARY_LOG
  return CALL_LOG
}

// ─── Avatar gradient helper ───────────────────────────────────────────────────

function avatarGradient(entry: CallEntry): string {
  if (entry.callType === 'blocked')   return 'linear-gradient(180deg, #FFCDD2, #E57373)'
  if (entry.callType === 'safe')      return 'linear-gradient(180deg, #B9F6CA, #4CAF50)'
  if (entry.callType === 'protected') return 'linear-gradient(180deg, #BBDEFB, #2196F3)'
  if (entry.callType === 'secretary') return 'linear-gradient(180deg, #C9D0FF, #8390FF)'
  if (!entry.initials)                return 'linear-gradient(180deg, #C7CFD4, #758091)'
  const c = entry.initialsColor
  if (c === '#FF2D55' || c === '#E91E8C') return 'linear-gradient(180deg, #FFC2AD, #FA8A64)'
  if (c === '#7B8EC8')                    return 'linear-gradient(180deg, #B8BFFF, #8390FF)'
  if (c === '#0070E5')                    return 'linear-gradient(180deg, #B8BFFF, #0070E5)'
  if (c === '#E30611')                    return 'linear-gradient(180deg, #FF8A80, #E30611)'
  if (c) return `linear-gradient(180deg, ${c}88, ${c})`
  return 'linear-gradient(180deg, #B8BFFF, #8390FF)'
}

// ─── Logo avatars for known services ─────────────────────────────────────────

function ServiceLogo({ name }: { name: string }) {
  if (name === 'Яндекс Еда' || name.toLowerCase().includes('яндекс еда')) {
    return (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="13" fill="#FADB14"/>
        <path d="M22 10c-2.4 0-4.2 1.8-4.2 4.2 0 1.8 1.2 3.6 2.4 5.4l1.8 2.4 1.8-2.4c1.2-1.8 2.4-3.6 2.4-5.4C26.2 11.8 24.4 10 22 10z" fill="#1A1A1A"/>
        <circle cx="22" cy="14" r="2" fill="#FADB14"/>
        <path d="M14 26c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M14 26c0 3 1.8 5.4 4.2 6.6" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M30 26c0 3-1.8 5.4-4.2 6.6" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    )
  }
  if (name === 'Курьер Ozon' || name.toLowerCase().includes('ozon')) {
    return (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="13" fill="#005BFF"/>
        <rect width="44" height="44" rx="13" fill="url(#ozon_grad)"/>
        <defs>
          <linearGradient id="ozon_grad" x1="0" y1="0" x2="44" y2="44">
            <stop offset="0%" stopColor="#005BFF"/>
            <stop offset="100%" stopColor="#FF4F4F"/>
          </linearGradient>
        </defs>
        <text x="22" y="27" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="Arial, sans-serif">OZON</text>
      </svg>
    )
  }
  return null
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CallAvatar({ entry }: { entry: CallEntry }) {
  const logo = ServiceLogo({ name: entry.name })
  if (logo) {
    return <div className="shrink-0 w-11 h-11 overflow-hidden" style={{ borderRadius: 13 }}>{logo}</div>
  }
  return (
    <div
      className="shrink-0 w-11 h-11 flex items-center justify-center overflow-hidden"
      style={{ borderRadius: 13, background: avatarGradient(entry) }}
    >
      {entry.initials
        ? <span className="text-white font-sans font-bold text-[15px]">{entry.initials}</span>
        : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
      }
    </div>
  )
}

// ─── Call type icon ───────────────────────────────────────────────────────────

function CallTypeIcon({ callType }: { callType: CallType }) {
  const base = { width: 12, height: 12 }
  if (callType === 'incoming') return (
    <svg {...base} viewBox="0 0 12 12" fill="none">
      <path d="M10 2.5C8.5 1 6.3 1 4.8 2.5L3.5 3.8c-.3.3-.3.8 0 1.1l.6.6c.3.3.8.3 1.1 0l.5-.5c.6-.6 1.6-.6 2.2 0 .6.6.6 1.6 0 2.2l-.5.5c-.3.3-.3.8 0 1.1l.6.6c.3.3.8.3 1.1 0L10 8c1.5-1.5 1.5-4 0-5.5z" fill="#8D969F"/>
      <path d="M2 2l2.5 2.5" stroke="#8D969F" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M2 2h2M2 2v2" stroke="#8D969F" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
  if (callType === 'outgoing') return (
    <svg {...base} viewBox="0 0 12 12" fill="none">
      <path d="M10 2.5C8.5 1 6.3 1 4.8 2.5L3.5 3.8c-.3.3-.3.8 0 1.1l.6.6c.3.3.8.3 1.1 0l.5-.5c.6-.6 1.6-.6 2.2 0 .6.6.6 1.6 0 2.2l-.5.5c-.3.3-.3.8 0 1.1l.6.6c.3.3.8.3 1.1 0L10 8c1.5-1.5 1.5-4 0-5.5z" fill="#8D969F"/>
      <path d="M7.5 2H10M10 2v2.5" stroke="#8D969F" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
  if (callType === 'secretary') return <span style={{ fontSize: 10, color: '#8390FF', lineHeight: 1 }}>✦</span>
  if (callType === 'safe') return (
    <svg {...base} viewBox="0 0 12 12" fill="none">
      <path d="M6 1L1.5 3.5v2.5c0 2.6 1.9 5 4.5 5.6C8.6 11 10.5 8.6 10.5 6V3.5L6 1z" fill="#34C759"/>
      <path d="M4 6l1.5 1.5 3-3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (callType === 'protected') return (
    <svg {...base} viewBox="0 0 12 12" fill="none">
      <path d="M6 1L1.5 3.5v2.5c0 2.6 1.9 5 4.5 5.6C8.6 11 10.5 8.6 10.5 6V3.5L6 1z" fill="#007AFF"/>
    </svg>
  )
  if (callType === 'blocked') return (
    <svg {...base} viewBox="0 0 12 12" fill="none">
      <path d="M6 1L1.5 3.5v2.5c0 2.6 1.9 5 4.5 5.6C8.6 11 10.5 8.6 10.5 6V3.5L6 1z" fill="#E30611"/>
      <path d="M4 4l4 4M8 4l-4 4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
  return null
}

// ─── Call rows ────────────────────────────────────────────────────────────────

function CallRow({ entry, onClick }: { entry: CallEntry; onClick?: () => void }) {
  const hasTranscript = !!(entry.hasRecording || entry.transcript)
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-white text-left active:opacity-85 transition-opacity"
      style={{ borderRadius: 22, padding: '11px 14px 11px 11px', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
    >
      <CallAvatar entry={entry}/>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <p className="font-sans text-[15px] font-semibold truncate" style={{ color: '#1D2023' }}>{entry.name}</p>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {hasTranscript && (
              <div className="flex items-center gap-[2px] px-1.5 py-[3px] rounded-full" style={{ background: '#F0F0F7' }}>
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1 4.5h5" stroke="#8B9CF4" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M4.5 2.5L6.5 4.5l-2 2" stroke="#8B9CF4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-sans font-bold text-[10px]" style={{ color: '#8B9CF4' }}>T</span>
              </div>
            )}
            <span className="font-compact text-[13px]" style={{ color: '#8D969F' }}>{entry.time}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <CallTypeIcon callType={entry.callType}/>
          <p className="font-compact text-[12px]" style={{ color: '#8D969F' }}>{entry.typeLabel}</p>
        </div>
      </div>
    </button>
  )
}

function RecordingCard({ entry, onSummary }: { entry: CallEntry; onTranscript?: () => void; onSummary?: () => void }) {
  return (
    <button
      className="w-full flex items-center gap-3 bg-white text-left active:opacity-85 transition-opacity"
      style={{ borderRadius: 22, padding: '11px 14px 11px 11px', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
      onClick={onSummary}
    >
      <CallAvatar entry={entry}/>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <p className="font-sans text-[15px] font-semibold truncate" style={{ color: '#1D2023' }}>{entry.name}</p>
          <span className="font-compact text-[13px] shrink-0 ml-2" style={{ color: '#8D969F' }}>{entry.time}</span>
        </div>
        <div className="flex items-center gap-1 mb-0.5">
          <CallTypeIcon callType={entry.callType}/>
          <p className="font-compact text-[12px]" style={{ color: '#8D969F' }}>{entry.typeLabel}</p>
        </div>
        {entry.topic && (
          <p className="font-compact text-[13px] leading-snug line-clamp-2" style={{ color: '#1D2023' }}>{entry.topic}</p>
        )}
      </div>
    </button>
  )
}

// ─── Template badge dropdown ──────────────────────────────────────────────────

const TEMPLATES = [
  { key: 'personal', label: 'Личный звонок', color: '#34C759' },
  { key: 'family', label: 'Звонок с родственником', color: '#FF2D55' },
  { key: 'colleague', label: 'Созвон с коллегами', color: '#5856D6' },
  { key: 'client', label: 'Звонок с клиентом', color: '#007AFF' },
  { key: 'service', label: 'Сервисный / госорган', color: '#8E8E93' },
  { key: 'purchase', label: 'Покупка / доставка', color: '#FF9500' },
]

function TemplateBadge({ label, color, onSelect }: { label: string; color: string; onSelect: (t: { label: string; color: string }) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border" style={{ borderColor: color + '44', background: 'white' }}>
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }}/>
        <span className="font-compact text-xs font-semibold" style={{ color }}>{label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 bg-white rounded-2xl z-30 min-w-[220px] overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.14)' }}>
          {TEMPLATES.map((t, i) => (
            <button key={t.key} onClick={() => { onSelect(t); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              style={{ background: t.label === label ? '#F2F2F7' : 'white', borderTop: i > 0 ? '1px solid #F2F2F7' : 'none' }}>
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }}/>
              <span className="font-compact text-sm flex-1 text-gray-900">{t.label}</span>
              {t.label === label && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Details screen ───────────────────────────────────────────────────────────

function DetailsScreen({ entry, onBack, onTranscript }: { entry: CallEntry; onBack: () => void; onTranscript: () => void }) {
  const [rating, setRating] = useState<'up' | 'down' | null>(null)
  const [tplLabel, setTplLabel] = useState(entry.summary?.tplLabel || 'Личный звонок')
  const [tplColor, setTplColor] = useState(entry.summary?.tplColor || '#34C759')
  const [showMenu, setShowMenu] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFeedback, setShowFeedback] = useState<'up' | 'down' | null>(null)
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([])
  const [reminderToast, setReminderToast] = useState(false)
  const summary = entry.summary

  const showReminderToast = () => {
    setReminderToast(true)
    setTimeout(() => setReminderToast(false), 2500)
  }

  const LIKE_OPTIONS = [
    { id: 'accurate', label: 'Точно уловило суть разговора',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { id: 'structured', label: 'Удобно структурировано',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
    { id: 'timesaving', label: 'Сэкономило время',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { id: 'tasks', label: 'Правильно выделило задачи',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
    { id: 'details', label: 'Хорошо передало детали',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  ]

  const DISLIKE_OPTIONS = [
    { id: 'missed', label: 'Упустило важные детали',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E85D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
    { id: 'confused', label: 'Перепутало участников',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E85D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'tasks_wrong', label: 'Неверно сформулировало задачи',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E85D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> },
    { id: 'too_much', label: 'Слишком много лишнего',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E85D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg> },
    { id: 'missed_point', label: 'Не уловило суть разговора',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E85D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  ]

  const toggleFeedback = (id: string) => {
    setSelectedFeedback(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const submitFeedback = () => { setShowFeedback(null); setSelectedFeedback([]) }

  const doShare = () => {
    const text = summary?.shareText || entry.name
    if (navigator.share) navigator.share({ text }).catch(() => {})
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => alert('Скопировано'))
  }

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* Header */}
        <div className="px-4 pt-12 pb-0 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0">
              <ArrowLeft size={22} className="text-gray-900" strokeWidth={2}/>
            </button>
            <CallAvatar entry={entry}/>
            <div className="flex-1 min-w-0">
              <p className="font-sans font-bold text-base text-gray-900 truncate">{entry.name}</p>
              <p className="font-compact font-normal text-xs text-gray-400">{PHONE_NUMBER}</p>
            </div>
            <button onClick={doShare} className="w-9 h-9 flex items-center justify-center shrink-0 rounded-xl" style={{ background: '#E8F2FF' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0070E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
            <button onClick={() => setShowMenu(true)} className="w-9 h-9 flex items-center justify-center shrink-0">
              <MoreHorizontal size={20} className="text-gray-400" strokeWidth={2}/>
            </button>
          </div>
          <p className="font-compact font-normal text-xs text-gray-400 mb-2 ml-1">{entry.date}</p>
          {!entry.notRecorded && (
            <div className="flex gap-2 mb-3">
              <button onClick={() => setShowPlayer(true)} className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 active:bg-gray-200 transition-colors">
                <Play size={13} fill="#1A1A1A" color="#1A1A1A"/>
                <span className="font-sans font-bold text-sm text-gray-900">Слушать</span>
              </button>
              {entry.transcript && (
                <button onClick={onTranscript} className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 active:bg-gray-200 transition-colors">
                  <FileText size={14} className="text-blue-500" strokeWidth={1.8}/>
                  <span className="font-compact text-sm font-semibold text-blue-500">Расшифровка</span>
                </button>
              )}
            </div>
          )}
          <div className="border-b-2 border-blue-500 pb-2.5">
            <span className="font-sans font-semibold text-[15px] text-gray-900">
              {entry.notRecorded ? 'О звонке' : 'Итоги разговора'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 bg-gray-50">
          {entry.notRecorded ? (
            <>
              {/* Service call hero card */}
              <div className="bg-white rounded-3xl overflow-hidden mb-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
                <div className="flex items-center gap-4 px-6 py-7" style={{ background: 'linear-gradient(155deg, #F2F3F7, #E8EAF0)' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(180deg,#C7CFD4,#758091)' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.3a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.1a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans font-bold text-[18px]" style={{ color: '#1D2023' }}>3620</p>
                    <p className="font-compact text-[13px] mt-0.5" style={{ color: '#6E7782' }}>Сервисный номер МТС</p>
                  </div>
                </div>
                <div className="px-5 py-4 flex items-start gap-3" style={{ borderTop: '1px solid #F2F3F7' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(255,149,0,0.08)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-compact font-semibold text-[14px] mb-1.5" style={{ color: '#1D2023' }}>Звонок не записан</p>
                    <p className="font-compact text-[13px] leading-relaxed" style={{ color: '#6E7782' }}>
                      Согласно условиям предоставления услуги «Интеллектуальная запись», звонки на короткие сервисные номера и номера экстренных служб не записываются и не расшифровываются.
                    </p>
                  </div>
                </div>
              </div>

              {/* Which numbers aren't recorded */}
              <div className="bg-white rounded-2xl overflow-hidden mb-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
                <p className="font-compact font-bold text-[11px] uppercase tracking-widest px-4 py-3" style={{ color: '#8D969F' }}>
                  Какие номера не записываются
                </p>
                {[
                  'Короткие сервисные номера операторов',
                  'Экстренные службы (112, 101, 102, 103)',
                  'Номера с запретом записи по законодательству',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid #F2F3F7' }}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#C7CFD4' }}/>
                    <p className="font-compact text-[14px]" style={{ color: '#1D2023' }}>{text}</p>
                  </div>
                ))}
              </div>

              {/* Terms link */}
              <button className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left active:bg-gray-50 transition-colors" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,122,255,0.07)' }}>
                  <FileText size={18} color="#007AFF" strokeWidth={1.8}/>
                </div>
                <div className="flex-1">
                  <p className="font-compact font-semibold text-[14px]" style={{ color: '#007AFF' }}>Условия предоставления услуги</p>
                  <p className="font-compact text-[12px] mt-0.5" style={{ color: '#8D969F' }}>Полный список ограничений</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </>
          ) : summary ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <TemplateBadge label={tplLabel} color={tplColor} onSelect={t => { setTplLabel(t.label); setTplColor(t.color) }}/>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (rating !== 'up') { setRating('up'); setSelectedFeedback([]); setShowFeedback('up') }
                      else setRating(null)
                    }}
                    className="rounded-full px-3 py-2 flex items-center" style={{ background: rating === 'up' ? '#34C75922' : '#F2F2F7' }}>
                    <ThumbsUp size={17} color={rating === 'up' ? '#34C759' : '#8E8E93'} strokeWidth={1.8}/>
                  </button>
                  <button
                    onClick={() => {
                      if (rating !== 'down') { setRating('down'); setSelectedFeedback([]); setShowFeedback('down') }
                      else setRating(null)
                    }}
                    className="rounded-full px-3 py-2 flex items-center" style={{ background: rating === 'down' ? '#FF3B3022' : '#F2F2F7' }}>
                    <ThumbsDown size={17} color={rating === 'down' ? '#FF3B30' : '#8E8E93'} strokeWidth={1.8}/>
                  </button>
                </div>
              </div>
              <p className="font-compact text-xs text-gray-400 mb-4">Составлены при помощи ИИ, возможны неточности</p>

              <div className="bg-white rounded-2xl overflow-hidden mb-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
                {summary.blocks.map((b, i) => (
                  <div key={i} className="px-4 py-3.5" style={{ borderTop: i > 0 ? '1px solid #F2F2F7' : 'none' }}>
                    <p className="font-compact text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{b.title}</p>
                    <p className="font-compact text-sm text-gray-900 leading-relaxed whitespace-pre-line">{b.content}</p>
                  </div>
                ))}
              </div>

              <p className="font-compact text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Действия</p>

              {summary.actions.filter(a => a.type === 'reminder').length > 0 && (
                <button onClick={showReminderToast} className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-start gap-3 mb-2 text-left active:bg-gray-50 transition-colors" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#34C75912' }}>
                    <Bell size={18} color="#34C759" strokeWidth={1.8}/>
                  </div>
                  <div className="flex-1">
                    <p className="font-compact text-xs font-semibold mb-1.5" style={{ color: '#34C759' }}>Напоминания сохранены</p>
                    {summary.actions.filter(a => a.type === 'reminder').map((a, i) => (
                      <p key={i} className="font-compact text-sm text-gray-900 leading-snug"
                        style={{ paddingTop: i > 0 ? 8 : 0, borderTop: i > 0 ? '1px solid #F2F2F7' : 'none', marginTop: i > 0 ? 8 : 0 }}>
                        {a.text}
                      </p>
                    ))}
                  </div>
                </button>
              )}

              {summary.actions.filter(a => a.type === 'share').map((a, i) => (
                <button key={i} onClick={doShare} className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left mb-2" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#E8F2FF' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0070E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans font-bold text-sm text-gray-900">Поделиться итогами</p>
                    <p className="font-compact text-xs text-gray-400 mt-0.5">{a.text}</p>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="font-compact text-sm text-gray-400 text-center">Саммари для этого звонка недоступно</p>
              {entry.transcript && (
                <button onClick={onTranscript} className="mt-2 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5">
                  <FileText size={14} className="text-blue-500" strokeWidth={1.8}/>
                  <span className="font-compact text-sm font-semibold text-blue-500">Посмотреть расшифровку</span>
                </button>
              )}
            </div>
          )}
        </div>

        <BottomNav/>

        {/* Player sheet */}
        <AnimatePresence>
          {showPlayer && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowPlayer(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10">
                  <div className="mb-2">
                    <div className="w-full h-1 bg-gray-200 rounded-full mb-1"><div className="w-0 h-1 bg-gray-900 rounded-full"/></div>
                    <div className="flex justify-between">
                      <span className="font-compact text-xs text-gray-400">00:00</span>
                      <span className="font-compact text-xs text-gray-400">{entry.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-5 mt-4">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"><span className="font-sans font-bold text-xs text-gray-700">x1</span></button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11a7 7 0 1 0 1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/><path d="M4 5v4h4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><text x="8" y="15" fontSize="5" fill="#374151" fontFamily="sans-serif" fontWeight="bold">10</text></svg>
                    </button>
                    <button onClick={() => setIsPlaying(p => !p)} className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center active:scale-95 transition-transform">
                      {isPlaying ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="4" height="14" rx="1.5" fill="white"/><rect x="12" y="3" width="4" height="14" rx="1.5" fill="white"/></svg> : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 3.5L16.5 10 5 16.5V3.5Z" fill="white"/></svg>}
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M18 11a7 7 0 1 1-1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/><path d="M18 5v4h-4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><text x="7" y="15" fontSize="5" fill="#374151" fontFamily="sans-serif" fontWeight="bold">10</text></svg>
                    </button>
                    <button onClick={() => setShowPlayer(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu sheet */}
        <AnimatePresence>
          {showMenu && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowMenu(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10 flex items-center justify-between">
                  <button className="flex items-center gap-3 py-2 active:opacity-70">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 6h14M8 6V4h6v2M9 10v6M13 10v6M5 6l1 12h10L17 6" stroke="#E85D26" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="font-sans font-bold text-base text-[#E85D26]">Удалить звонок</span>
                  </button>
                  <button onClick={() => setShowMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback sheet (like / dislike) */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/25" onClick={() => setShowFeedback(null)}/>
              <motion.div
                className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              >
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-2 pb-8">
                  {/* Section title */}
                  <p className="font-compact font-bold text-[11px] tracking-widest uppercase mb-3 mt-1"
                    style={{ color: '#8D969F' }}>
                    {showFeedback === 'up' ? 'Что понравилось?' : 'Что можно улучшить?'}
                  </p>

                  {/* Options list */}
                  <div className="bg-white rounded-2xl overflow-hidden mb-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
                    {(showFeedback === 'up' ? LIKE_OPTIONS : DISLIKE_OPTIONS).map((opt, i) => {
                      const checked = selectedFeedback.includes(opt.id)
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleFeedback(opt.id)}
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors"
                          style={{ borderTop: i > 0 ? '1px solid #F2F2F7' : 'none' }}
                        >
                          {/* Checkbox */}
                          <div
                            className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all"
                            style={{
                              border: checked ? 'none' : '1.5px solid #D1D5DB',
                              background: checked ? (showFeedback === 'up' ? '#34C759' : '#E85D26') : 'white',
                            }}
                          >
                            {checked && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          {/* Icon */}
                          <span className="shrink-0 w-5 h-5 flex items-center justify-center">{opt.icon}</span>
                          {/* Label */}
                          <span className="font-compact text-[15px] text-gray-900 leading-snug flex-1">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Submit button */}
                  <button
                    onClick={selectedFeedback.length > 0 ? submitFeedback : undefined}
                    className="w-full rounded-2xl py-3.5 font-sans font-bold text-[16px] transition-all"
                    style={{
                      background: selectedFeedback.length > 0
                        ? (showFeedback === 'up' ? '#34C759' : '#E85D26')
                        : '#E5E7EB',
                      color: selectedFeedback.length > 0 ? 'white' : '#9CA3AF',
                    }}
                  >
                    Отправить
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reminder toast */}
        <AnimatePresence>
          {reminderToast && (
            <motion.div
              className="fixed bottom-24 left-0 right-0 flex justify-center z-50 px-5 pointer-events-none"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={{ background: '#1D2023', boxShadow: '0 4px 20px rgba(0,0,0,0.28)' }}>
                <div className="w-5 h-5 rounded-full bg-[#34C759] flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-compact text-[14px] text-white">Пришлём пуш в указанное время</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

// ─── Transcript screen ────────────────────────────────────────────────────────

function TranscriptScreen({ entry, onBack }: { entry: CallEntry; onBack: () => void }) {
  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen">
        <div className="px-4 pt-12 pb-3 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center">
            <button onClick={onBack} className="flex items-center gap-1 mr-3 active:opacity-70">
              <ArrowLeft size={20} className="text-blue-500" strokeWidth={2}/>
              <span className="font-compact text-sm font-semibold text-blue-500">Итоги</span>
            </button>
            <div className="flex-1 text-center">
              <p className="font-sans font-bold text-base text-gray-900">{entry.name}</p>
              <p className="font-compact text-xs text-gray-400">Расшифровка · {entry.time}</p>
            </div>
            <div className="w-16"/>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 flex flex-col gap-3">
          <p className="font-compact text-xs text-gray-400 text-center mb-1">Детали звонка удалятся через 90 дней</p>
          {(entry.transcript || []).map((msg, i) => (
            <div key={i} className={`flex items-end gap-2 ${msg.self ? 'flex-row-reverse' : 'flex-row'}`}>
              {!msg.self && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white font-bold" style={{ background: entry.initialsColor || '#9CA3AF', fontSize: 10 }}>
                  {entry.initials}
                </div>
              )}
              <div className="max-w-[72%]">
                {!msg.self && <p className="font-compact text-[11px] text-gray-400 mb-1 ml-1">{msg.speaker}</p>}
                <div className="px-4 py-2.5 font-compact text-sm leading-snug"
                  style={{ background: msg.self ? '#007AFF' : 'white', color: msg.self ? 'white' : '#1C1C1E', borderRadius: msg.self ? '18px 18px 4px 18px' : '18px 18px 18px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>
        <BottomNav/>
      </div>
    </div>
  )
}

// ─── Secretary screen ─────────────────────────────────────────────────────────

function SecretaryScreen({ entry, onBack }: { entry: CallEntry; onBack: () => void }) {
  const [showMenu, setShowMenu] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const phone = entry.callerPhone || (entry.initials ? '+7 ··· ···-··-··' : entry.name)

  const doShare = () => {
    const text = entry.topic || entry.name
    if (navigator.share) navigator.share({ text }).catch(() => {})
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => alert('Скопировано'))
  }

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* Header */}
        <div className="px-4 pt-12 pb-3 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0">
              <ArrowLeft size={22} className="text-gray-900" strokeWidth={2}/>
            </button>
            <CallAvatar entry={entry}/>
            <div className="flex-1 min-w-0">
              <p className="font-sans font-bold text-base text-gray-900 truncate">{entry.name}</p>
              <p className="font-compact font-normal text-xs text-gray-400">{phone}</p>
            </div>
            <button onClick={doShare} className="w-9 h-9 flex items-center justify-center shrink-0 rounded-xl" style={{ background: '#E8F2FF' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0070E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
            <button onClick={() => setShowMenu(true)} className="w-9 h-9 flex items-center justify-center shrink-0">
              <MoreHorizontal size={20} className="text-gray-400" strokeWidth={2}/>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 flex flex-col">
          {/* Date */}
          <p className="font-compact text-xs text-gray-400 text-center mb-3">{entry.date}</p>

          {/* Secretary badge */}
          <div className="flex justify-center mb-3">
            <div className="flex items-center gap-1.5 rounded-full px-4 py-1.5" style={{ background: '#F0F1FF' }}>
              <span style={{ fontSize: 11, color: '#5560CC' }}>✦</span>
              <span className="font-compact text-sm font-semibold" style={{ color: '#5560CC' }}>
                Ответил Секретарь · {entry.secretaryDuration || entry.duration}
              </span>
            </div>
          </div>

          {/* Listen button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowPlayer(true)}
              className="flex items-center gap-2 bg-gray-100 rounded-xl px-5 py-2.5 active:bg-gray-200 transition-colors"
            >
              <Play size={13} fill="#1A1A1A" color="#1A1A1A"/>
              <span className="font-sans font-bold text-sm text-gray-900">Слушать</span>
              <span className="font-compact text-xs text-gray-400 ml-0.5">{entry.duration}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-100 mb-4"/>

          {/* Секретарь+ banner */}
          {!bannerDismissed && (
            <div className="banner-glow rounded-2xl p-[1.5px] mb-5">
              <div className="bg-white rounded-[14px] px-4 py-3 flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <Grid3x3 size={18} className="text-gray-500" strokeWidth={1.8}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-bold text-sm text-gray-900">Секретарь+</p>
                  <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">Всё нужное в одной подписке</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setBannerDismissed(true) }}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 shrink-0"
                >
                  <X size={14} className="text-gray-500" strokeWidth={2}/>
                </button>
              </div>
            </div>
          )}

          {/* Transcript chat bubbles */}
          <div className="flex flex-col gap-3.5">
            {(entry.transcript || []).map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.self ? 'flex-row-reverse' : 'flex-row'}`}>
                {!msg.self && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-white"
                    style={{ background: avatarGradient(entry), fontSize: 10 }}
                  >
                    {entry.initials || entry.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {msg.self && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#F0F1FF' }}
                  >
                    <span style={{ fontSize: 10 }}>✦</span>
                  </div>
                )}
                <div className="max-w-[72%]">
                  {!msg.self && (
                    <p className="font-compact text-[11px] text-gray-400 mb-1 ml-1">{msg.speaker}</p>
                  )}
                  {msg.self && (
                    <p className="font-compact text-[11px] text-right mb-1 mr-1" style={{ color: '#5560CC' }}>Секретарь</p>
                  )}
                  <div
                    className="px-4 py-2.5 font-compact text-sm leading-snug"
                    style={{
                      background: msg.self ? '#EDEFFE' : '#F2F3F7',
                      color: '#1C1C1E',
                      borderRadius: msg.self ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNav/>

        {/* Player sheet */}
        <AnimatePresence>
          {showPlayer && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowPlayer(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10">
                  <div className="mb-2">
                    <div className="w-full h-1 bg-gray-200 rounded-full mb-1"><div className="w-0 h-1 bg-gray-900 rounded-full"/></div>
                    <div className="flex justify-between">
                      <span className="font-compact text-xs text-gray-400">00:00</span>
                      <span className="font-compact text-xs text-gray-400">{entry.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-5 mt-4">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"><span className="font-sans font-bold text-xs text-gray-700">x1</span></button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11a7 7 0 1 0 1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/><path d="M4 5v4h4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => setIsPlaying(p => !p)} className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center active:scale-95 transition-transform">
                      {isPlaying
                        ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="4" height="14" rx="1.5" fill="white"/><rect x="12" y="3" width="4" height="14" rx="1.5" fill="white"/></svg>
                        : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 3.5L16.5 10 5 16.5V3.5Z" fill="white"/></svg>
                      }
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M18 11a7 7 0 1 1-1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/><path d="M18 5v4h-4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => setShowPlayer(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share sheet */}
        {/* Action menu sheet */}
        <AnimatePresence>
          {showMenu && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowMenu(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-sans font-bold text-base text-gray-900">Действия</p>
                    <button onClick={() => setShowMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                      <X size={14} className="text-gray-500" strokeWidth={2}/>
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <button className="flex items-center gap-4 py-3.5 active:opacity-70 border-b border-gray-100">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D2023" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.3a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <span className="font-sans font-semibold text-base text-gray-900">Позвонить</span>
                    </button>
                    <button className="flex items-center gap-4 py-3.5 active:opacity-70 border-b border-gray-100">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D2023" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span className="font-sans font-semibold text-base text-gray-900">Контакт</span>
                    </button>
                    <button className="flex items-center gap-4 py-3.5 active:opacity-70">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E85D26" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M8 6V4h8v2M9 10v6M15 10v6M5 6l1 13h12l1-13"/></svg>
                      <span className="font-sans font-semibold text-base" style={{ color: '#E85D26' }}>Удалить звонок</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

// ─── Incoming detail screen (with Marvin + Summary sheets) ───────────────────

function IncomingDetailScreen({ entry, onBack }: { entry: CallEntry; onBack: () => void }) {
  const [showSummary, setShowSummary] = useState(false)
  const [showMarvin, setShowMarvin] = useState(false)
  const [summaryRating, setSummaryRating] = useState<'up' | 'down' | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const doShare = () => {
    const text = entry.name
    if (navigator.share) navigator.share({ text }).catch(() => {})
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => alert('Скопировано'))
  }

  const callerName = entry.name
  const callerInitials = entry.initials || entry.name.slice(0, 2).toUpperCase()
  const callerBg = avatarGradient(entry)

  const TRANSCRIPT: TranscriptMsg[] = entry.transcript ?? [
    { speaker: callerName, self: false, text: 'Привет! Ты сейчас в Катаре? Как тебе там?' },
    { speaker: callerName, self: false, text: 'Ну и жара, хорошо тебе отдохнуть!' },
    { speaker: 'Я', self: true, text: 'Спасибо! Как приеду позвоню.' },
    { speaker: callerName, self: false, text: 'Хотел напомнить, что у Наташи 20 юбилей.' },
    { speaker: 'Я', self: true, text: 'Точно, привезу ей что-нибудь особенное.' },
    { speaker: callerName, self: false, text: 'Отлично, до скорого.' },
  ]

  const MARVIN_CHAT = [
    { question: 'Марвин, какая погода в Дохе сейчас?', answer: 'Сейчас в Дохе ясное небо, +38°C, ощущается как +42°C. Влажность — 30%, ветер слабый, 5 км/ч с севера. Осадков не ожидается. Сегодня днём возможен песчаный ветер' },
    { question: 'Марвин, пришли итоги разговора', answer: 'Понял, будет сделано' },
  ]

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-4 bg-white">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0 active:opacity-60">
            <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-sans font-black text-sm text-white" style={{ background: callerBg }}>
              {callerInitials}
            </div>
            <div className="min-w-0">
              <p className="font-sans font-semibold text-[15px] truncate" style={{ color: '#1D2023' }}>{callerName}</p>
              <p className="font-compact text-xs" style={{ color: '#8D969F' }}>{entry.typeLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={doShare} className="active:opacity-60">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D2023" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
            <button onClick={() => setShowMenu(true)} className="active:opacity-60">
              <MoreHorizontal size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
            </button>
          </div>
        </div>

        {/* Call meta */}
        <div className="px-5 pt-2 pb-5 bg-white">
          <p className="font-compact text-sm mb-1" style={{ color: '#8D969F' }}>Сегодня, {entry.time}</p>
          <div className="flex items-center gap-2 mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.3a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" fill="#8390FF"/>
            </svg>
            <p className="font-sans font-bold text-[15px]" style={{ color: '#1D2023' }}>
              Входящий звонок <span className="font-compact font-normal text-sm" style={{ color: '#8D969F' }}>10 сек</span>
            </p>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPlayer(true)} className="flex items-center gap-2.5 px-5 py-2.5 rounded-full active:opacity-70" style={{ background: '#F2F3F7' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polygon points="5 3 19 12 5 21 5 3" fill="#1D2023"/></svg>
              <span className="font-sans font-semibold text-sm" style={{ color: '#1D2023' }}>Слушать</span>
            </button>
            <button onClick={() => setShowSummary(true)} className="w-10 h-10 rounded-full flex items-center justify-center active:opacity-70" style={{ background: '#F2F3F7' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D2023" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <button onClick={() => setShowMarvin(true)} className="w-10 h-10 rounded-full flex items-center justify-center active:opacity-70" style={{ background: '#F2F3F7' }}>
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"/>
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center py-4 px-6">
          <div className="w-full h-px mb-3" style={{ background: 'rgba(0,0,0,0.08)' }}/>
          <p className="font-compact text-xs text-center" style={{ color: '#8D969F' }}>Детали звонка удалятся через 90 дней</p>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3 pb-10">
          {TRANSCRIPT.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.self ? 'items-end' : 'items-start'}`}>
              {!msg.self && (
                <div className="flex items-center gap-2 mb-1 px-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-sans font-black text-[8px] text-white shrink-0" style={{ background: callerBg }}>{callerInitials}</div>
                  <p className="font-compact font-semibold text-xs" style={{ color: '#8D969F' }}>{msg.speaker}</p>
                </div>
              )}
              <div className="px-4 py-3 max-w-[85%]" style={{
                borderRadius: msg.self ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.self ? '#E8E8ED' : 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <p className="font-compact text-[14px] leading-snug" style={{ color: '#1D2023' }}>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary sheet */}
        <AnimatePresence>
          {showSummary && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/30" onClick={() => setShowSummary(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-4 pb-10">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-sans font-black text-[20px]" style={{ color: '#1D2023' }}>Итоги разговора</p>
                      <p className="font-compact text-xs mt-0.5" style={{ color: '#8D969F' }}>Составлены при помощи ИИ, возможны неточности</p>
                    </div>
                    <button onClick={() => setShowSummary(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:opacity-70 shrink-0 ml-3 mt-0.5">
                      <X size={14} className="text-gray-500" strokeWidth={2}/>
                    </button>
                  </div>
                  <p className="font-compact text-[15px] leading-relaxed mt-4 mb-6" style={{ color: '#1D2023' }}>
                    Участник разговора спросил о погоде в Дохе и получил ответ, что сейчас плюс 38 градусов. Затем собеседник попрощались.
                  </p>
                  <p className="font-compact text-sm mb-3" style={{ color: '#8D969F' }}>Оцените качество итогов</p>
                  <div className="flex gap-3">
                    <button onClick={() => setSummaryRating('up')} className="w-11 h-11 rounded-full flex items-center justify-center active:opacity-70" style={{ background: summaryRating === 'up' ? '#34C759' : '#F2F3F7' }}>
                      <ThumbsUp size={20} strokeWidth={1.8} color={summaryRating === 'up' ? 'white' : '#1D2023'}/>
                    </button>
                    <button onClick={() => setSummaryRating('down')} className="w-11 h-11 rounded-full flex items-center justify-center active:opacity-70" style={{ background: summaryRating === 'down' ? '#E30611' : '#F2F3F7' }}>
                      <ThumbsDown size={20} strokeWidth={1.8} color={summaryRating === 'down' ? 'white' : '#1D2023'}/>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Marvin sheet */}
        <AnimatePresence>
          {showMarvin && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/30" onClick={() => setShowMarvin(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-4 pb-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-sans font-black text-[20px]" style={{ color: '#1D2023' }}>Ответы Марвина</p>
                    <button onClick={() => setShowMarvin(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:opacity-70">
                      <X size={14} className="text-gray-500" strokeWidth={2}/>
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {MARVIN_CHAT.map((item, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        {/* User question */}
                        <div className="flex justify-end">
                          <div className="px-4 py-3 max-w-[85%] rounded-[18px_18px_4px_18px]" style={{ background: '#E8E8ED' }}>
                            <p className="font-compact text-[14px] leading-snug" style={{ color: '#1D2023' }}>{item.question}</p>
                          </div>
                        </div>
                        {/* Marvin answer */}
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                              <div className="w-2 h-2 rounded-full bg-white"/>
                            </div>
                            <p className="font-compact font-semibold text-xs" style={{ color: '#8D969F' }}>Марвин</p>
                          </div>
                          <div className="px-4 py-3 max-w-[85%] rounded-[18px_18px_18px_4px]" style={{ background: '#F2F3F7' }}>
                            <p className="font-compact text-[14px] leading-snug" style={{ color: '#1D2023' }}>{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player sheet */}
        <AnimatePresence>
          {showPlayer && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowPlayer(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10">
                  <div className="mb-2">
                    <div className="w-full h-1 bg-gray-200 rounded-full mb-1"><div className="w-0 h-1 bg-gray-900 rounded-full"/></div>
                    <div className="flex justify-between">
                      <span className="font-compact text-xs text-gray-400">00:00</span>
                      <span className="font-compact text-xs text-gray-400">{entry.duration || '00:00'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-5 mt-4">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"><span className="font-sans font-bold text-xs text-gray-700">x1</span></button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11a7 7 0 1 0 1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/><path d="M4 5v4h4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => setIsPlaying(p => !p)} className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center active:scale-95 transition-transform">
                      {isPlaying ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="4" height="14" rx="1.5" fill="white"/><rect x="12" y="3" width="4" height="14" rx="1.5" fill="white"/></svg> : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 3.5L16.5 10 5 16.5V3.5Z" fill="white"/></svg>}
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M18 11a7 7 0 1 1-1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/><path d="M18 5v4h-4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => setShowPlayer(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu sheet */}
        <AnimatePresence>
          {showMenu && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowMenu(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10 flex items-center justify-between">
                  <button className="flex items-center gap-3 py-2 active:opacity-70">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 6h14M8 6V4h6v2M9 10v6M13 10v6M5 6l1 12h10L17 6" stroke="#E85D26" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="font-sans font-bold text-base text-[#E85D26]">Удалить звонок</span>
                  </button>
                  <button onClick={() => setShowMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

// ─── Safe detail screen ───────────────────────────────────────────────────────

function SafeDetailScreen({ entry, onBack }: { entry: CallEntry; onBack: () => void }) {
  const [showPlayer, setShowPlayer] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const doShare = async () => {
    try { await navigator.share({ title: entry.name, text: `Звонок от ${entry.name}` }) } catch { /* cancelled */ }
  }
  const TRANSCRIPT: TranscriptMsg[] = entry.transcript ?? [
    { speaker: 'Возможно, мошенники', self: false, text: 'Добрый день, это проверка домофонов, вам сейчас придет смс, подтвердите четыре цифры, чтобы мы вам выслали новый код от домофона.' },
    { speaker: 'Я', self: true, text: 'Сейчас посмотрю' },
  ]

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-4 bg-white">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0 active:opacity-60">
            <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(180deg, #C7CFD4, #758091)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-sans font-semibold text-[15px] truncate" style={{ color: '#1D2023' }}>Возможно, мошенн…</p>
              <p className="font-compact text-xs" style={{ color: '#8D969F' }}>{entry.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={doShare} className="active:opacity-60">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D2023" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
            <button onClick={() => setShowMenu(true)} className="active:opacity-60">
              <MoreHorizontal size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
            </button>
          </div>
        </div>

        {/* Call meta */}
        <div className="px-5 pt-2 pb-5 bg-white">
          <p className="font-compact text-sm mb-1" style={{ color: '#8D969F' }}>Сегодня, {entry.time}</p>
          <div className="flex items-center gap-2 mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.3a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" fill="#34C759"/>
            </svg>
            <p className="font-sans font-bold text-[15px]" style={{ color: '#1D2023' }}>
              Входящий вызов <span className="font-compact font-normal text-sm" style={{ color: '#8D969F' }}>11 сек</span>
            </p>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPlayer(true)} className="flex items-center gap-2.5 px-5 py-2.5 rounded-full active:opacity-70" style={{ background: '#F2F3F7' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <polygon points="5 3 19 12 5 21 5 3" fill="#1D2023"/>
              </svg>
              <span className="font-sans font-semibold text-sm" style={{ color: '#1D2023' }}>Слушать</span>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center active:opacity-70" style={{ background: '#F2F3F7' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D2023" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center active:opacity-70" style={{ background: '#F2F3F7' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D2023" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center py-4 px-6">
          <div className="w-full h-px mb-3" style={{ background: 'rgba(0,0,0,0.08)' }}/>
          <p className="font-compact text-xs text-center" style={{ color: '#8D969F' }}>Детали звонка удалятся через 90 дней</p>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3">
          {/* Warning bubble */}
          <div className="flex flex-col items-start">
            <div className="px-4 py-3 max-w-[90%] rounded-[18px_18px_18px_4px]" style={{ background: '#FEE8E6' }}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 16 }}>🔊</span>
                <p className="font-compact font-bold text-xs" style={{ color: '#E30611' }}>Безопасный звонок</p>
              </div>
              <p className="font-compact text-[14px] leading-snug" style={{ color: '#1D2023' }}>
                Внимание! Возможно, с вами разговаривает мошенник. Будьте осторожны!
              </p>
            </div>
          </div>

          {TRANSCRIPT.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.self ? 'items-end' : 'items-start'}`}>
              {!msg.self && (
                <div className="flex items-center gap-2 mb-1 px-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #C7CFD4, #758091)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <p className="font-compact font-semibold text-xs" style={{ color: '#8D969F' }}>{msg.speaker}</p>
                </div>
              )}
              <div
                className="px-4 py-3 max-w-[85%]"
                style={{
                  borderRadius: msg.self ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.self ? '#E8E8ED' : 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <p className="font-compact text-[14px] leading-snug" style={{ color: '#1D2023' }}>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pb-10"/>

        {/* Player sheet */}
        <AnimatePresence>
          {showPlayer && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowPlayer(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10">
                  <div className="mb-2">
                    <div className="w-full h-1 bg-gray-200 rounded-full mb-1"><div className="w-0 h-1 bg-gray-900 rounded-full"/></div>
                    <div className="flex justify-between">
                      <span className="font-compact text-xs text-gray-400">00:00</span>
                      <span className="font-compact text-xs text-gray-400">{entry.duration || '00:00'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-5 mt-4">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"><span className="font-sans font-bold text-xs text-gray-700">x1</span></button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11a7 7 0 1 0 1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/><path d="M4 5v4h4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => setIsPlaying(p => !p)} className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center active:scale-95 transition-transform">
                      {isPlaying ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="4" height="14" rx="1.5" fill="white"/><rect x="12" y="3" width="4" height="14" rx="1.5" fill="white"/></svg> : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 3.5L16.5 10 5 16.5V3.5Z" fill="white"/></svg>}
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M18 11a7 7 0 1 1-1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/><path d="M18 5v4h-4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => setShowPlayer(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu sheet */}
        <AnimatePresence>
          {showMenu && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowMenu(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10 flex items-center justify-between">
                  <button className="flex items-center gap-3 py-2 active:opacity-70">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 6h14M8 6V4h6v2M9 10v6M13 10v6M5 6l1 12h10L17 6" stroke="#E85D26" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="font-sans font-bold text-base text-[#E85D26]">Удалить звонок</span>
                  </button>
                  <button onClick={() => setShowMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

// ─── Protected detail screen ─────────────────────────────────────────────────

function ProtectedDetailScreen({ entry, onBack }: { entry: CallEntry; onBack: () => void }) {
  const [showMenu, setShowMenu] = useState(false)
  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-4 bg-white">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0 active:opacity-60">
            <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(180deg, #C7CFD4, #758091)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-sans font-semibold text-[15px] truncate" style={{ color: '#1D2023' }}>Возможно мошенники</p>
              <p className="font-compact text-xs" style={{ color: '#8D969F' }}>{entry.name}</p>
            </div>
          </div>
          <button onClick={() => setShowMenu(true)} className="active:opacity-60">
            <MoreHorizontal size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
          </button>
        </div>

        {/* Call meta */}
        <div className="px-5 pt-2 pb-6 bg-white">
          <p className="font-compact text-sm mb-1" style={{ color: '#8D969F' }}>Сегодня, {entry.time}</p>
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#8D969F"/>
              <rect x="7" y="11" width="10" height="2" rx="1" fill="white"/>
            </svg>
            <p className="font-sans font-bold text-[15px]" style={{ color: '#1D2023' }}>Входящий заблокирован</p>
          </div>
        </div>

        {/* Защитник+ promo card */}
        <div className="mx-4">
          <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(160deg, #F0F0FA 0%, #E8E8F5 100%)' }}>
            <div className="px-5 pt-5 pb-2">
              <p className="font-sans font-black text-[17px] mb-0.5" style={{ color: '#1D2023' }}>Защитник+</p>
              <p className="font-compact text-sm" style={{ color: '#8D969F' }}>Контроль и спокойствие ваших звонков</p>
            </div>

            <div className="px-5 py-3 flex flex-col">
              {/* Feature 1 */}
              <div className="flex items-center gap-4 py-3.5 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.3a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" fill="#8390FF"/>
                  </svg>
                </div>
                <p className="font-compact text-[14px] leading-snug flex-1" style={{ color: '#1D2023' }}>Ответит за вас на подозрительные или спам-звонки</p>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-4 py-3.5 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <div className="flex items-center gap-[2px] px-1.5 py-1 rounded-lg" style={{ background: '#8390FF' }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1 4.5h5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M4.5 2.5L6.5 4.5l-2 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-sans font-black text-[10px] text-white">T</span>
                  </div>
                </div>
                <p className="font-compact text-[14px] leading-snug flex-1" style={{ color: '#1D2023' }}>Пришлёт запись разговора и расшифровку</p>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-4 py-3.5">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.3a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" fill="#8390FF" opacity="0.5"/>
                    <path d="M12 9v4M12 17h.01" stroke="#8390FF" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="font-compact text-[14px] leading-snug flex-1" style={{ color: '#1D2023' }}>Предупредит, если звонят мошенники</p>
              </div>
            </div>

            {/* Button */}
            <div className="px-4 pb-4">
              <button
                className="w-full py-4 rounded-2xl font-sans font-black text-sm uppercase tracking-wide active:opacity-80 transition-opacity"
                style={{ background: 'white', color: '#1D2023' }}
              >
                Подробнее
              </button>
            </div>
          </div>
        </div>

        {/* Menu sheet */}
        <AnimatePresence>
          {showMenu && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowMenu(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10 flex items-center justify-between">
                  <button className="flex items-center gap-3 py-2 active:opacity-70">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 6h14M8 6V4h6v2M9 10v6M13 10v6M5 6l1 12h10L17 6" stroke="#E85D26" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="font-sans font-bold text-base text-[#E85D26]">Удалить звонок</span>
                  </button>
                  <button onClick={() => setShowMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

// ─── Blocked detail screen ────────────────────────────────────────────────────

function BlockedDetailScreen({ entry, onBack }: { entry: CallEntry; onBack: () => void }) {
  const [showPlayer, setShowPlayer] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const doShare = async () => {
    try { await navigator.share({ title: entry.name, text: `Звонок от ${entry.name}` }) } catch { /* cancelled */ }
  }
  const TRANSCRIPT: TranscriptMsg[] = entry.transcript ?? [
    { speaker: entry.name, self: false, text: 'Здравствуйте! Для вашего номера доступен спецпакет обслуживания техники со скидкой: выезд мастера, диагностика и гарантия всего за 199 рублей в месяц. Подтвердите подключение прямо сейчас' },
    { speaker: 'Защитник', self: true, text: 'Здравствуйте, чем могу помочь?' },
    { speaker: entry.name, self: false, text: 'Здравствуйте! Для вашего номера доступен спецпакет обслуживания техники со скидкой: выезд мастера, диагностика и гарантия всего за 199 рублей в месяц. Подтвердите подключение прямо сейчас' },
    { speaker: 'Защитник', self: true, text: 'Спасибо, мы не нуждаемся в данной услуге' },
  ]

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-4 bg-white">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0 active:opacity-60">
            <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(180deg, #C7CFD4, #758091)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-sans font-semibold text-[15px] truncate" style={{ color: '#1D2023' }}>{entry.name}</p>
              <p className="font-compact text-xs" style={{ color: '#8D969F' }}>+7 000 123-07-55</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={doShare} className="active:opacity-60">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D2023" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
            <button onClick={() => setShowMenu(true)} className="active:opacity-60">
              <MoreHorizontal size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-10">

          {/* Call meta */}
          <div className="bg-white px-5 pt-4 pb-5 mb-2">
            <p className="font-compact text-sm mb-1" style={{ color: '#8D969F' }}>
              Сегодня, {entry.time}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L1.5 3.5v2.5c0 2.6 1.9 5 4.5 5.6C8.6 11 10.5 8.6 10.5 6V3.5L6 1z" fill="#E30611"/>
                <path d="M4 4l4 4M8 4l-4 4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <p className="font-sans font-bold text-[15px]" style={{ color: '#1D2023' }}>
                Ответил Защитник <span className="font-compact font-normal text-sm" style={{ color: '#8D969F' }}>10 сек</span>
              </p>
            </div>
            <button onClick={() => setShowPlayer(true)} className="flex items-center gap-3 px-5 py-3 rounded-full active:opacity-70 transition-opacity" style={{ background: '#F2F3F7' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polygon points="5 3 19 12 5 21 5 3" fill="#1D2023"/>
              </svg>
              <span className="font-sans font-semibold text-sm" style={{ color: '#1D2023' }}>Слушать</span>
            </button>
          </div>

          {/* Divider with note */}
          <div className="flex flex-col items-center py-4 px-6">
            <div className="w-full h-px mb-3" style={{ background: 'rgba(0,0,0,0.08)' }}/>
            <p className="font-compact text-xs text-center" style={{ color: '#8D969F' }}>
              Запись удалится через 7 дней,{'\n'}детали звонка — через 90 дней
            </p>
          </div>

          {/* Transcript */}
          <div className="px-4 flex flex-col gap-3">
            {TRANSCRIPT.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.self ? 'items-end' : 'items-start'}`}>
                {!msg.self && (
                  <p className="font-compact font-semibold text-xs mb-1 px-1" style={{ color: '#8D969F' }}>{msg.speaker}</p>
                )}
                <div
                  className="px-4 py-3 max-w-[85%]"
                  style={{
                    borderRadius: msg.self ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.self ? '#E8E8ED' : 'white',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <p className="font-compact text-[14px] leading-snug" style={{ color: '#1D2023' }}>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="px-4 pb-10 pt-3 bg-white border-t border-gray-100">
          <button
            className="w-full py-4 rounded-2xl font-sans font-black text-sm uppercase tracking-wide text-white active:opacity-80 transition-opacity"
            style={{ background: '#1D2023' }}
          >
            Разблокировать
          </button>
        </div>

        {/* Player sheet */}
        <AnimatePresence>
          {showPlayer && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowPlayer(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10">
                  <div className="mb-2">
                    <div className="w-full h-1 bg-gray-200 rounded-full mb-1"><div className="w-0 h-1 bg-gray-900 rounded-full"/></div>
                    <div className="flex justify-between">
                      <span className="font-compact text-xs text-gray-400">00:00</span>
                      <span className="font-compact text-xs text-gray-400">{entry.duration || '00:00'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-5 mt-4">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"><span className="font-sans font-bold text-xs text-gray-700">x1</span></button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11a7 7 0 1 0 1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/><path d="M4 5v4h4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => setIsPlaying(p => !p)} className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center active:scale-95 transition-transform">
                      {isPlaying ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="4" height="14" rx="1.5" fill="white"/><rect x="12" y="3" width="4" height="14" rx="1.5" fill="white"/></svg> : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 3.5L16.5 10 5 16.5V3.5Z" fill="white"/></svg>}
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M18 11a7 7 0 1 1-1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/><path d="M18 5v4h-4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => setShowPlayer(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu sheet */}
        <AnimatePresence>
          {showMenu && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowMenu(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10 flex items-center justify-between">
                  <button className="flex items-center gap-3 py-2 active:opacity-70">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 6h14M8 6V4h6v2M9 10v6M13 10v6M5 6l1 12h10L17 6" stroke="#E85D26" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="font-sans font-bold text-base text-[#E85D26]">Удалить звонок</span>
                  </button>
                  <button onClick={() => setShowMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

// ─── Banner configs ───────────────────────────────────────────────────────────

const BANNERS: Record<FilterTab, { title: string; subtitle: string; icon: 'secretary' | 'voicemail' }> = {
  'Все':       { title: 'Секретарь+', subtitle: 'Всё нужное в одной подписке', icon: 'secretary' },
  'Записи':    { title: 'Шумоподавление', subtitle: 'ИИ в реальном времени уберёт из звонка посторонние звуки', icon: 'voicemail' },
  'Секретарь': { title: 'Интеллектуальная запись', subtitle: 'Запись и расшифровка звонков, краткие итоги разговоров', icon: 'voicemail' },
}

// ─── Contacts screen ──────────────────────────────────────────────────────────

const CONTACTS_DATA = [
  { name: 'Мама',           initials: 'МА', color: '#FF2D55',  phone: undefined,          lastCall: 'Сегодня, 09:56 · Исходящий' },
  { name: 'Марвин',         initials: 'МА', color: '#8390FF',  phone: undefined,          lastCall: '13 февраля, 18:04 · Исходящий' },
  { name: 'МТС',            initials: 'МТ', color: '#E30611',  phone: undefined,          lastCall: '12 февраля, 11:00 · Входящий' },
  { name: 'Оля Баба',       initials: 'ОБ', color: '#7B8EC8',  phone: undefined,          lastCall: 'Вчера, 21:26 · Ответил Секретарь' },
  { name: '+7 925 878 98 76', initials: '78', color: '#8D969F', phone: '+7 925 878 98 76', lastCall: '13 февраля, 15:22 · Базовая защита' },
  { name: '+7 926 111-22-33', initials: '79', color: '#8D969F', phone: '+7 926 111-22-33', lastCall: '12 февраля, 14:30 · Исходящий' },
  { name: '+7 926 777 88 16', initials: '79', color: '#8D969F', phone: '+7 926 777 88 16', lastCall: 'Вчера, 18:45 · Безопасный звонок' },
  { name: '+7 989 777 88 11', initials: '79', color: '#8D969F', phone: '+7 989 777 88 11', lastCall: '12 февраля, 17:33 · Ответил Защитник' },
  { name: '3620',             initials: '36', color: '#8D969F', phone: '3620',             lastCall: '13 февраля, 18:01 · Исходящий' },
]

function avatarGradientForContact(color: string) {
  if (color === '#8D969F') return 'linear-gradient(180deg, #C7CFD4, #758091)'
  return `linear-gradient(180deg, ${color}99, ${color})`
}

function ContactsScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('')

  const named = CONTACTS_DATA.filter(c => !c.phone).sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  const numbers = CONTACTS_DATA.filter(c => !!c.phone).sort((a, b) => a.name.localeCompare(b.name))

  const filter = (list: typeof CONTACTS_DATA) =>
    query ? list.filter(c => c.name.toLowerCase().includes(query.toLowerCase())) : list

  const filteredNamed = filter(named)
  const filteredNumbers = filter(numbers)

  const ContactRow = ({ c }: { c: typeof CONTACTS_DATA[0] }) => (
    <div className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition-colors cursor-pointer">
      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: avatarGradientForContact(c.color) }}>
        <span className="font-sans font-bold text-sm text-white">{c.initials}</span>
      </div>
      <div className="flex-1 min-w-0 border-b border-gray-100 pb-3">
        <p className="font-sans font-semibold text-[15px] truncate" style={{ color: '#1D2023' }}>{c.name}</p>
        <p className="font-compact text-xs truncate" style={{ color: '#8D969F' }}>{c.lastCall}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0 active:opacity-60">
            <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
          </button>
          <h1 className="font-sans font-black text-xl flex-1" style={{ color: '#1D2023' }}>Контакты</h1>
          <span className="font-compact text-sm" style={{ color: '#8D969F' }}>{filteredNamed.length + filteredNumbers.length}</span>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 bg-white">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: '#F2F3F7' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8D969F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Поиск"
              className="flex-1 bg-transparent outline-none font-compact text-sm"
              style={{ color: '#1D2023' }}
            />
            {query && (
              <button onClick={() => setQuery('')} className="active:opacity-60">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#8D969F" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNamed.length > 0 && (
            <>
              {!query && <div className="px-4 pt-2 pb-1"><p className="font-compact font-semibold text-xs uppercase tracking-wide" style={{ color: '#8D969F' }}>Контакты</p></div>}
              {filteredNamed.map(c => <ContactRow key={c.name} c={c}/>)}
            </>
          )}
          {filteredNumbers.length > 0 && (
            <>
              {!query && <div className="px-4 pt-4 pb-1"><p className="font-compact font-semibold text-xs uppercase tracking-wide" style={{ color: '#8D969F' }}>Номера</p></div>}
              {filteredNumbers.map(c => <ContactRow key={c.name} c={c}/>)}
            </>
          )}
          {filteredNamed.length === 0 && filteredNumbers.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-20 gap-2">
              <p className="font-sans font-semibold text-base" style={{ color: '#1D2023' }}>Ничего не найдено</p>
              <p className="font-compact text-sm" style={{ color: '#8D969F' }}>Попробуйте другой запрос</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type DetailScreen = 'details' | 'transcript'

export default function CallsToBe() {
  const navigate = useNavigate()
  const [bannerVisible, setBannerVisible] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Все')
  const [openEntry, setOpenEntry] = useState<CallEntry | null>(null)
  const [detailScreen, setDetailScreen] = useState<DetailScreen>('details')
  const [alertVisible, setAlertVisible] = useState(true)
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [secretaryEntry, setSecretaryEntry] = useState<CallEntry | null>(null)
  const [blockedEntry, setBlockedEntry] = useState<CallEntry | null>(null)
  const [protectedEntry, setProtectedEntry] = useState<CallEntry | null>(null)
  const [safeEntry, setSafeEntry] = useState<CallEntry | null>(null)
  const [incomingEntry, setIncomingEntry] = useState<CallEntry | null>(null)
  const [showContacts, setShowContacts] = useState(false)

  const dismissAlert = () => { setAlertVisible(false); setAlertModalOpen(false) }

  if (showContacts) {
    return <ContactsScreen onBack={() => setShowContacts(false)}/>
  }
  if (incomingEntry) {
    return <IncomingDetailScreen entry={incomingEntry} onBack={() => setIncomingEntry(null)}/>
  }
  if (safeEntry) {
    return <SafeDetailScreen entry={safeEntry} onBack={() => setSafeEntry(null)}/>
  }
  if (protectedEntry) {
    return <ProtectedDetailScreen entry={protectedEntry} onBack={() => setProtectedEntry(null)}/>
  }
  if (blockedEntry) {
    return <BlockedDetailScreen entry={blockedEntry} onBack={() => setBlockedEntry(null)}/>
  }
  if (secretaryEntry) {
    return <SecretaryScreen entry={secretaryEntry} onBack={() => setSecretaryEntry(null)}/>
  }
  if (openEntry && detailScreen === 'transcript') {
    return <TranscriptScreen entry={openEntry} onBack={() => setDetailScreen('details')}/>
  }
  if (openEntry) {
    return <DetailsScreen entry={openEntry} onBack={() => setOpenEntry(null)} onTranscript={() => setDetailScreen('transcript')}/>
  }

  const banner = BANNERS[activeFilter]
  const filteredLog = getFilteredLog(activeFilter)
  const isCardView = activeFilter === 'Записи' || activeFilter === 'Секретарь'

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Header */}
        <div
          className="px-4 pt-12 pb-3 flex-shrink-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(249,249,251,0.65) 55%, #F2F3F7 100%), url(/undercover.svg) top center/100% auto no-repeat',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-sans font-black text-[1.75rem] leading-tight" style={{ color: '#1D2023' }}>Звонки</h1>
              <p className="font-compact font-normal text-sm" style={{ color: '#8D969F' }}>{PHONE_NUMBER}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => navigate('/calls')} className="flex items-center active:opacity-50 transition-opacity">
                <span className="font-compact text-xs underline underline-offset-2" style={{ color: 'rgba(29,32,35,0.35)' }}>AsIs</span>
              </button>
              <button onClick={() => navigate('/calls/catalog')} className="h-9 px-4 rounded-full flex items-center justify-center active:opacity-70 transition-opacity" style={{ background: 'rgba(29,32,35,0.07)' }}>
                <span className="font-sans font-bold text-xs uppercase tracking-wide" style={{ color: '#1D2023' }}>Каталог</span>
              </button>
              <button onClick={() => setShowContacts(true)} className="w-9 h-9 rounded-xl flex items-center justify-center active:opacity-70 transition-opacity" style={{ background: 'rgba(29,32,35,0.07)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D2023" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </button>
              <button onClick={() => navigate('/calls/settings')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(29,32,35,0.07)' }}>
                <Settings size={18} strokeWidth={2} style={{ color: '#1D2023' }}/>
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            {(['Все', 'Записи', 'Секретарь'] as FilterTab[]).map(tab => (
              <button key={tab} onClick={() => { setActiveFilter(tab); setBannerVisible(true) }}
                className="rounded-full px-4 py-1.5 font-compact font-semibold text-sm transition-colors"
                style={{
                  background: activeFilter === tab ? '#1D2023' : 'rgba(29,32,35,0.07)',
                  color: activeFilter === tab ? 'white' : '#1D2023',
                }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="px-2 pt-3 flex flex-col gap-[6px]">

            {/* Amber alert — only on "Записи" tab while not dismissed */}
            {activeFilter === 'Записи' && alertVisible && (
              <div
                className="flex flex-col cursor-pointer active:opacity-85 transition-opacity"
                style={{
                  margin: '0 0 2px',
                  borderRadius: 14,
                  background: '#FFFBEB',
                  border: '1px solid #F59E0B',
                  borderLeft: '3px solid #F59E0B',
                  padding: '10px 12px',
                  boxShadow: '0 2px 12px rgba(251,191,36,0.18)',
                }}
                onClick={() => setAlertModalOpen(true)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center shrink-0 rounded-[9px]"
                    style={{ width: 32, height: 32, background: 'rgba(251,191,36,0.15)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-compact font-semibold text-[13px]" style={{ color: '#92400E' }}>Задержка расшифровок</p>
                    <p className="font-compact text-[12px] truncate mt-0.5" style={{ color: '#B45309' }}>Некоторые расшифровки появятся позже обычного</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); dismissAlert() }}
                    className="flex items-center justify-center shrink-0 active:opacity-60"
                    style={{ padding: 4 }}
                  >
                    <X size={14} strokeWidth={2} style={{ color: '#92400E', opacity: 0.6 }}/>
                  </button>
                </div>
              </div>
            )}

            {/* Promo banner — hidden on "Записи" while alert is visible */}
            {bannerVisible && !(activeFilter === 'Записи' && alertVisible) && (
              <div className="banner-glow rounded-2xl p-[1.5px]">
                <div
                  className="bg-white rounded-[14px] p-4 flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity"
                  onClick={() => {
                    if (activeFilter === 'Записи') navigate('/calls/noise-reduction-promo')
                    else if (activeFilter === 'Секретарь') navigate('/calls/smart-recording-promo')
                    else if (activeFilter === 'Все') navigate('/calls/secretary-plus-promo')
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    {banner.icon === 'secretary'
                      ? <Grid3x3 size={18} className="text-gray-500" strokeWidth={1.8}/>
                      : <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><circle cx="5" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2"/><circle cx="15" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2"/><line x1="5" y1="11" x2="15" y2="11" stroke="#9CA3AF" strokeWidth="2"/></svg>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-bold text-sm text-gray-900">{banner.title}</p>
                    <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">{banner.subtitle}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setBannerVisible(false) }}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 shrink-0"
                  >
                    <X size={14} className="text-gray-500" strokeWidth={2}/>
                  </button>
                </div>
              </div>
            )}

            {filteredLog.map((group, groupIndex) => (
              <div key={group.date}>
                <p className="font-compact font-normal text-[11px] font-semibold px-1 mb-1.5 mt-1" style={{ color: '#8D969F', letterSpacing: '0.4px', textTransform: 'uppercase' }}>{group.date}</p>
                <div className="flex flex-col gap-[6px]">
                  {activeFilter === 'Записи' && groupIndex === 0 && (
                    <div
                      className="bg-white rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity"
                      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}
                      onClick={() => navigate('/calls/smart-recording-promo')}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><circle cx="5" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2"/><circle cx="15" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2"/><line x1="5" y1="11" x2="15" y2="11" stroke="#9CA3AF" strokeWidth="2"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-bold text-sm text-gray-900">Неизвестный номер</p>
                        <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">Запись и итоги разговора</p>
                      </div>
                      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  )}
                  {group.calls.map((entry, callIndex) => (
                    <div key={entry.id} style={{ opacity: entry.notRecorded ? 0.72 : 1 }}>
                      {activeFilter === 'Все' && groupIndex === 1 && callIndex === 2 && (
                        <div
                          className="bg-white rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity mb-3"
                          style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}
                          onClick={() => navigate('/calls/smart-recording-promo')}
                        >
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><circle cx="5" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2"/><circle cx="15" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2"/><line x1="5" y1="11" x2="15" y2="11" stroke="#9CA3AF" strokeWidth="2"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans font-bold text-sm text-gray-900">Неизвестный номер</p>
                            <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">Запись и итоги разговора</p>
                          </div>
                          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 18l6-6-6-6"/>
                            </svg>
                          </div>
                        </div>
                      )}
                      {isCardView && entry.hasRecording ? (
                        <RecordingCard
                          entry={entry}
                          onTranscript={() => {
                            if (activeFilter === 'Секретарь') {
                              setSecretaryEntry(entry)
                            } else {
                              setDetailScreen('transcript')
                              setOpenEntry(entry)
                            }
                          }}
                          onSummary={() => {
                            if (activeFilter === 'Секретарь') {
                              setSecretaryEntry(entry)
                            } else {
                              setDetailScreen('details')
                              setOpenEntry(entry)
                            }
                          }}
                        />
                      ) : (
                        <CallRow
                          entry={entry}
                          onClick={
                            entry.id === '1' ? () => { setDetailScreen('details'); setOpenEntry(entry) } :
                            entry.id === '2' ? () => setSecretaryEntry(entry) :
                            entry.id === '3' ? () => setSecretaryEntry(entry) :
                            entry.id === '5' ? () => setIncomingEntry(entry) :
                            entry.id === '6' ? () => { setDetailScreen('details'); setOpenEntry(entry) } :
                            entry.id === '7' ? () => { setDetailScreen('details'); setOpenEntry(entry) } :
                            entry.id === '8' ? () => setIncomingEntry(entry) :
                            entry.id === '9' ? () => { setDetailScreen('details'); setOpenEntry(entry) } :
                            entry.callType === 'blocked' ? () => setBlockedEntry(entry) :
                            entry.callType === 'protected' ? () => setProtectedEntry(entry) :
                            entry.callType === 'safe' ? () => setSafeEntry(entry) :
                            undefined
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dialpad FAB */}
        <div className="fixed bottom-20 right-4 max-w-app w-full pointer-events-none" style={{ maxWidth: '430px' }}>
          <div className="flex justify-end pointer-events-auto">
            <button className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #4A5285, #1A1D38)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.3a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.1a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="white"/>
              </svg>
            </button>
          </div>
        </div>

        <BottomNav/>

        {/* Delay alert modal */}
        <AnimatePresence>
          {alertModalOpen && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/30" onClick={() => setAlertModalOpen(false)}/>
              <motion.div className="relative w-full max-w-sm"
                initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                style={{ borderRadius: 20, background: 'white', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', padding: '20px 20px 16px' }}>
                <button onClick={() => setAlertModalOpen(false)}
                  className="absolute top-3 right-3 flex items-center justify-center active:opacity-60"
                  style={{ width: 28, height: 28 }}>
                  <X size={15} strokeWidth={2.2} style={{ color: '#1D2023', opacity: 0.35 }}/>
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center rounded-[10px] shrink-0"
                    style={{ width: 36, height: 36, background: 'rgba(251,191,36,0.15)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <p className="font-sans font-bold text-[16px]" style={{ color: '#1D2023' }}>Задержка расшифровок</p>
                </div>
                <div className="rounded-xl px-4 py-3 mb-5" style={{ background: '#F2F3F7' }}>
                  <p className="font-compact text-[14px] leading-relaxed" style={{ color: '#1D2023' }}>
                    Из-за повышенной нагрузки расшифровки некоторых звонков могут появляться в течение 20–30 минут вместо обычных 15 секунд. Записи сохраняются — расшифровки появятся автоматически, как только нагрузка снизится.
                  </p>
                </div>
                <button onClick={dismissAlert}
                  className="w-full rounded-2xl py-3.5 font-sans font-bold text-[16px] text-white active:opacity-85 transition-opacity"
                  style={{ background: '#1D2023' }}>
                  Понятно
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
