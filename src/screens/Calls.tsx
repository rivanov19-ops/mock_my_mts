import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Settings, X, Grid3x3, ArrowUpRight, Play, ArrowLeft, MoreHorizontal, Share2, ThumbsUp, ThumbsDown, Bell, FileText, AlignLeft } from 'lucide-react'
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



function TranscribeIcon() {
  return (
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
        <path d="M2 8H10M7 5L10 8L7 11" stroke="#F44336" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 4H18M16 4V12" stroke="#F44336" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function AudioPlayer({ duration }: { duration: string }) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <button className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
        <Play size={18} color="white" fill="white" className="ml-0.5"/>
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="w-full h-1 bg-gray-200 rounded-full"/>
        <div className="flex justify-between">
          <span className="text-xs text-gray-400 font-compact">00:00</span>
          <span className="text-xs text-gray-400 font-compact">{duration}</span>
        </div>
      </div>
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

// ─── List rows ────────────────────────────────────────────────────────────────

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
      <div className="flex items-start gap-4">
        <CallAvatar initials={entry.initials} initialsColor={entry.initialsColor} callType={entry.callType}/>
        <div className="flex-1 min-w-0">
          <p className="font-sans font-bold text-base text-gray-900 truncate">{entry.name}</p>
          <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">{entry.typeLabel}</p>
          {entry.topic && (
            <p className="font-compact font-normal text-xs text-gray-500 mt-1 leading-snug line-clamp-2">{entry.topic}</p>
          )}
        </div>
        <span className="font-compact font-normal text-sm text-gray-500 shrink-0">{entry.time}</span>
      </div>
      <div className="flex items-end gap-2 mt-1 pl-[68px]">
        <div className="flex-1"><AudioPlayer duration={entry.duration!}/></div>
        <TranscribeIcon/>
      </div>
      {showTranscript && entry.transcript && (
        <p className="font-compact font-normal text-sm text-gray-900 mt-3 pl-1">{entry.transcript.find(m => !m.self)?.text}</p>
      )}
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

// ─── Banner configs ───────────────────────────────────────────────────────────

const BANNERS: Record<FilterTab, { title: string; subtitle: string; icon: 'secretary' | 'voicemail' }> = {
  'Все':       { title: 'Секретарь в звонке', subtitle: 'Команды для вашего цифрового помощника', icon: 'secretary' },
  'Записи':    { title: 'Интеллектуальная запись', subtitle: 'Все возможности записи разговоров', icon: 'voicemail' },
  'Секретарь': { title: 'Секретарь в звонке', subtitle: 'Команды для вашего цифрового помощника', icon: 'secretary' },
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type DetailScreen = 'details' | 'transcript'

export default function Calls() {
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

        {/* ── Header ── */}
        <div
          className="px-4 pt-12 pb-16"
          style={{
            background: 'linear-gradient(180deg, #1A1D38 0%, #252A52 35%, #4A5285 65%, #9BA3C8 85%, #D4D8EA 100%)',
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-sans font-black text-[1.75rem] text-white leading-tight">Звонки</h1>
              <p className="font-compact font-normal text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {PHONE_NUMBER}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => navigate('/calls/tobe')}
                className="flex items-center active:opacity-50 transition-opacity"
              >
                <span className="font-compact text-xs underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.55)' }}>ToBe</span>
              </button>
              <button
                onClick={() => navigate('/calls/catalog')}
                className="h-9 px-4 rounded-full flex items-center justify-center active:opacity-70 transition-opacity"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              >
                <span className="font-sans font-bold text-xs text-white uppercase tracking-wide">Каталог</span>
              </button>
              <button
                onClick={() => navigate('/calls/settings')}
                className="w-9 h-9 rounded-full flex items-center justify-center active:opacity-70 transition-opacity"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              >
                <Settings size={18} color="white" strokeWidth={1.5}/>
              </button>
            </div>
          </div>
        </div>

        {/* ── White card ── */}
        <div className="flex-1 bg-white rounded-t-[28px] -mt-10 overflow-y-auto pb-24 flex flex-col">

          <div className="px-4 pt-5 pb-3 flex flex-col gap-4">

            {/* Banner */}
            {bannerVisible && (
              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer active:opacity-80 transition-opacity"
                style={{ background: '#E8EAF4' }}
                onClick={() => navigate('/calls/secretary-promo')}
              >
                {banner.icon === 'voicemail' ? (
                  <div className="shrink-0">
                    <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
                      <circle cx="8" cy="9" r="5.5" stroke="#374151" strokeWidth="2"/>
                      <circle cx="20" cy="9" r="5.5" stroke="#374151" strokeWidth="2"/>
                      <line x1="8" y1="14.5" x2="20" y2="14.5" stroke="#374151" strokeWidth="2"/>
                    </svg>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect x="3" y="3" width="16" height="16" rx="5" stroke="white" strokeWidth="1.8"/>
                      <circle cx="11" cy="11" r="2" fill="white"/>
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-bold text-sm text-gray-900">{banner.title}</p>
                  <p className="font-compact font-normal text-xs text-gray-400 mt-0.5 leading-snug">{banner.subtitle}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setBannerVisible(false) }} className="shrink-0 ml-1">
                  <X size={16} className="text-gray-400" strokeWidth={2}/>
                </button>
              </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3">
              <Search size={16} className="text-gray-400 shrink-0" strokeWidth={1.5}/>
              <span className="font-compact font-normal text-sm text-gray-400">Контакты</span>
            </div>

            {/* Filter pills */}
            <div className="flex gap-2">
              {(['Все', 'Записи', 'Секретарь'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 rounded-full font-compact font-semibold text-sm transition-colors
                    ${activeFilter === f
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-700'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col px-4">
            {filteredLog.map(({ date, calls }) => (
              <div key={date + activeFilter}>
                <p className="font-compact font-bold text-sm text-gray-400 uppercase tracking-wider pt-5 pb-3">
                  {date}
                </p>
                <div className="flex flex-col gap-3">
                  {calls.map(entry =>
                    isCardView && entry.hasRecording ? (
                      <RecordingCard
                        key={entry.id}
                        entry={entry}
                        showTranscript={activeFilter === 'Секретарь'}
                        onClick={() => { setDetailScreen('details'); setOpenEntry(entry) }}
                      />
                    ) : (
                      <CallRow key={entry.id} entry={entry}/>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ── Floating dialpad ── */}
        <button
          className="fixed z-40 w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          style={{
            bottom: '88px',
            right: 'max(16px, calc((100vw - 390px) / 2 + 16px))',
          }}
        >
          <Grid3x3 size={22} color="white" strokeWidth={1.5}/>
        </button>

        <BottomNav/>
      </div>
    </div>
  )
}
