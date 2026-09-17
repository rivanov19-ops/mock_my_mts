import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, ArrowUpRight, Play, ArrowLeft, MoreHorizontal, ThumbsUp, ThumbsDown, Bell, FileText, AlignLeft, Search, ArrowUp } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from '../components/layout/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

type CallType = 'outgoing' | 'incoming' | 'secretary' | 'safe' | 'protected' | 'blocked'

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
  duration?: string
  topic?: string
  summary?: CallSummary
  transcript?: TranscriptMsg[]
  noiseReduction?: boolean
  adCall?: boolean
  secretaryDuration?: string
  callerPhone?: string
  favorite?: boolean
  notRecorded?: boolean
}

const PHONE_NUMBER = '+7 916 708-20-28'

const FILTER_OPTIONS = [
  { label: 'Все звонки',   icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { label: 'Полезные',     icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3.5H13l-2.8 2 1.1 3.5L8 9l-3.3 2 1.1-3.5L3 5.5h3.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
  { label: 'Запись',       icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8h2l2-4 2 8 2-6 2 4 1-2h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'Секретарь',    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.2 3.5 3.8.1-3 2.2 1.1 3.7L8 9l-3.1 2 1.1-3.7-3-2.2 3.8-.1L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg> },
  { label: 'Защитник',     icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C8 2 3 4 3 8.5c0 3 2.3 4.8 5 5.5 2.7-.7 5-2.5 5-5.5C13 4 8 2 8 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg> },
]

const CALL_LOG: { date: string; calls: CallEntry[] }[] = [
  {
    date: 'СЕГОДНЯ',
    calls: [
      {
        id: 'r1', name: 'Реклама и опросы',
        callType: 'incoming', typeLabel: 'Входящий', time: '22:22',
        date: 'Сегодня, 22:22 · Входящий · 01:45',
        hasRecording: true, duration: '01:45', adCall: true,
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
        secretaryIcon: true, hasRecording: true, duration: '01:12', favorite: true,
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
        id: 's1', name: 'Бабушка', initials: 'БА', initialsColor: '#7B8EC8',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '21:26',
        date: 'Сегодня, 21:26',
        secretaryIcon: true, secretaryDuration: '40 сек', callerPhone: '+7 916 445-21-83',
        hasRecording: true, duration: '00:40',
        topic: 'Просила передать, чтобы маме перезвонил',
        transcript: [
          { speaker: 'Секретарь', self: true, text: 'Здравствуйте, хозяин сейчас занят. Чем могу помочь?' },
          { speaker: 'Бабушка', self: false, text: 'Алло, это Оля. Передайте, пожалуйста, чтобы маме перезвонил — она ждёт.' },
          { speaker: 'Секретарь', self: true, text: 'Хорошо, обязательно передам. Есть ещё что-нибудь?' },
          { speaker: 'Бабушка', self: false, text: 'Нет, спасибо.' },
          { speaker: 'Секретарь', self: true, text: 'Хорошо, до свидания!' },
        ],
      },
      {
        id: 'r3', name: 'Алёна Романова', initials: 'АР', initialsColor: '#7B8EC8',
        callType: 'incoming', typeLabel: 'Входящий', time: '19:01',
        date: 'Сегодня, 19:01 · Входящий · 06:44',
        hasRecording: true, duration: '06:44', noiseReduction: true, favorite: true,
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
        id: 's2', name: 'Алёна Романова', initials: 'АР', initialsColor: '#7B8EC8',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '18:40',
        date: 'Сегодня, 18:40',
        secretaryIcon: true, secretaryDuration: '55 сек', callerPhone: '+7 925 117-44-02',
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
      {
        id: 'r8', name: '3620',
        callType: 'outgoing', typeLabel: 'Исходящий · Не записан', time: '14:22',
        date: 'Сегодня, 14:22 · Исходящий',
        notRecorded: true, hasRecording: true,
        topic: 'Сервисный номер — запись недоступна',
      },
      {
        id: '1', name: 'Мама', initials: 'М', initialsColor: '#FF2D55',
        callType: 'outgoing', typeLabel: 'Исходящий', time: '09:56',
        date: 'Сегодня, 09:56 · Исходящий · 02:29',
        hasRecording: true, duration: '02:29', noiseReduction: true,
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
        id: '2', name: 'Бабушка', initials: 'БА', initialsColor: '#7B8EC8',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '21:26',
        date: 'Вчера, 21:26 · Секретарь · 02:40',
        secretaryIcon: true, hasRecording: true, duration: '02:40', favorite: true,
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
          shareText: 'Бабушка просила передать маме, чтобы та перезвонила.',
        },
        transcript: [
          { speaker: 'Бабушка', self: false, text: 'Алло!' },
          { speaker: 'Секретарь', self: true, text: 'Здравствуйте, хозяин сейчас занят. Чем могу помочь?' },
          { speaker: 'Бабушка', self: false, text: 'Передайте, чтоб маме перезвонил.' },
          { speaker: 'Секретарь', self: true, text: 'Хорошо, обязательно передам.' },
        ],
      },
      {
        id: '3', name: 'Бабушка', initials: 'БА', initialsColor: '#7B8EC8',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '21:22',
        date: 'Вчера, 21:22 · Секретарь · 00:15',
        secretaryIcon: true, hasRecording: true, duration: '00:15',
        topic: 'Короткий звонок, не оставила сообщения',
        transcript: [
          { speaker: 'Бабушка', self: false, text: 'Алло, ты там?' },
          { speaker: 'Секретарь', self: true, text: 'Хозяин сейчас занят.' },
          { speaker: 'Бабушка', self: false, text: 'Ладно, потом.' },
        ],
      },
      { id: '10', name: '+7 925 878 98 76', callType: 'safe', typeLabel: 'Безопасный звонок', time: '18:45', favorite: true },
    ],
  },
  {
    date: '1 АПРЕЛЯ',
    calls: [
      {
        id: 's3', name: 'Иван Васильев', initials: 'ИВ', initialsColor: '#7B8EC8',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '20:05',
        date: '1 апреля, 20:05',
        secretaryIcon: true, secretaryDuration: '1 мин 10 сек', callerPhone: '+7 926 831-77-55',
        hasRecording: true, duration: '01:10', favorite: true,
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
      {
        id: 's4', name: 'Мама', initials: 'М', initialsColor: '#FF2D55',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '14:30',
        date: '1 апреля, 14:30',
        secretaryIcon: true, secretaryDuration: '45 сек', callerPhone: '+7 909 765-32-10',
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
        secretaryIcon: true, secretaryDuration: '1 мин 20 сек', callerPhone: '+7 800 250-02-02',
        hasRecording: true, duration: '01:20', favorite: true,
        topic: 'Курьер не нашёл подъезд, ждёт 10 минут у первого входа',
        transcript: [
          { speaker: 'Секретарь', self: true, text: 'Добрый день! Хозяин недоступен. Слушаю вас.' },
          { speaker: 'Курьер Ozon', self: false, text: 'Здравствуйте, я курьер Ozon. У меня посылка, не могу найти нужный подъезд — их тут несколько.' },
          { speaker: 'Секретарь', self: true, text: 'К сожалению, уточнить у хозяина прямо сейчас не могу. Оставьте сообщение.' },
          { speaker: 'Курьер Ozon', self: false, text: 'Хорошо, подожду 10 минут у первого подъезда слева.' },
          { speaker: 'Секретарь', self: true, text: 'Понял, передам — вы ждёте 10 минут у первого подъезда слева.' },
        ],
      },
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
        id: 's6', name: 'МТС', initials: 'МТ', initialsColor: '#E30611',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '13:00',
        date: '30 марта, 13:00',
        secretaryIcon: true, secretaryDuration: '30 сек', callerPhone: '+7 800 250-08-90',
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
        secretaryIcon: true, secretaryDuration: '50 сек', callerPhone: '+7 495 739-70-00',
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
  {
    date: '29 МАРТА',
    calls: [
      {
        id: 's8', name: '+7 926 555 33 11',
        callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '19:30',
        date: '29 марта, 19:30',
        secretaryIcon: true, secretaryDuration: '35 сек', callerPhone: '+7 926 555-33-11',
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

// ─── Onboarding ──────────────────────────────────────────────────────────────


function PhoneMockup({ highlightContacts }: { highlightContacts?: boolean }) {
  return (
    <div className="relative mx-auto" style={{ width: 200, height: 380 }}>
      {/* Phone frame */}
      <div className="absolute inset-0 rounded-[28px] overflow-hidden border-[6px] border-[#1D2023]" style={{ background: '#F2F3F7' }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1" style={{ background: '#F2F3F7' }}>
          <span className="text-[8px] font-bold text-[#1D2023]">9:41</span>
          <div className="w-12 h-3 rounded-full bg-[#1D2023] mx-auto absolute left-1/2 -translate-x-1/2 top-2"/>
          <div className="flex gap-1 items-center">
            <svg width="10" height="7" viewBox="0 0 10 7" fill="none"><rect x="0" y="3" width="2" height="4" rx="0.5" fill="#1D2023"/><rect x="3" y="2" width="2" height="5" rx="0.5" fill="#1D2023"/><rect x="6" y="1" width="2" height="6" rx="0.5" fill="#1D2023"/><rect x="9" y="0" width="1" height="7" rx="0.5" fill="#1D2023" opacity="0.3"/></svg>
            <svg width="8" height="6" viewBox="0 0 8 6" fill="#1D2023"><path d="M4 1.5C5.2 1.5 6.2 2 6.9 2.8L8 1.7C6.9 0.6 5.5 0 4 0C2.5 0 1.1 0.6 0 1.7L1.1 2.8C1.8 2 2.8 1.5 4 1.5Z"/><path d="M4 3.5C4.7 3.5 5.3 3.8 5.8 4.2L7 3C6.1 2.2 5.1 1.8 4 1.8C2.9 1.8 1.9 2.2 1 3L2.2 4.2C2.7 3.8 3.3 3.5 4 3.5Z"/><circle cx="4" cy="5.5" r="0.8"/></svg>
            <svg width="16" height="8" viewBox="0 0 16 8" fill="none"><rect x="0.5" y="0.5" width="13" height="7" rx="2" stroke="#1D2023" strokeOpacity="0.35"/><rect x="1.5" y="1.5" width="10" height="5" rx="1.2" fill="#1D2023"/><path d="M14.5 2.5v3a1.5 1.5 0 0 0 0-3Z" fill="#1D2023" fillOpacity="0.4"/></svg>
          </div>
        </div>
        {/* Header */}
        <div className="px-3 pt-1 pb-2" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(249,249,251,0.65) 55%, #F2F3F7 100%), url(/undercover.svg) top center/100% auto no-repeat' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-sans font-black text-[13px]" style={{ color: '#1D2023' }}>Звонки</span>
            <div className="flex gap-1">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(29,32,35,0.07)' }}>
                <span className="text-[6px] font-bold" style={{ color: '#1D2023' }}>КТЛ</span>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center relative ${highlightContacts ? 'ring-2 ring-[#E30613]' : ''}`} style={{ background: 'rgba(29,32,35,0.07)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1D2023" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {highlightContacts && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E30613]"/>}
              </div>
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(29,32,35,0.07)' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1D2023" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {['Все','Секретарь','Записи'].map((t, i) => (
              <div key={t} className="rounded-full px-2 py-0.5 text-[7px] font-semibold" style={{ background: i === 0 ? '#1D2023' : 'rgba(29,32,35,0.07)', color: i === 0 ? 'white' : '#1D2023' }}>{t}</div>
            ))}
          </div>
        </div>
        {/* Call list */}
        <div className="px-2 flex flex-col gap-1 mt-1">
          {[
            { initials: 'АЛ', color: '#8390FF', name: 'Алёна', sub: '✦ Ответил Секретарь', time: '19:01' },
            { initials: null, color: '#9CA3AF', name: 'Товары и услуги', sub: '✦ Ответил Защитник', time: '14:45' },
            { initials: 'ИВ', color: '#7B8EC8', name: 'Иван Васильев', sub: '↗ Исходящий', time: '12:34' },
            { initials: 'М', color: '#FF2D55', name: 'Маша', sub: '↙ Входящий', time: '11:23' },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-white rounded-xl px-2 py-1.5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white font-bold" style={{ fontSize: 7, background: c.color }}>
                {c.initials || <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="9" r="5"/><path d="M3 22c0-6 18-6 18 0"/></svg>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-bold truncate" style={{ color: '#1D2023' }}>{c.name}</p>
                <p className="text-[6px]" style={{ color: '#8D969F' }}>{c.sub}</p>
              </div>
              <span className="text-[6px] shrink-0" style={{ color: '#8D969F' }}>{c.time}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Notch */}
      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-16 h-4 rounded-b-2xl bg-[#1D2023] z-10"/>
    </div>
  )
}

function OnboardingFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)

  const finish = () => {
    onDone()
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        className="fixed inset-0 z-[100] flex justify-center"
        style={{ background: 'white' }}
        initial={{ opacity: 0, x: step === 0 ? 0 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.25 }}
      >
        <div className="w-full max-w-app flex flex-col h-full">

          {step === 0 && <>
            {/* Top bar */}
            <div className="flex items-center px-4 pt-12 pb-2">
              <button onClick={finish} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: 'rgba(29,32,35,0.07)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#1D2023" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
              <div className="flex-1 flex justify-center">
                <span className="font-sans font-bold text-sm tracking-widest" style={{ color: '#8D969F', letterSpacing: '0.2em' }}>VOIC<span style={{ color: '#1D2023' }}>E</span>TECH</span>
              </div>
              <div className="w-9"/>
            </div>
            {/* Illustration — full width, fills remaining space */}
            <div className="flex-1 min-h-0 mx-4 mb-4 rounded-[32px] relative overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #dde4ff 0%, #c5ceff 40%, #b8c8f8 70%, #d4c5f9 100%)', minHeight: 0 }}>
              <div className="absolute w-56 h-56 rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', top: '-10%', left: '-5%' }}/>
              <div className="absolute w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', bottom: '5%', right: '-5%' }}/>
              {/* Scattered service name pills */}
              {/* Row 1 - top left */}
              <div className="absolute" style={{ top: '8%', left: '5%', transform: 'rotate(-7deg)' }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans font-bold text-sm shadow-md" style={{ background: 'rgba(255,255,255,0.9)', color: '#5856D6' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5856D6" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.3a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.1a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Секретарь+
                </div>
              </div>

              {/* Row 1 - top right */}
              <div className="absolute" style={{ top: '5%', right: '4%', transform: 'rotate(6deg)' }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans font-bold text-sm shadow-md" style={{ background: 'rgba(255,255,255,0.9)', color: '#E30613' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Защитник
                </div>
              </div>

              {/* Row 2 - left */}
              <div className="absolute" style={{ top: '28%', left: '3%', transform: 'rotate(3deg)' }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans font-bold text-sm shadow-md" style={{ background: 'rgba(255,255,255,0.9)', color: '#007AFF' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                  Безопасный звонок
                </div>
              </div>

              {/* Row 2 - right */}
              <div className="absolute" style={{ top: '30%', right: '3%', transform: 'rotate(-5deg)' }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans font-bold text-sm shadow-md" style={{ background: 'rgba(255,255,255,0.9)', color: '#00C7BE' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C7BE" strokeWidth="2" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
                  Шумоподавление
                </div>
              </div>

              {/* Row 3 - center-left */}
              <div className="absolute" style={{ top: '50%', left: '6%', transform: 'rotate(-4deg)' }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans font-bold text-sm shadow-md" style={{ background: 'rgba(255,255,255,0.9)', color: '#FF9500' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><polyline points="8 18 8 13 16 13 16 18"/></svg>
                  Интеллектуальная запись
                </div>
              </div>

              {/* Row 3 - right */}
              <div className="absolute" style={{ top: '52%', right: '4%', transform: 'rotate(5deg)' }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans font-bold text-sm shadow-md" style={{ background: 'rgba(255,255,255,0.9)', color: '#5856D6' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5856D6" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.3a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.1a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Секретарь+
                </div>
              </div>

              {/* Row 4 - bottom left */}
              <div className="absolute" style={{ bottom: '18%', left: '4%', transform: 'rotate(4deg)' }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans font-bold text-sm shadow-md" style={{ background: 'rgba(255,255,255,0.9)', color: '#E30613' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Защитник
                </div>
              </div>

              {/* Row 4 - bottom right */}
              <div className="absolute" style={{ bottom: '15%', right: '3%', transform: 'rotate(-6deg)' }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans font-bold text-sm shadow-md" style={{ background: 'rgba(255,255,255,0.9)', color: '#007AFF' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                  Безопасный звонок
                </div>
              </div>
            </div>
            {/* Text + CTA */}
            <div className="px-6 pb-24">
              <h2 className="font-sans font-black text-2xl mb-2" style={{ color: '#1D2023' }}>Новый раздел Звонки</h2>
              <p className="font-compact text-sm leading-relaxed mb-6" style={{ color: '#8D969F' }}>
                Стало удобнее находить вызовы, а привычные функции остались на своих местах
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full py-4 rounded-2xl font-sans font-black text-sm uppercase tracking-wide text-white active:opacity-80 transition-opacity"
                style={{ background: '#1D2023' }}>
                Что изменилось
              </button>
            </div>
            <BottomNav/>
          </>}

          {step === 1 && <>
            <div className="flex items-center justify-between px-4 pt-12 pb-4">
              <button onClick={finish} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: 'rgba(29,32,35,0.07)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#1D2023" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
              <span className="font-sans font-bold text-base" style={{ color: '#1D2023' }}>Звонки</span>
              <div className="w-9"/>
            </div>
            <div className="flex-1 flex items-center justify-center px-4">
              <PhoneMockup/>
            </div>
            <div className="px-6 pb-12">
              <h2 className="font-sans font-black text-2xl mb-2" style={{ color: '#1D2023' }}>Обновили раздел Звонки</h2>
              <p className="font-compact text-sm leading-relaxed mb-6" style={{ color: '#8D969F' }}>
                Стало удобнее находить вызовы, а привычные функции остались на своих местах
              </p>
              <button
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-2xl font-sans font-black text-sm uppercase tracking-wide text-white active:opacity-80 transition-opacity mb-4"
                style={{ background: '#1D2023' }}>
                Далее
              </button>
              <div className="flex justify-center gap-1.5">
                <div className="w-4 h-1.5 rounded-full" style={{ background: '#1D2023' }}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(29,32,35,0.2)' }}/>
              </div>
            </div>
          </>}

          {step === 2 && <>
            <div className="flex items-center justify-between px-4 pt-12 pb-4">
              <button onClick={finish} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: 'rgba(29,32,35,0.07)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#1D2023" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
              <span className="font-sans font-bold text-base" style={{ color: '#1D2023' }}>Звонки</span>
              <div className="w-9"/>
            </div>
            <div className="flex-1 flex items-center justify-center px-4">
              <PhoneMockup highlightContacts/>
            </div>
            <div className="px-6 pb-12">
              <h2 className="font-sans font-black text-2xl mb-2" style={{ color: '#1D2023' }}>Где найти контакты</h2>
              <p className="font-compact text-sm leading-relaxed mb-6" style={{ color: '#8D969F' }}>
                Чтобы открыть сохранённые номера, нажмите кнопку в правом верхнем углу
              </p>
              <button
                onClick={finish}
                className="w-full py-4 rounded-2xl font-sans font-black text-sm uppercase tracking-wide text-white active:opacity-80 transition-opacity mb-4"
                style={{ background: '#1D2023' }}>
                Понятно
              </button>
              <div className="flex justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(29,32,35,0.2)' }}/>
                <div className="w-4 h-1.5 rounded-full" style={{ background: '#1D2023' }}/>
              </div>
            </div>
          </>}

        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CallAvatar({ initials, initialsColor, callType }: { initials?: string; initialsColor?: string; callType: CallType }) {
  const hasInitials = !!initials
  return (
    <div className="relative shrink-0 w-[52px] h-[52px]">
      <div className={`w-[52px] h-[52px] flex items-center justify-center overflow-hidden ${hasInitials ? 'rounded-2xl' : 'rounded-full'}`}
        style={{ background: hasInitials ? initialsColor : '#D1D5DB' }}>
        {hasInitials
          ? <span className="text-white font-sans font-bold text-base">{initials}</span>
          : <svg width="34" height="34" viewBox="0 0 34 34" fill="none"><circle cx="17" cy="13" r="7" fill="#9CA3AF"/><path d="M3 30c0-7.732 6.268-12 14-12s14 4.268 14 12" fill="#9CA3AF"/></svg>
        }
      </div>
      {callType === 'secretary' && hasInitials && (
        <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: '0 0 0 1.5px #E5E7EB' }}>
          <span style={{ fontSize: 10 }}>✦</span>
        </div>
      )}
      {callType !== 'secretary' && (
        <div className="absolute -bottom-0.5 -left-0.5 w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center" style={{ boxShadow: '0 0 0 1.5px #E5E7EB' }}>
          <ArrowUpRight size={10} strokeWidth={2.5} className="text-gray-400"/>
        </div>
      )}
    </div>
  )
}

// ─── Call type icon ───────────────────────────────────────────────────────────

function CallTypeIcon({ callType }: { callType: CallType }) {
  if (callType === 'secretary') return <span style={{ fontSize: 11, color: '#8B9CF4' }}>✦</span>
  if (callType === 'incoming') return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M9 2L2 9M2 9h5M2 9V4" stroke="#34C759" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (callType === 'outgoing') return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M2 9L9 2M9 2H4M9 2v5" stroke="#8D969F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (callType === 'safe') return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M5.5 1C5.5 1 2 2.5 2 5.5c0 2 1.5 3.2 3.5 3.7C7.5 8.7 9 7.5 9 5.5 9 2.5 5.5 1 5.5 1Z" stroke="#007AFF" strokeWidth="1.5"/>
    </svg>
  )
  if (callType === 'protected') return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M5.5 1C5.5 1 2 2.5 2 5.5c0 2 1.5 3.2 3.5 3.7C7.5 8.7 9 7.5 9 5.5 9 2.5 5.5 1 5.5 1Z" stroke="#FF9500" strokeWidth="1.5"/>
    </svg>
  )
  if (callType === 'blocked') return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M5.5 1C5.5 1 2 2.5 2 5.5c0 2 1.5 3.2 3.5 3.7C7.5 8.7 9 7.5 9 5.5 9 2.5 5.5 1 5.5 1Z" stroke="#E30613" strokeWidth="1.5"/>
    </svg>
  )
  return null
}

// ─── Call row ─────────────────────────────────────────────────────────────────

function CallRow({ entry, onClick }: { entry: CallEntry; onClick?: () => void }) {
  const hasTranscript = !!(entry.hasRecording || entry.transcript)
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-white text-left active:opacity-85 transition-opacity"
      style={{ borderRadius: 22, padding: '11px 14px 11px 11px', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
    >
      <CallAvatar initials={entry.initials} initialsColor={entry.initialsColor} callType={entry.callType}/>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <p className="font-sans text-[15px] font-semibold truncate" style={{ color: '#1D2023' }}>{entry.name}</p>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {entry.noiseReduction && (
              <div className="flex items-center gap-1 px-1.5 py-[3px] rounded-full" style={{ background: '#E5F9F8' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00C7BE" strokeWidth="2.2" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
                <span className="font-sans font-bold text-[10px]" style={{ color: '#00C7BE' }}>HD</span>
              </div>
            )}
            {hasTranscript && (
              <div className="flex items-center gap-[2px] px-1.5 py-[3px] rounded-full" style={{ background: '#F0F0F7' }}>
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 4.5h5" stroke="#8B9CF4" strokeWidth="1.4" strokeLinecap="round"/><path d="M4.5 2.5L6.5 4.5l-2 2" stroke="#8B9CF4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

// ─── List rows ────────────────────────────────────────────────────────────────


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
  const [reminderToast, setReminderToast] = useState(false)
  const [favoriteToast, setFavoriteToast] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [savedNote, setSavedNote] = useState('')
  const summary = entry.summary

  const showReminderToast = () => {
    setReminderToast(true)
    setTimeout(() => setReminderToast(false), 2500)
  }

  const doShare = () => {
    const text = summary?.shareText || entry.name
    if (navigator.share) navigator.share({ text }).catch(() => {})
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => alert('Скопировано'))
  }

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        <div className="px-4 pt-12 pb-0 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0">
              <ArrowLeft size={22} className="text-gray-900" strokeWidth={2}/>
            </button>
            <CallAvatar initials={entry.initials} initialsColor={entry.initialsColor} callType={entry.callType}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-sans font-bold text-base text-gray-900 truncate">{entry.name}</p>
                {entry.favorite && (
                  <button onClick={() => { setFavoriteToast(true); setTimeout(() => setFavoriteToast(false), 2500) }}
                    style={{ color: '#FFB800', fontSize: 14, lineHeight: 1, flexShrink: 0 }} className="active:opacity-60">★</button>
                )}
              </div>
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
          <div className="border-b-2 border-blue-500 pb-2.5">
            <span className="font-sans font-semibold text-[15px] text-gray-900">Итоги разговора</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 bg-gray-50">
          {entry.adCall && (
            <>
              <div className="flex gap-2 mb-3">
                <button className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3.5 active:opacity-80 transition-opacity" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8D969F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span className="font-compact text-[14px]" style={{ color: '#1D2023' }}>В полезное</span>
                </button>
                <button
                  onClick={() => { setNoteDraft(savedNote); setShowNoteModal(true) }}
                  className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3.5 active:opacity-80 transition-opacity"
                  style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}
                >
                  {savedNote ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8D969F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      <span className="font-compact text-[14px]" style={{ color: '#1D2023' }}>Редактировать</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8D969F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      <span className="font-compact text-[14px]" style={{ color: '#1D2023' }}>Заметка</span>
                    </>
                  )}
                </button>
              </div>
              {savedNote && (
                <button
                  onClick={() => { setNoteDraft(savedNote); setShowNoteModal(true) }}
                  className="w-full bg-white rounded-2xl overflow-hidden mb-3 text-left active:opacity-80 transition-opacity"
                  style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}
                >
                  <div className="px-4 py-3.5">
                    <p className="font-compact text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8D969F' }}>Заметка</p>
                    <p className="font-compact text-[14px] leading-relaxed" style={{ color: '#1D2023' }}>{savedNote}</p>
                  </div>
                </button>
              )}
            </>
          )}
          {summary ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <TemplateBadge label={tplLabel} color={tplColor} onSelect={t => { setTplLabel(t.label); setTplColor(t.color) }}/>
                <div className="flex gap-2">
                  <button onClick={() => setRating(r => r === 'up' ? null : 'up')} className="rounded-full px-3 py-2 flex items-center" style={{ background: rating === 'up' ? '#34C75922' : '#F2F2F7' }}>
                    <ThumbsUp size={17} color={rating === 'up' ? '#34C759' : '#8E8E93'} strokeWidth={1.8}/>
                  </button>
                  <button onClick={() => setRating(r => r === 'down' ? null : 'down')} className="rounded-full px-3 py-2 flex items-center" style={{ background: rating === 'down' ? '#FF3B3022' : '#F2F2F7' }}>
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

        {/* Favorite toast */}
        <AnimatePresence>
          {favoriteToast && (
            <motion.div
              className="fixed bottom-24 left-0 right-0 flex justify-center z-50 px-5 pointer-events-none"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={{ background: '#1D2023', boxShadow: '0 4px 20px rgba(0,0,0,0.28)' }}>
                <div className="w-5 h-5 rounded-full bg-[#FFB800] flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-compact text-[14px] text-white">Звонок добавлен в Полезное</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Note modal */}
        <AnimatePresence>
          {showNoteModal && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowNoteModal(false)}/>
              <motion.div
                className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              >
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-sans font-bold text-[17px]" style={{ color: '#1D2023' }}>
                      {savedNote ? 'Заметка' : 'Создать заметку'}
                    </p>
                    <button onClick={() => setShowNoteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-100" style={{ background: '#F2F3F7' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke="#8D969F" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                  <p className="font-compact text-[13px] mb-4" style={{ color: '#8D969F' }}>Дополните звонок своим комментарием</p>
                  <textarea
                    value={noteDraft}
                    onChange={e => setNoteDraft(e.target.value)}
                    placeholder="Заметка"
                    autoFocus
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 font-compact text-[15px] resize-none outline-none"
                    style={{ border: '1.5px solid #007AFF', color: '#1D2023', background: 'white', minHeight: 88 }}
                  />
                  <button
                    disabled={!noteDraft.trim()}
                    onClick={() => { setSavedNote(noteDraft.trim()); setShowNoteModal(false) }}
                    className="w-full mt-4 py-4 rounded-2xl font-sans font-bold text-[15px] transition-colors"
                    style={{ background: noteDraft.trim() ? '#1D2023' : '#F2F3F7', color: noteDraft.trim() ? 'white' : '#C7CFD4', letterSpacing: '0.06em' }}
                  >
                    СОХРАНИТЬ
                  </button>
                  {savedNote && (
                    <button
                      onClick={() => { setSavedNote(''); setShowNoteModal(false) }}
                      className="w-full mt-3 py-3 font-sans font-bold text-[15px] tracking-wider"
                      style={{ color: '#FF3B30', letterSpacing: '0.06em' }}
                    >
                      УДАЛИТЬ
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

// ─── Transcript screen ────────────────────────────────────────────────────────

function TranscriptScreen({ entry, onBack }: { entry: CallEntry; onBack: () => void }) {
  const [showPlayer, setShowPlayer] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const initials = entry.initials || entry.name.slice(0, 2).toUpperCase()
  const initialsColor = entry.initialsColor || '#9CA3AF'
  const summaryText = entry.summary?.blocks[0]?.content || ''

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* Header */}
        <div className="px-4 pt-12 pb-3 flex items-center gap-3 bg-white border-b border-gray-100">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0">
            <ArrowLeft size={22} className="text-gray-900" strokeWidth={2}/>
          </button>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: initialsColor }}>
            <span className="text-white font-sans font-bold text-sm">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-bold text-base text-gray-900 truncate">{entry.name}</p>
            <p className="font-compact font-normal text-xs text-gray-400">{PHONE_NUMBER}</p>
          </div>
          <button onClick={() => setShowMenu(true)} className="w-9 h-9 flex items-center justify-center shrink-0">
            <MoreHorizontal size={22} className="text-gray-700" strokeWidth={2}/>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="px-4 pt-5">

            {/* Call meta */}
            <p className="font-compact font-normal text-sm text-gray-400 mb-1">{entry.date}</p>
            <div className="flex items-center gap-2 mb-4">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2C2 2 3 0.5 4.5 2L6 3.5C6.5 4 6 5 5.5 5.5C5 6 5.5 7 6.5 8C7.5 9 8.5 9.5 9 9C9.5 8.5 10.5 8 11 8.5L12.5 10C14 11.5 12.5 12.5 12.5 12.5C9.5 15 -0.5 5 2 2Z" fill="#4B5563"/>
              </svg>
              <span className="font-sans font-bold text-base text-gray-900">
                {entry.typeLabel}{' '}
                <span className="font-compact font-normal text-base text-gray-400">{entry.duration}</span>
              </span>
            </div>

            {/* Audio controls */}
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setShowPlayer(true)} className="flex items-center gap-2 bg-gray-100 rounded-full px-5 py-2.5 active:bg-gray-200 transition-colors">
                <Play size={13} fill="#1A1A1A" color="#1A1A1A"/>
                <span className="font-sans font-bold text-sm text-gray-900">Слушать</span>
              </button>
              <button onClick={() => setShowSummary(true)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors">
                <AlignLeft size={16} className="text-gray-700" strokeWidth={1.8}/>
              </button>
            </div>

            <div className="border-t border-gray-100 mb-5"/>

            {/* Expiry note */}
            <p className="font-compact font-normal text-xs text-gray-400 text-center mb-5">
              Детали звонка удалятся через 90 дней
            </p>

            {/* Transcript bubbles */}
            <div className="flex flex-col gap-3">
              {(entry.transcript || []).map((msg, i) => (
                <div key={i} className={`flex flex-col gap-0.5 ${msg.self ? 'items-end' : 'items-start'}`}>
                  {!msg.self && (
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: initialsColor }}>
                        <span className="text-white font-sans font-bold" style={{ fontSize: 9 }}>{initials}</span>
                      </div>
                      <span className="font-sans font-bold text-sm text-gray-900">{entry.name}</span>
                    </div>
                  )}
                  <div className={`max-w-[78%] px-4 py-3 rounded-2xl ${
                    msg.self
                      ? 'bg-gray-200 text-gray-900 rounded-tr-sm'
                      : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                  }`}>
                    <p className="font-compact font-normal text-base leading-snug">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
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
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <span className="font-sans font-bold text-xs text-gray-700">x1</span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11a7 7 0 1 0 1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/><path d="M4 5v4h4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><text x="8" y="15" fontSize="5" fill="#374151" fontFamily="sans-serif" fontWeight="bold">10</text></svg>
                    </button>
                    <button onClick={() => setIsPlaying(p => !p)} className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center active:scale-95 transition-transform">
                      {isPlaying
                        ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="4" height="14" rx="1.5" fill="white"/><rect x="12" y="3" width="4" height="14" rx="1.5" fill="white"/></svg>
                        : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 3.5L16.5 10 5 16.5V3.5Z" fill="white"/></svg>
                      }
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

        {/* Summary sheet */}
        <AnimatePresence>
          {showSummary && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/30" onClick={() => setShowSummary(false)}/>
              <motion.div className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
                <div className="px-5 pt-3 pb-10">
                  <div className="flex items-start justify-between mb-1">
                    <h2 className="font-sans font-bold text-xl text-gray-900">Итоги разговора</h2>
                    <button onClick={() => setShowSummary(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 shrink-0 ml-2 active:bg-gray-200">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                  <p className="font-compact font-normal text-sm text-gray-400 mb-5 leading-snug">
                    Составлены при помощи ИИ, возможны неточности
                  </p>
                  <p className="font-compact font-normal text-base text-gray-900 leading-relaxed">{summaryText}</p>
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
                  <button onClick={() => setShowMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
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


// ─── Contacts ─────────────────────────────────────────────────────────────────

const CONTACTS_DATA = [
  { name: 'Мама',             initials: 'М',  color: '#FF2D55',  phone: undefined as string | undefined,            lastCall: 'Сегодня, 09:56 · Исходящий' },
  { name: 'МТС',              initials: 'МТ', color: '#E30611',  phone: undefined as string | undefined,            lastCall: '12 февраля, 11:00 · Входящий' },
  { name: 'Бабушка',          initials: 'БА', color: '#7B8EC8',  phone: undefined as string | undefined,            lastCall: 'Вчера, 21:26 · Ответил Секретарь' },
  { name: 'Алёна Романова',   initials: 'АР', color: '#7B8EC8',  phone: undefined as string | undefined,            lastCall: 'Сегодня, 19:01 · Входящий' },
  { name: 'Иван Васильев',    initials: 'ИВ', color: '#7B8EC8',  phone: undefined as string | undefined,            lastCall: '1 апреля, 20:05 · Ответил Секретарь' },
  { name: 'Курьер Ozon',      initials: 'OZ', color: '#0070E5',  phone: undefined as string | undefined,            lastCall: '31 марта, 16:05 · Ответил Секретарь' },
  { name: 'Яндекс Еда',       initials: 'ЯЕ', color: '#FF2D55',  phone: undefined as string | undefined,            lastCall: '31 марта, 13:15 · Входящий' },
  { name: '+7 925 878 98 76', initials: '78', color: '#8D969F',  phone: '+7 925 878 98 76' as string | undefined,   lastCall: '13 февраля, 15:22 · Базовая защита' },
  { name: '+7 926 111-22-33', initials: '79', color: '#8D969F',  phone: '+7 926 111-22-33' as string | undefined,   lastCall: '12 февраля, 14:30 · Исходящий' },
  { name: '+7 926 555 33 11', initials: '79', color: '#8D969F',  phone: '+7 926 555 33 11' as string | undefined,   lastCall: '29 марта, 19:30 · Ответил Секретарь' },
  { name: '+7 926 777 88 16', initials: '79', color: '#8D969F',  phone: '+7 926 777 88 16' as string | undefined,   lastCall: 'Вчера, 18:45 · Безопасный звонок' },
  { name: '+7 989 777 88 11', initials: '79', color: '#8D969F',  phone: '+7 989 777 88 11' as string | undefined,   lastCall: '12 февраля, 17:33 · Ответил Защитник' },
  { name: '3620',             initials: '36', color: '#8D969F',  phone: '3620' as string | undefined,               lastCall: 'Сегодня, 14:22 · Исходящий' },
]

function avatarGradientForContact(color: string) {
  if (color === '#8D969F') return 'linear-gradient(180deg, #C7CFD4, #758091)'
  return `linear-gradient(180deg, ${color}99, ${color})`
}

function ContactsScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('')
  const named = CONTACTS_DATA.filter(c => !c.phone).sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  const numbers = CONTACTS_DATA.filter(c => !!c.phone).sort((a, b) => a.name.localeCompare(b.name))
  const filterFn = (list: typeof CONTACTS_DATA) =>
    query ? list.filter(c => c.name.toLowerCase().includes(query.toLowerCase())) : list
  const filteredNamed = filterFn(named)
  const filteredNumbers = filterFn(numbers)

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
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0 active:opacity-60">
            <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
          </button>
          <h1 className="font-sans font-black text-xl flex-1" style={{ color: '#1D2023' }}>Контакты</h1>
          <span className="font-compact text-sm" style={{ color: '#8D969F' }}>{filteredNamed.length + filteredNumbers.length}</span>
        </div>
        <div className="px-4 pb-3 bg-white">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: '#F2F3F7' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8D969F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск"
              className="flex-1 bg-transparent outline-none font-compact text-sm" style={{ color: '#1D2023' }}/>
            {query && (
              <button onClick={() => setQuery('')} className="active:opacity-60">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#8D969F" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
        </div>
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

export default function Calls() {
  const navigate = useNavigate()
  const [openEntry, setOpenEntry] = useState<CallEntry | null>(null)
  const [showContacts, setShowContacts] = useState(false)
  const [detailScreen, setDetailScreen] = useState<DetailScreen>('details')
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [filter, setFilter] = useState('Все звонки')
  const [filterOpen, setFilterOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  if (showContacts) { return <ContactsScreen onBack={() => setShowContacts(false)}/> }
  if (openEntry && detailScreen === 'transcript') {
    return <TranscriptScreen entry={openEntry} onBack={() => setDetailScreen('details')}/>
  }
  if (openEntry) {
    return <DetailsScreen entry={openEntry} onBack={() => setOpenEntry(null)} onTranscript={() => setDetailScreen('transcript')}/>
  }

  return (
    <>
    {showOnboarding && <OnboardingFlow onDone={() => setShowOnboarding(false)}/>}
    <div className="h-screen flex justify-center overflow-hidden" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col h-full relative">

        {/* ── Header (ToBe-style) ── */}
        <div
          className="px-4 pt-12 pb-3 flex-shrink-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(249,249,251,0.65) 55%, #F2F3F7 100%), url(/undercover.svg) top center/100% auto no-repeat',
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-sans font-black text-[1.75rem] leading-tight" style={{ color: '#1D2023' }}>Звонки</h1>
              <p className="font-compact font-normal text-sm" style={{ color: '#8D969F' }}>{PHONE_NUMBER}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => navigate('/calls/tobe')} className="flex items-center active:opacity-50 transition-opacity">
                <span className="font-compact text-xs underline underline-offset-2" style={{ color: 'rgba(29,32,35,0.35)' }}>ToBe</span>
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
        </div>

        {/* ── Content ── */}
        {(() => {
          const filteredLog = CALL_LOG.map(group => ({
            ...group,
            calls: group.calls.filter(c => {
              if (filter === 'Все звонки') return true
              if (filter === 'Полезные') return !!c.favorite
              if (filter === 'Запись') return c.callType === 'incoming' || c.callType === 'outgoing'
              if (filter === 'Секретарь') return c.callType === 'secretary'
              if (filter === 'Защитник') return c.callType === 'protected' || c.callType === 'blocked' || c.callType === 'safe'
              return true
            })
          })).filter(g => g.calls.length > 0)

          return (
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto pb-40"
              onScroll={() => setScrolled((contentRef.current?.scrollTop ?? 0) > 60)}
            >
              <div className="px-4 pt-3 flex flex-col gap-1">
                {filteredLog.map(group => (
                  <div key={group.date}>
                    <p className="font-compact text-[11px] font-semibold tracking-widest mb-2 mt-3 px-1"
                      style={{ color: '#8D969F' }}>{group.date}</p>
                    <div className="flex flex-col gap-1">
                      {group.calls.map(entry => (
                        <div key={entry.id}>
                          <CallRow
                            entry={entry}
                            onClick={() => setOpenEntry(entry)}
                          />
                          {entry.id === '2' && (
                            <div className="mt-2 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #E30611 0%, #B80010 100%)', boxShadow: '0 2px 12px rgba(227,6,17,0.22)' }}>
                              <div className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                    <span className="text-[18px]">🎙</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-sans font-bold text-[13px] text-white leading-snug">Секретарь ответил — хотите ещё и запись?</p>
                                    <p className="font-compact text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>Секретарь+ включает оба сервиса в одной подписке</p>
                                    <button className="mt-2.5 px-3.5 py-1.5 rounded-full font-compact font-semibold text-[12px]" style={{ background: 'white', color: '#E30611' }}>
                                      Попробовать
                                    </button>
                                  </div>
                                  <button className="mt-0.5 active:opacity-60" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ── Floating filter bar ── */}
        <div
          className="fixed inset-x-0 z-40 flex justify-center pointer-events-none"
          style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 10px)' }}
        >
          <div className="w-full max-w-app px-4 pointer-events-auto">
            {/* Dropdown */}
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  className="mb-2 bg-white rounded-2xl overflow-hidden"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.14)' }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.18 }}
                >
                  {FILTER_OPTIONS.map((opt, i) => (
                    <button
                      key={opt.label}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
                      style={{ borderTop: i > 0 ? '1px solid #F2F2F7' : 'none', background: 'white' }}
                      onClick={() => { setFilter(opt.label); setFilterOpen(false) }}
                    >
                      <span style={{ color: filter === opt.label ? '#1D2023' : '#8D969F' }}>{opt.icon}</span>
                      <span className="font-compact text-[15px] flex-1" style={{ color: '#1D2023' }}>{opt.label}</span>
                      {filter === opt.label && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5 6.5-7" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bar row */}
            <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}>
              <button
                className="flex items-center gap-2 active:opacity-60 transition-opacity"
                onClick={() => setFilterOpen(o => !o)}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5h14M5 9h8M7.5 13h3" stroke="#1D2023" strokeWidth="1.8" strokeLinecap="round"/></svg>
                <span className="font-compact font-semibold text-sm" style={{ color: '#1D2023' }}>{filter}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M3 5l4 4 4-4" stroke="#8D969F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-xl active:opacity-60 transition-opacity"
                style={{ background: 'rgba(29,32,35,0.06)' }}
                onClick={() => scrolled && contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                {scrolled
                  ? <ArrowUp size={18} strokeWidth={2} style={{ color: '#1D2023' }}/>
                  : <Search size={18} strokeWidth={2} style={{ color: '#1D2023' }}/>
                }
              </button>
            </div>
          </div>
        </div>

        <BottomNav/>
      </div>
    </div>
    </>
  )
}
