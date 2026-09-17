import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreHorizontal, Play } from 'lucide-react'

import { AnimatePresence, motion } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SummaryBlock {
  title: string
  content: string
}

type DeliveryStatus = 'delivered' | 'read'

interface SecretaryData {
  status: DeliveryStatus
  /** Время прочтения. Показывается, только если абонент дал согласие на статус прочтения */
  readAt?: string
  dialog: { author: 'bot' | 'me'; text: string }[]
}

interface CallEntry {
  id: string
  /** Номер абонента МТС. Имя и аватар на Витрине не показываются */
  phone: string
  type: string
  time: string
  date: string
  duration: string
  /** Шумоподавление срабатывало в звонке */
  noiseReduction?: boolean
  /** Короткие итоги для карточки в списке (только у звонков с ИЗ) */
  shortSummary?: string
  /** Развёрнутые итоги на экране звонка (только у звонков с ИЗ) */
  summary?: SummaryBlock[]
  /** Расшифровка. Нет у звонков, где сработало только Шумоподавление */
  transcript?: { author: 'them' | 'me'; text: string }[]
  /** Разговор с Секретарём абонента. Звонящий — сам участник этого разговора */
  secretary?: SecretaryData
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const SHARED_CALLS: CallEntry[] = [
  {
    id: 's1',
    phone: '+7 916 240-11-08',
    type: 'Исходящий',
    time: '20:14',
    date: 'Сегодня, 20:14',
    duration: '48 сек',
    shortSummary: 'Привёз документы, стою у второго подъезда',
    secretary: {
      status: 'read',
      readAt: '20:16',
      dialog: [
        { author: 'bot', text: 'Здравствуйте! Абонент сейчас не может ответить, я его секретарь. Что передать?' },
        { author: 'me',  text: 'Это курьер, привёз документы. Стою у второго подъезда' },
        { author: 'bot', text: 'Записал: курьер с документами, ждёт у второго подъезда. Передам абоненту' },
      ],
    },
  },
  {
    id: 's2',
    phone: '+7 925 703-52-19',
    type: 'Исходящий',
    time: '16:42',
    date: 'Сегодня, 16:42',
    duration: '31 сек',
    shortSummary: 'Звоню по объявлению, уточнял, актуальна ли квартира',
    secretary: {
      status: 'delivered',
      dialog: [
        { author: 'bot', text: 'Здравствуйте! Абонент сейчас не отвечает, я его секретарь. Что передать?' },
        { author: 'me',  text: 'Звоню по объявлению, квартира на [неразборчиво] ещё актуальна?' },
        { author: 'bot', text: 'Записал, передам абоненту' },
      ],
    },
  },
  {
    id: '1',
    phone: '+7 000 364-44-11',
    type: 'Входящий',
    time: '19:01',
    date: 'Сегодня, 19:01',
    duration: '1 мин',
    noiseReduction: true,
    shortSummary: 'Презентацию перенесли на среду, нужно внести все правки и подготовить финальные материалы',
    summary: [
      { title: 'Отчёт', content: 'Презентация → перенесена на среду\nЦель — успеть внести все правки и подготовить финальные материалы' },
      { title: 'Задачи и ответственные', content: 'Паша: уточняет цифры у подрядчика и сверяет расчёты\nЯ: проверяю структуру документа и последовательность разделов' },
    ],
    transcript: [
      { author: 'them', text: 'Слушай, презентацию двигают на среду' },
      { author: 'me',   text: 'Успеем? Там ещё правки по цифрам' },
      { author: 'them', text: 'Я уточню у подрядчика и сверю расчёты' },
      { author: 'me',   text: 'Ок, тогда я пройдусь по структуре и порядку разделов' },
      { author: 'them', text: 'Договорились, к среде всё финальное' },
    ],
  },
  {
    id: '2',
    phone: '+7 900 364-44-11',
    type: 'Входящий',
    time: '12:30',
    date: 'Сегодня, 12:30',
    duration: '40 сек',
    shortSummary: 'Договорились завтра погулять, если дождь — зайдём в кофейню',
    summary: [
      { title: 'О чём говорили', content: 'Обсудили планы на завтра и прогноз погоды' },
      { title: 'Договорённости', content: 'Завтра гуляем\nЕсли дождь — заходим в кофейню рядом' },
    ],
    transcript: [
      { author: 'them', text: 'Алло, привет, как ты там?' },
      { author: 'me',   text: 'Привет, отлично, пойдем завтра гулять?' },
      { author: 'them', text: 'Давай, вроде как дождь передают' },
      { author: 'me',   text: 'Думаю ок будет, если что в нашу кофейню заскочим' },
      { author: 'them', text: 'Хорошо, тогда до завтра' },
      { author: 'me',   text: 'До завтра' },
    ],
  },
  {
    id: '3',
    phone: '+7 903 118-90-40',
    type: 'Входящий',
    time: '11:15',
    date: 'Сегодня, 11:15',
    duration: '3 мин 20 сек',
    noiseReduction: true,
  },
  {
    id: '4',
    phone: '+7 900 364-44-11',
    type: 'Входящий',
    time: '10:05',
    date: 'Сегодня, 10:05',
    duration: '1 мин 12 сек',
    shortSummary: 'Иван зайдёт на минуту, ты дома',
    summary: [
      { title: 'Договорённости', content: 'Иван заходит на минуту сегодня' },
    ],
    transcript: [
      { author: 'them', text: 'Привет, ты дома?' },
      { author: 'me',   text: 'Да, что случилось?' },
      { author: 'them', text: 'Хотел зайти на минуту' },
      { author: 'me',   text: 'Конечно, заходи' },
    ],
  },
  {
    id: '5',
    phone: '+7 900 364-44-11',
    type: 'Входящий',
    time: '02.03',
    date: '02 марта, 18:45',
    duration: '2 мин 5 сек',
    shortSummary: 'Встреча в пятницу в 15:00, офис на Тверской',
    summary: [
      { title: 'Отчёт', content: 'Встреча в пятницу в 15:00' },
      { title: 'Где', content: 'Офис на Тверской' },
    ],
    transcript: [
      { author: 'them', text: 'Не забудь про встречу в пятницу' },
      { author: 'me',   text: 'Помню, во сколько?' },
      { author: 'them', text: 'В 15:00, офис на Тверской' },
    ],
  },
  {
    id: '6',
    phone: '+7 916 555-33-22',
    type: 'Входящий',
    time: '04.03',
    date: '04 марта, 09:10',
    duration: '55 сек',
    shortSummary: 'Юрий отправил документы на почту, нужно проверить сегодня',
    summary: [
      { title: 'Задачи и ответственные', content: 'Я: проверить документы на почте сегодня' },
    ],
    transcript: [
      { author: 'them', text: 'Юрий, добрый день' },
      { author: 'me',   text: 'Добрый, слушаю' },
      { author: 'them', text: 'Отправил документы на почту, проверьте пожалуйста' },
      { author: 'me',   text: 'Хорошо, посмотрю сегодня' },
    ],
  },
]

// ─── Browser Address Bar ─────────────────────────────────────────────────────

function BrowserBar({ onBack }: { onBack?: () => void }) {
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-gray-200 px-3 py-2"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
    >
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-400" strokeWidth={2} />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="4" width="14" height="11" rx="2" stroke="#9CA3AF" strokeWidth="1.6"/>
            <path d="M5 4V3C5 2.44772 5.44772 2 6 2H12C12.5523 2 13 2.44772 13 3V4" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center justify-center">
          <span className="font-compact font-normal text-sm text-gray-500">m.mts.ru</span>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M15 9A6 6 0 1 1 3.5 5.5M3 3v3h3" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100">
          <svg width="18" height="4" viewBox="0 0 18 4" fill="none">
            <circle cx="2" cy="2" r="2" fill="#9CA3AF"/>
            <circle cx="9" cy="2" r="2" fill="#9CA3AF"/>
            <circle cx="16" cy="2" r="2" fill="#9CA3AF"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Logout Popup ─────────────────────────────────────────────────────────────

function LogoutPopup({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-app bg-[#F2F2F7] rounded-t-[20px] overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="px-5 pt-3 pb-10">
          <h2 className="font-sans font-bold text-lg text-gray-900 text-center mb-1">
            Выход из аккаунта
          </h2>
          <p className="font-compact font-normal text-sm text-gray-500 text-center leading-snug mb-5">
            Вы уверены, что хотите завершить<br />текущую сессию?
          </p>

          <button
            onClick={onConfirm}
            className="w-full bg-[#E30611] rounded-2xl py-4 font-sans font-bold text-base text-white uppercase tracking-widest mb-3 active:opacity-80 transition-opacity"
          >
            Выйти
          </button>

          <button
            onClick={onClose}
            className="w-full bg-[#E9E9EF] rounded-2xl py-4 font-sans font-bold text-base text-gray-900 uppercase tracking-widest active:opacity-80 transition-opacity"
          >
            Отмена
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Шумоподавление ───────────────────────────────────────────────────────────

function EqualizerIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 9 9" fill="none">
      <rect x="0.5" y="3.5" width="1.5" height="3" rx="0.75" fill="#00C7BE"/>
      <rect x="3.75" y="1.5" width="1.5" height="6" rx="0.75" fill="#00C7BE"/>
      <rect x="7" y="2.5" width="1.5" height="4" rx="0.75" fill="#00C7BE"/>
    </svg>
  )
}

function NoiseChip() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#E5F9F8' }}>
      <EqualizerIcon />
      <span className="font-compact font-semibold text-xs" style={{ color: '#00C7BE' }}>Шумоподавление</span>
    </div>
  )
}

// ─── Промо подписки AI Помощник ──────────────────────────────────────────────
// Неабоненту доступна только подписка AI Помощник — других промо на Витрине нет

const ASSISTANT_PROMO = {
  default: {
    title: 'AI Помощник МТС',
    text: 'Секретарь, Интеллектуальная запись и Шумоподавление в одной подписке',
    color: '#7C8CE0',
    bg: '#EEF0FC',
    gradient: 'linear-gradient(160deg, #A8B4F0, #7C8CE0)',
  },
  secretary: {
    title: 'Ваш телефон тоже может отвечать за вас',
    text: 'Секретарь принимает звонки, когда неудобно говорить, и присылает расшифровку. Входит в подписку AI Помощник',
    color: '#7C8CE0',
    bg: '#EEF0FC',
    gradient: 'linear-gradient(160deg, #A8B4F0, #7C8CE0)',
  },
  noise: {
    title: 'Вас тоже будет слышно чисто',
    text: 'Шумоподавление уберёт из разговора шум улицы, метро и кафе. Входит в подписку AI Помощник',
    color: '#00C7BE',
    bg: '#E5F9F8',
    gradient: 'linear-gradient(160deg, #7FE3DC, #00C7BE)',
  },
}

function AssistantPromo({ accent = 'default' }: { accent?: keyof typeof ASSISTANT_PROMO }) {
  const p = ASSISTANT_PROMO[accent]
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: p.bg }}>
      <div className="px-5 pt-6 pb-5 flex items-center gap-4">
        <div className="flex-1">
          <p className="font-sans font-black text-[1.35rem] text-gray-900 leading-tight">{p.title}</p>
          <p className="font-compact font-normal text-sm text-gray-500 mt-2 leading-snug">{p.text}</p>
        </div>
        <div className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center" style={{ background: p.gradient }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/>
          </svg>
        </div>
      </div>
      <div className="px-5 pb-5">
        <button
          className="w-full rounded-full py-3.5 font-sans font-bold text-sm text-white uppercase tracking-widest active:opacity-80 transition-opacity"
          style={{ background: p.color }}
          onClick={() => window.open('https://moskva.mts.ru/personal/mobilnaya-svyaz/uslugi/mobilnaya-svyaz/voicetech', '_blank')}
        >
          Узнать об AI Помощнике
        </button>
      </div>
    </div>
  )
}

// ─── Шапка звонка: дата, тип, длительность, ШП, срок хранения ────────────────

function CallMeta({ call }: { call: CallEntry }) {
  return (
    <>
      <p className="font-compact font-normal text-sm text-gray-400 mb-1">{call.date}</p>

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2C2 2 3 0.5 4.5 2L6 3.5C6.5 4 6 5 5.5 5.5C5 6 5.5 7 6.5 8C7.5 9 8.5 9.5 9 9C9.5 8.5 10.5 8 11 8.5L12.5 10C14 11.5 12.5 12.5 12.5 12.5C9.5 15 -0.5 5 2 2Z" fill="#4B5563"/>
          </svg>
          <span className="font-sans font-bold text-base text-gray-900 truncate">
            {call.type} звонок{' '}
            <span className="font-compact font-normal text-base text-gray-400">{call.duration}</span>
          </span>
        </div>
        <a
          href={`tel:${call.phone.replace(/[^+\d]/g, '')}`}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          style={{ background: '#34C759' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .7-.2 1l-2.3 2.2z"/>
          </svg>
        </a>
      </div>

      {call.noiseReduction && <div className="mb-3"><NoiseChip /></div>}

      <p className="font-compact font-normal text-xs text-gray-400 text-center py-3 border-t border-b border-gray-100 mb-4">
        Детали звонка удаляются через 90 дней
      </p>
    </>
  )
}

// ─── Итоги разговора ─────────────────────────────────────────────────────────

function SummaryCard({ blocks }: { blocks: SummaryBlock[] }) {
  return (
    <>
      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-2">
        {blocks.map((b, i) => (
          <div key={i} className="px-4 py-3.5" style={{ borderTop: i > 0 ? '1px solid #ECECF2' : 'none' }}>
            <p className="font-compact text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{b.title}</p>
            <p className="font-compact text-sm text-gray-900 leading-relaxed whitespace-pre-line">{b.content}</p>
          </div>
        ))}
      </div>
      <p className="font-compact font-normal text-xs text-gray-400 leading-snug mb-5">
        Итоги разговора составлены при помощи ИИ. Возможны неточности
      </p>
    </>
  )
}

// ─── Transcript Screen ────────────────────────────────────────────────────────

function TranscriptScreen({ call, onBack }: { call: CallEntry; onBack: () => void }) {
  const [showPlayer, setShowPlayer] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* Header */}
        <div className="px-4 pt-12 pb-3 flex items-center gap-3 bg-white border-b border-gray-100">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0">
            <ArrowLeft size={22} className="text-gray-900" strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-bold text-base text-gray-900 truncate">{call.phone}</p>
          </div>
          <button onClick={() => setShowMenu(true)} className="w-9 h-9 flex items-center justify-center shrink-0">
            <MoreHorizontal size={22} className="text-gray-700" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="px-4 pt-5">

            <CallMeta call={call} />

            {call.summary && <SummaryCard blocks={call.summary} />}

            {/* Audio */}
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setShowPlayer(true)} className="flex items-center gap-2 bg-gray-100 rounded-full px-5 py-2.5 active:bg-gray-200 transition-colors">
                <Play size={13} fill="#1A1A1A" color="#1A1A1A" />
                <span className="font-sans font-bold text-sm text-gray-900">Слушать</span>
              </button>
            </div>

            <div className="mb-5">
              <AssistantPromo />
            </div>

            {/* Transcript bubbles */}
            <div className="flex flex-col gap-3">
              {call.transcript?.map((msg, i) => (
                <div key={i} className={`flex flex-col gap-0.5 ${msg.author === 'me' ? 'items-end' : 'items-start'}`}>
                  {msg.author === 'them' && (
                    <span className="font-sans font-bold text-sm text-gray-900 mb-0.5">{call.phone}</span>
                  )}
                  <div
                    className={`max-w-[78%] px-4 py-3 rounded-2xl
                      ${msg.author === 'them'
                        ? 'bg-gray-100 text-gray-900 rounded-tl-sm'
                        : 'bg-gray-200 text-gray-900 rounded-tr-sm'
                      }`}
                  >
                    <p className="font-compact font-normal text-base leading-snug">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        <BrowserBar onBack={onBack} />

        {/* Player sheet */}
        <AnimatePresence>
          {showPlayer && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowPlayer(false)} />
              <motion.div
                className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              >
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>
                <div className="px-5 pt-3 pb-10">
                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
                      <div className="w-0 h-1 bg-gray-900 rounded-full" />
                    </div>
                    <div className="flex justify-between">
                      <span className="font-compact font-normal text-xs text-gray-400">00:00</span>
                      <span className="font-compact font-normal text-xs text-gray-400">00:10</span>
                    </div>
                  </div>
                  {/* Controls */}
                  <div className="flex items-center justify-center gap-5 mt-4">
                    {/* x1 speed */}
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <span className="font-sans font-bold text-xs text-gray-700">x1</span>
                    </button>
                    {/* rewind 10s */}
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <path d="M4 11a7 7 0 1 0 1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M4 5v4h4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="8" y="15" fontSize="5" fill="#374151" fontFamily="sans-serif" fontWeight="bold">10</text>
                      </svg>
                    </button>
                    {/* play/pause */}
                    <button
                      onClick={() => setIsPlaying(p => !p)}
                      className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center active:scale-95 transition-transform"
                    >
                      {isPlaying ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <rect x="4" y="3" width="4" height="14" rx="1.5" fill="white"/>
                          <rect x="12" y="3" width="4" height="14" rx="1.5" fill="white"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M5 3.5L16.5 10 5 16.5V3.5Z" fill="white"/>
                        </svg>
                      )}
                    </button>
                    {/* forward 10s */}
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <path d="M18 11a7 7 0 1 1-1.2-3.9" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M18 5v4h-4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <text x="7" y="15" fontSize="5" fill="#374151" fontFamily="sans-serif" fontWeight="bold">10</text>
                      </svg>
                    </button>
                    {/* close */}
                    <button onClick={() => setShowPlayer(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
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
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowMenu(false)} />
              <motion.div
                className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              >
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>
                <div className="px-5 pt-3 pb-10">
                  <div className="flex items-center justify-between">
                    <button className="flex items-center gap-3 py-2 active:opacity-70 transition-opacity">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <path d="M4 6h14M8 6V4h6v2M9 10v6M13 10v6M5 6l1 12h10L17 6" stroke="#E85D26" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-sans font-bold text-base text-[#E85D26]">Удалить звонок</span>
                    </button>
                    <button onClick={() => setShowMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
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

// ─── Avatar ───────────────────────────────────────────────────────────────────

function CallRow({ entry, onClick }: { entry: CallEntry; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl overflow-hidden active:scale-[0.98] transition-transform text-left"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}
    >
      <div className="px-4 py-3.5 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-sans font-bold text-base text-gray-900 truncate">{entry.phone}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 2.5C2 2.5 3 1 4.5 2.5L6 4C6.5 4.5 6 5.5 5.5 6C5 6.5 5.5 7.5 6.5 8.5C7.5 9.5 8.5 10 9 9.5C9.5 9 10.5 8.5 11 9L12.5 10.5C14 12 12.5 13 12.5 13C9.5 15.5 -1.5 4.5 2 2.5Z" fill="#9CA3AF"/>
            </svg>
            <span className="font-compact font-normal text-xs text-gray-400">{entry.type}</span>
            {entry.secretary && (
              <span className="font-compact font-normal text-xs" style={{ color: '#7C8CE0' }}>· Секретарь ответил</span>
            )}
          </div>
        </div>
        <span className="font-compact font-normal text-sm text-gray-500 shrink-0 min-w-[38px] text-right">{entry.time}</span>
      </div>

      {/* Короткие итоги — только у звонков с Интеллектуальной записью */}
      {entry.shortSummary && (
        <p
          className="px-4 pb-3.5 font-compact font-normal text-sm text-gray-900 leading-snug"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}
        >
          {entry.shortSummary}
        </p>
      )}

      {/* Статус доставки сообщения Секретарю */}
      {entry.secretary && (
        <div className="px-4 py-2.5 flex items-center gap-2 border-t border-gray-100">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={STATUS_VIEW[entry.secretary.status].color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span className="font-compact font-normal text-xs" style={{ color: STATUS_VIEW[entry.secretary.status].color }}>
            {STATUS_VIEW[entry.secretary.status].label}
          </span>
        </div>
      )}

      {/* Плашка Шумоподавления */}
      {entry.noiseReduction && (
        <div className="px-4 py-2.5 flex items-center gap-2 border-t border-gray-100">
          <EqualizerIcon size={13} />
          <span className="font-compact font-normal text-xs text-gray-400">Сработало шумоподавление</span>
        </div>
      )}
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// ─── Секретарь ────────────────────────────────────────────────────────────────

const STATUS_VIEW: Record<DeliveryStatus, { label: string; color: string; bg: string }> = {
  delivered: { label: 'Передано абоненту', color: '#8D969F', bg: '#F2F2F7' },
  read:      { label: 'Абонент прочитал',  color: '#0070E5', bg: '#E8F2FF' },}

function DeliveryBadge({ data }: { data: SecretaryData }) {
  const v = STATUS_VIEW[data.status]
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: v.bg }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={v.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span className="font-compact font-semibold text-xs" style={{ color: v.color }}>
        {v.label}{data.readAt && data.status !== 'delivered' ? ` · ${data.readAt}` : ''}
      </span>
    </div>
  )
}

/** Подсвечивает фрагменты, которые Секретарь не разобрал */
function DialogText({ text }: { text: string }) {
  const parts = text.split('[неразборчиво]')
  return (
    <p className="font-compact font-normal text-base leading-snug">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="font-semibold" style={{ color: '#E85D26' }}>[неразборчиво]</span>
          )}
        </span>
      ))}
    </p>
  )
}

function SecretaryScreen({ call, onBack }: { call: CallEntry; onBack: () => void }) {
  const data = call.secretary!

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* Header */}
        <div className="px-4 pt-12 pb-3 flex items-center gap-3 bg-white border-b border-gray-100">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0">
            <ArrowLeft size={22} className="text-gray-900" strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-bold text-base text-gray-900 truncate">{call.phone}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20 px-4 pt-5">

          <CallMeta call={call} />

          {/* Статус доставки */}
          <div className="mb-5">
            <p className="font-compact text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ваше сообщение</p>
            <DeliveryBadge data={data} />
            {data.status === 'delivered' && (
              <p className="font-compact font-normal text-xs text-gray-400 mt-2 leading-snug">
                Абонент не включил уведомление о прочтении, поэтому время просмотра не показывается
              </p>
            )}
          </div>

          {/* Диалог с секретарём */}
          <div className="flex flex-col gap-3 mb-5">
            {data.dialog.map((msg, i) => (
              <div key={i} className={`flex flex-col gap-0.5 ${msg.author === 'me' ? 'items-end' : 'items-start'}`}>
                {msg.author === 'bot' && (
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(160deg, #A8B4F0, #7C8CE0)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 14h.01M15 14h.01"/>
                      </svg>
                    </div>
                    <span className="font-sans font-bold text-sm text-gray-900">Секретарь</span>
                  </div>
                )}
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl ${msg.author === 'bot' ? 'bg-gray-100 rounded-tl-sm' : 'bg-gray-200 rounded-tr-sm'} text-gray-900`}>
                  <DialogText text={msg.text} />
                </div>
              </div>
            ))}
          </div>

          <AssistantPromo accent="secretary" />

        </div>

        <BrowserBar onBack={onBack} />

      </div>
    </div>
  )
}

// ─── Noise-only Screen ───────────────────────────────────────────────────────
// Звонок без Интеллектуальной записи: метаданные + промо AI Помощника с акцентом на Шумоподавление

function NoiseOnlyScreen({ call, onBack }: { call: CallEntry; onBack: () => void }) {
  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* Header */}
        <div className="px-4 pt-12 pb-3 flex items-center gap-3 bg-white border-b border-gray-100">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0">
            <ArrowLeft size={22} className="text-gray-900" strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-bold text-base text-gray-900 truncate">{call.phone}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20 px-4 pt-5">

          <CallMeta call={call} />

          <AssistantPromo accent="noise" />

        </div>

        <BrowserBar onBack={onBack} />
      </div>
    </div>
  )
}

// ─── Loading Screen ──────────────────────────────────────────────────────────

function LoadingScreen({ call, onBack, onReady }: { call: CallEntry; onBack: () => void; onReady: () => void }) {
  useEffect(() => {
    const t = setTimeout(onReady, 2000)
    return () => clearTimeout(t)
  }, [onReady])

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* Header */}
        <div className="px-4 pt-12 pb-3 flex items-center gap-3 bg-white border-b border-gray-100">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0">
            <ArrowLeft size={22} className="text-gray-900" strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-bold text-base text-gray-900 truncate">{call.phone}</p>
          </div>
          <button className="w-9 h-9 flex items-center justify-center shrink-0">
            <MoreHorizontal size={22} className="text-gray-700" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20 px-4 pt-5">

          <CallMeta call={call} />

          <div className="mb-5">
            <AssistantPromo />
          </div>

          {/* Loading state */}
          <div className="bg-gray-100 rounded-2xl px-4 py-4 mb-4">
            <p className="font-compact font-normal text-base text-gray-900 leading-snug">
              Расшифровка загружается и появится здесь. Пока можно уйти с экрана
            </p>
          </div>

          {/* Spinner */}
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <motion.div
              className="w-7 h-7 border-2 border-gray-300 border-t-gray-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />
          </div>

        </div>

        <BrowserBar onBack={onBack} />
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function VoiceTech() {
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)
  const [openCall, setOpenCall] = useState<CallEntry | null>(null)
  const [transcriptReady, setTranscriptReady] = useState(false)

  // Разговор с Секретарём — звонящий сам участник, грузить расшифровку не нужно
  if (openCall && openCall.secretary) {
    return (
      <SecretaryScreen
        call={openCall}
        onBack={() => { setOpenCall(null); setTranscriptReady(false) }}
      />
    )
  }

  // Звонок только с Шумоподавлением — расшифровки нет, грузить нечего
  if (openCall && !openCall.transcript) {
    return (
      <NoiseOnlyScreen
        call={openCall}
        onBack={() => { setOpenCall(null); setTranscriptReady(false) }}
      />
    )
  }

  if (openCall && !transcriptReady) {
    return (
      <LoadingScreen
        call={openCall}
        onBack={() => { setOpenCall(null); setTranscriptReady(false) }}
        onReady={() => setTranscriptReady(true)}
      />
    )
  }

  if (openCall && transcriptReady) {
    return <TranscriptScreen call={openCall} onBack={() => { setOpenCall(null); setTranscriptReady(false) }} />
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F0F0F5' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Gradient header */}
        <div
          className="px-4 pt-12 pb-20"
          style={{ background: 'linear-gradient(180deg, #C8CCE8 0%, #D4D8EE 40%, #E2E5F2 70%, #ECEEF6 100%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate('/')} className="w-9 h-9 flex items-center justify-center">
              <ArrowLeft size={22} className="text-gray-900" strokeWidth={2} />
            </button>
            <button
              onClick={() => setShowLogout(true)}
              className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center active:scale-95 transition-transform"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M7 3H3C2.44772 3 2 3.44772 2 4V14C2 14.5523 2.44772 15 3 15H7" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 6L16 9L12 12" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 9H7" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <h1 className="font-sans font-black text-[1.9rem] text-gray-900 leading-tight">Звонки</h1>
          <p className="font-compact font-normal text-sm text-gray-500 mt-0.5">Которыми с вами поделились</p>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#F0F0F5] rounded-t-[28px] -mt-10 overflow-y-auto pb-20">
          <div className="px-4 pt-4 flex flex-col gap-3">

            <AssistantPromo />

            {SHARED_CALLS.map(entry => (
              <CallRow key={entry.id} entry={entry} onClick={() => { setTranscriptReady(false); setOpenCall(entry) }} />
            ))}

          </div>
        </div>



        <BrowserBar onBack={() => navigate('/')} />

        <AnimatePresence>
          {showLogout && (
            <LogoutPopup
              onClose={() => setShowLogout(false)}
              onConfirm={() => navigate('/voicetech-auth')}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
