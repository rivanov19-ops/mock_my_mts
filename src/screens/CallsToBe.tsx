import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Settings, X, Grid3x3, ArrowUpRight, Play, ArrowLeft, MoreHorizontal, Share2, ThumbsUp, ThumbsDown, Bell, FileText } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from '../components/layout/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

type CallType = 'outgoing' | 'incoming' | 'secretary'
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
  duration?: string
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
      { id: '4', name: '100', callType: 'outgoing', typeLabel: 'Исходящий', time: '10:21', voicemail: true },
    ],
  },
  {
    date: '13 ФЕВРАЛЯ',
    calls: [
      { id: '5', name: 'Марвин', callType: 'outgoing', typeLabel: 'Исходящий', time: '18:04' },
      { id: '6', name: '0533', callType: 'outgoing', typeLabel: 'Исходящий', time: '18:01', voicemail: true },
    ],
  },
  {
    date: '12 ФЕВРАЛЯ',
    calls: [
      { id: '7', name: 'Мама', initials: 'МА', initialsColor: '#E91E8C', callType: 'incoming', typeLabel: 'Входящий', time: '20:15' },
      { id: '8', name: '+7 926 111-22-33', callType: 'outgoing', typeLabel: 'Исходящий', time: '14:30', voicemail: true },
      { id: '9', name: 'МТС', initials: 'МТ', initialsColor: '#E30611', callType: 'incoming', typeLabel: 'Входящий', time: '11:00' },
    ],
  },
]

function getFilteredLog(tab: FilterTab) {
  if (tab === 'Все') return CALL_LOG
  return CALL_LOG.map(g => ({ ...g, calls: g.calls.filter(c => tab === 'Записи' ? c.hasRecording : c.callType === 'secretary') })).filter(g => g.calls.length > 0)
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function VoicemailIcon() {
  return (
    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
        <circle cx="5" cy="7" r="4" stroke="#60A5FA" strokeWidth="2"/>
        <circle cx="15" cy="7" r="4" stroke="#60A5FA" strokeWidth="2"/>
        <line x1="5" y1="11" x2="15" y2="11" stroke="#60A5FA" strokeWidth="2"/>
      </svg>
    </div>
  )
}

function SecretaryIcon() {
  return (
    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
        <path d="M2 8H12M9 5L12 8L9 11" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 4H19M17 4V12" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  )
}



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

// ─── Call rows ────────────────────────────────────────────────────────────────

function CallRow({ entry }: { entry: CallEntry }) {
  return (
    <button className="w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5 text-left active:bg-gray-50 transition-colors" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
      <CallAvatar initials={entry.initials} initialsColor={entry.initialsColor} callType={entry.callType}/>
      <div className="flex-1 min-w-0">
        <p className="font-sans font-bold text-base text-gray-900 truncate">{entry.name}</p>
        <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">{entry.typeLabel}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {entry.voicemail && <VoicemailIcon/>}
        {entry.secretaryIcon && <SecretaryIcon/>}
        <span className="font-compact font-normal text-sm text-gray-500 min-w-[38px] text-right">{entry.time}</span>
      </div>
    </button>
  )
}

function RecordingCard({ entry, showTranscript, onClick }: { entry: CallEntry; showTranscript?: boolean; onClick?: () => void }) {
  return (
    <div className="w-full bg-white rounded-2xl px-4 py-3.5 text-left cursor-pointer active:bg-gray-50 transition-colors" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }} onClick={onClick}>
      <div className="flex items-start gap-3">
        {/* Круглый аватар как на скрине */}
        <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center shrink-0 text-white font-sans font-bold text-base"
          style={{ background: entry.initialsColor || '#9CA3AF' }}>
          {entry.initials || entry.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-sans font-bold text-base text-gray-900 truncate">{entry.name}</p>
            <span className="font-compact font-normal text-sm text-gray-400 shrink-0">{entry.time}</span>
          </div>
          <p className="font-compact font-normal text-sm text-gray-400 mt-0.5">{entry.typeLabel}</p>
          {entry.topic && (
            <p className="font-compact font-normal text-sm text-gray-500 mt-0.5 leading-snug line-clamp-2">{entry.topic}</p>
          )}
          {showTranscript && entry.transcript && (
            <p className="font-compact font-normal text-sm text-gray-900 mt-0.5">{entry.transcript.find(m => !m.self)?.text}</p>
          )}
        </div>
      </div>
    </div>
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
  const summary = entry.summary

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
            <CallAvatar initials={entry.initials} initialsColor={entry.initialsColor} callType={entry.callType}/>
            <div className="flex-1 min-w-0">
              <p className="font-sans font-bold text-base text-gray-900 truncate">{entry.name}</p>
              <p className="font-compact font-normal text-xs text-gray-400">{PHONE_NUMBER}</p>
            </div>
            <button onClick={doShare} className="w-9 h-9 flex items-center justify-center shrink-0">
              <Share2 size={20} className="text-blue-500" strokeWidth={1.8}/>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 bg-gray-50">
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
                <div className="bg-white rounded-2xl px-4 py-3.5 flex items-start gap-3 mb-2" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
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
                </div>
              )}

              {summary.actions.filter(a => a.type === 'share').map((a, i) => (
                <button key={i} onClick={doShare} className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left mb-2" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#007AFF12' }}>
                    <Share2 size={18} color="#007AFF" strokeWidth={1.8}/>
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

// ─── Banner configs ───────────────────────────────────────────────────────────

const BANNERS: Record<FilterTab, { title: string; subtitle: string; icon: 'secretary' | 'voicemail' }> = {
  'Все':       { title: 'Секретарь в звонке', subtitle: 'Команды для вашего цифрового помощника', icon: 'secretary' },
  'Записи':    { title: 'Интеллектуальная запись', subtitle: 'Все возможности записи разговоров', icon: 'voicemail' },
  'Секретарь': { title: 'Секретарь в звонке', subtitle: 'Команды для вашего цифрового помощника', icon: 'secretary' },
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type DetailScreen = 'details' | 'transcript'

export default function CallsToBe() {
  const navigate = useNavigate()
  const [bannerVisible, setBannerVisible] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Все')
  const [openEntry, setOpenEntry] = useState<CallEntry | null>(null)
  const [detailScreen, setDetailScreen] = useState<DetailScreen>('details')

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
    <div className="min-h-screen flex justify-center" style={{ background: 'white' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Header */}
        <div className="px-4 pt-12 pb-16" style={{ background: 'linear-gradient(180deg, #1A1D38 0%, #252A52 35%, #4A5285 65%, #9BA3C8 85%, #D4D8EA 100%)' }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-sans font-black text-[1.75rem] text-white leading-tight">Звонки</h1>
              <p className="font-compact font-normal text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{PHONE_NUMBER}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => navigate('/calls')} className="flex items-center active:opacity-50 transition-opacity">
                <span className="font-compact text-xs underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.55)' }}>AsIs</span>
              </button>
              <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Search size={18} className="text-white" strokeWidth={2}/>
              </button>
              <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Settings size={18} className="text-white" strokeWidth={2}/>
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {(['Все', 'Записи', 'Секретарь'] as FilterTab[]).map(tab => (
              <button key={tab} onClick={() => { setActiveFilter(tab); setBannerVisible(true) }}
                className="rounded-full px-4 py-1.5 font-compact font-normal text-sm transition-colors"
                style={{ background: activeFilter === tab ? 'white' : 'rgba(255,255,255,0.15)', color: activeFilter === tab ? '#1A1D38' : 'white' }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#F0F0F5] rounded-t-[28px] -mt-10 overflow-y-auto pb-24">
          <div className="px-4 pt-4 flex flex-col gap-3">

            {bannerVisible && (
              <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
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
                <button onClick={() => setBannerVisible(false)} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 shrink-0">
                  <X size={14} className="text-gray-500" strokeWidth={2}/>
                </button>
              </div>
            )}

            {filteredLog.map(group => (
              <div key={group.date}>
                <p className="font-compact font-normal text-xs text-gray-400 px-1 mb-2">{group.date}</p>
                <div className="flex flex-col gap-3">
                  {group.calls.map(entry =>
                    isCardView && entry.hasRecording ? (
                      <RecordingCard
                        key={entry.id} entry={entry}
                        showTranscript={activeFilter === 'Секретарь'}
                        onClick={() => { setDetailScreen('details'); setOpenEntry(entry) }}
                      />
                    ) : (
                      <CallRow key={entry.id} entry={entry}/>
                    )
                  )}
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
      </div>
    </div>
  )
}
