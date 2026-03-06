import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreHorizontal, Play, AlignLeft } from 'lucide-react'

import { AnimatePresence, motion } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CallEntry {
  id: string
  name: string
  phone: string
  initials: string
  initialsColor: string
  type: string
  time: string
  date: string
  duration: string
  transcript: { author: 'them' | 'me'; text: string }[]
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const SHARED_CALLS: CallEntry[] = [
  {
    id: '1',
    name: 'Иван Васильев',
    phone: '+7 900 364-44-11',
    initials: 'ИВ',
    initialsColor: '#9B9FDE',
    type: 'Входящий',
    time: '12:30',
    date: 'Сегодня, 12:30',
    duration: '40 сек',
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
    id: '2',
    name: 'Иван Васильев',
    phone: '+7 900 364-44-11',
    initials: 'ИВ',
    initialsColor: '#9B9FDE',
    type: 'Входящий',
    time: '10:05',
    date: 'Сегодня, 10:05',
    duration: '1 мин 12 сек',
    transcript: [
      { author: 'them', text: 'Привет, ты дома?' },
      { author: 'me',   text: 'Да, что случилось?' },
      { author: 'them', text: 'Хотел зайти на минуту' },
      { author: 'me',   text: 'Конечно, заходи' },
    ],
  },
  {
    id: '3',
    name: 'Иван Васильев',
    phone: '+7 900 364-44-11',
    initials: 'ИВ',
    initialsColor: '#9B9FDE',
    type: 'Входящий',
    time: '02.03',
    date: '02 марта, 18:45',
    duration: '2 мин 5 сек',
    transcript: [
      { author: 'them', text: 'Не забудь про встречу в пятницу' },
      { author: 'me',   text: 'Помню, во сколько?' },
      { author: 'them', text: 'В 15:00, офис на Тверской' },
    ],
  },
  {
    id: '4',
    name: 'Смирнов Юрий',
    phone: '+7 916 555-33-22',
    initials: 'СМ',
    initialsColor: '#E8A07A',
    type: 'Входящий',
    time: '04.03',
    date: '04 марта, 09:10',
    duration: '55 сек',
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

// ─── Transcript Screen ────────────────────────────────────────────────────────

function TranscriptScreen({ call, onBack }: { call: CallEntry; onBack: () => void }) {
  const [showSummary, setShowSummary] = useState(false)
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
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: call.initialsColor }}
          >
            <span className="text-white font-sans font-bold text-sm">{call.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-bold text-base text-gray-900 truncate">{call.name}</p>
            <p className="font-compact font-normal text-xs text-gray-400">{call.phone}</p>
          </div>
          <button onClick={() => setShowMenu(true)} className="w-9 h-9 flex items-center justify-center shrink-0">
            <MoreHorizontal size={22} className="text-gray-700" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="px-4 pt-5">

            {/* Call meta */}
            <p className="font-compact font-normal text-sm text-gray-400 mb-1">{call.date}</p>
            <div className="flex items-center gap-2 mb-4">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2C2 2 3 0.5 4.5 2L6 3.5C6.5 4 6 5 5.5 5.5C5 6 5.5 7 6.5 8C7.5 9 8.5 9.5 9 9C9.5 8.5 10.5 8 11 8.5L12.5 10C14 11.5 12.5 12.5 12.5 12.5C9.5 15 -0.5 5 2 2Z" fill="#4B5563"/>
              </svg>
              <span className="font-sans font-bold text-base text-gray-900">
                Входящий звонок{' '}
                <span className="font-compact font-normal text-base text-gray-400">{call.duration}</span>
              </span>
            </div>

            {/* Audio controls */}
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setShowPlayer(true)} className="flex items-center gap-2 bg-gray-100 rounded-full px-5 py-2.5 active:bg-gray-200 transition-colors">
                <Play size={13} fill="#1A1A1A" color="#1A1A1A" />
                <span className="font-sans font-bold text-sm text-gray-900">Слушать</span>
              </button>
              <button onClick={() => setShowSummary(true)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors">
                <AlignLeft size={16} className="text-gray-700" strokeWidth={1.8} />
              </button>
            </div>

            <div className="border-t border-gray-100 mb-5" />

            {/* Promo card */}
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-4 mb-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-sans font-bold text-base text-gray-900">В МТС со своим номером</p>
                  <p className="font-compact font-normal text-sm text-gray-400 mt-0.5">Оформите документы онлайн</p>
                </div>
                <div
                  className="w-14 h-16 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(160deg, #D0D4F0, #B8BEEA)' }}
                >
                  <svg width="30" height="36" viewBox="0 0 30 36" fill="none">
                    <rect x="2" y="2" width="26" height="32" rx="5" fill="url(#sg2)" />
                    <rect x="8" y="16" width="14" height="10" rx="2" fill="white" opacity="0.6" />
                    <defs>
                      <linearGradient id="sg2" x1="0" y1="0" x2="30" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#C8CEED" />
                        <stop offset="100%" stopColor="#9FA8DA" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <button className="w-full bg-white border border-gray-200 rounded-full py-3.5 font-sans font-bold text-sm text-gray-900 uppercase tracking-widest hover:bg-gray-50 transition-colors">
                Перенести номер
              </button>
            </div>

            {/* Expiry note */}
            <p className="font-compact font-normal text-xs text-gray-400 text-center mb-5">
              Детали звонка удалятся через 90 дней
            </p>

            {/* Transcript bubbles */}
            <div className="flex flex-col gap-3">
              {call.transcript.map((msg, i) => (
                <div key={i} className={`flex flex-col gap-0.5 ${msg.author === 'me' ? 'items-end' : 'items-start'}`}>
                  {msg.author === 'them' && (
                    <div className="flex items-center gap-2 mb-0.5">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: call.initialsColor }}
                      >
                        <span className="text-white font-sans font-bold" style={{ fontSize: 9 }}>{call.initials}</span>
                      </div>
                      <span className="font-sans font-bold text-sm text-gray-900">{call.name}</span>
                    </div>
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

        {/* Summary sheet */}
        <AnimatePresence>
          {showSummary && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/30" onClick={() => setShowSummary(false)} />
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
                  <div className="flex items-start justify-between mb-1">
                    <h2 className="font-sans font-bold text-xl text-gray-900">Итоги разговора</h2>
                    <button onClick={() => setShowSummary(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 shrink-0 ml-2 active:bg-gray-200">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2L12 12M12 2L2 12" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <p className="font-compact font-normal text-sm text-gray-400 mb-5 leading-snug">
                    Составлены при помощи ИИ для вашего собеседника, возможны неточности
                  </p>
                  <p className="font-compact font-normal text-base text-gray-900 leading-relaxed">
                    Договорились завтра пойти с Иваном на прогулку, посмотрели прогноз погоды и выбрали кофейню, в которую планировали зайти
                  </p>
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

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div
      className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0"
      style={{ background: color }}
    >
      <span className="text-white font-sans font-bold text-base">{initials}</span>
    </div>
  )
}

function SecretaryBadge() {
  return (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
        <path d="M2 7H10M7 4L10 7L7 10" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 3H17M15 3V11" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function CallRow({ entry, onClick }: { entry: CallEntry; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}
    >
      <Avatar initials={entry.initials} color={entry.initialsColor} />
      <div className="flex-1 min-w-0">
        <p className="font-sans font-bold text-base text-gray-900 truncate">{entry.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 2.5C2 2.5 3 1 4.5 2.5L6 4C6.5 4.5 6 5.5 5.5 6C5 6.5 5.5 7.5 6.5 8.5C7.5 9.5 8.5 10 9 9.5C9.5 9 10.5 8.5 11 9L12.5 10.5C14 12 12.5 13 12.5 13C9.5 15.5 -1.5 4.5 2 2.5Z" fill="#9CA3AF"/>
          </svg>
          <span className="font-compact font-normal text-xs text-gray-400">{entry.type}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <SecretaryBadge />
        <span className="font-compact font-normal text-sm text-gray-500 min-w-[38px] text-right">{entry.time}</span>
      </div>
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: call.initialsColor }}
          >
            <span className="text-white font-sans font-bold text-sm">{call.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-bold text-base text-gray-900 truncate">{call.name}</p>
            <p className="font-compact font-normal text-xs text-gray-400">{call.phone}</p>
          </div>
          <button className="w-9 h-9 flex items-center justify-center shrink-0">
            <MoreHorizontal size={22} className="text-gray-700" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20 px-4 pt-5">

          {/* Call meta */}
          <p className="font-compact font-normal text-sm text-gray-400 mb-1">{call.date}</p>
          <div className="flex items-center gap-2 mb-4">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2C2 2 3 0.5 4.5 2L6 3.5C6.5 4 6 5 5.5 5.5C5 6 5.5 7 6.5 8C7.5 9 8.5 9.5 9 9C9.5 8.5 10.5 8 11 8.5L12.5 10C14 11.5 12.5 12.5 12.5 12.5C9.5 15 -0.5 5 2 2Z" fill="#4B5563"/>
            </svg>
            <span className="font-sans font-bold text-base text-gray-900">
              Входящий звонок{' '}
              <span className="font-compact font-normal text-base text-gray-400">{call.duration}</span>
            </span>
          </div>

          {/* Audio controls */}
          <div className="flex items-center gap-3 mb-5">
            <button className="flex items-center gap-2 bg-gray-100 rounded-full px-5 py-2.5">
              <Play size={13} fill="#1A1A1A" color="#1A1A1A" />
              <span className="font-sans font-bold text-sm text-gray-900">Слушать</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <AlignLeft size={16} className="text-gray-700" strokeWidth={1.8} />
            </button>
          </div>

          <div className="border-t border-gray-100 mb-5" />

          {/* Promo card */}
          <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-4 mb-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-sans font-bold text-base text-gray-900">В МТС со своим номером</p>
                <p className="font-compact font-normal text-sm text-gray-400 mt-0.5">Оформите документы онлайн</p>
              </div>
              <div className="w-14 h-16 rounded-xl shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #D0D4F0, #B8BEEA)' }}>
                <svg width="30" height="36" viewBox="0 0 30 36" fill="none">
                  <rect x="2" y="2" width="26" height="32" rx="5" fill="url(#sgL)" />
                  <rect x="8" y="16" width="14" height="10" rx="2" fill="white" opacity="0.6" />
                  <defs>
                    <linearGradient id="sgL" x1="0" y1="0" x2="30" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#C8CEED" /><stop offset="100%" stopColor="#9FA8DA" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <button className="w-full bg-white border border-gray-200 rounded-full py-3.5 font-sans font-bold text-sm text-gray-900 uppercase tracking-widest">
              Перенести номер
            </button>
          </div>

          {/* Expiry note */}
          <p className="font-compact font-normal text-xs text-gray-400 text-center mb-5">
            Детали звонка удалятся через 90 дней
          </p>

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

            {/* Promo */}
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-sans font-bold text-base text-gray-900">В МТС со своим номером</p>
                  <p className="font-compact font-normal text-sm text-gray-400 mt-0.5">Оформите документы онлайн</p>
                </div>
                <div className="w-14 h-16 rounded-xl shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #D0D4F0, #B8BEEA)' }}>
                  <svg width="30" height="36" viewBox="0 0 30 36" fill="none">
                    <rect x="2" y="2" width="26" height="32" rx="5" fill="url(#sg3)" />
                    <rect x="8" y="16" width="14" height="10" rx="2" fill="white" opacity="0.6" />
                    <defs>
                      <linearGradient id="sg3" x1="0" y1="0" x2="30" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#C8CEED" /><stop offset="100%" stopColor="#9FA8DA" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <button className="w-full bg-gray-100 rounded-full py-3.5 font-sans font-bold text-sm text-gray-900 uppercase tracking-widest hover:bg-gray-200 transition-colors">
                Перенести номер
              </button>
            </div>

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
