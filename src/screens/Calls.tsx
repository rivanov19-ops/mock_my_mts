import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Settings, X, Grid3x3, ArrowUpRight, Play } from 'lucide-react'
import { BottomNav } from '../components/layout/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

type CallType = 'outgoing' | 'incoming' | 'secretary'
type FilterTab = 'Все' | 'Записи' | 'Секретарь'

interface CallEntry {
  id: string
  name: string
  initials?: string
  initialsColor?: string
  callType: CallType
  typeLabel: string
  time: string
  voicemail?: boolean
  secretaryIcon?: boolean
  hasRecording?: boolean
  duration?: string
  transcript?: string
}

const PHONE_NUMBER = '+7 916 708-20-28'

const CALL_LOG: { date: string; calls: CallEntry[] }[] = [
  {
    date: 'СЕГОДНЯ',
    calls: [
      { id: '1', name: 'Мама', initials: 'М', initialsColor: '#9CA3AF', callType: 'outgoing', typeLabel: 'Исходящий', time: '09:56', hasRecording: true, duration: '02:29' },
    ],
  },
  {
    date: 'ВЧЕРА',
    calls: [
      { id: '2', name: 'Оля Баба', initials: 'ОБ', initialsColor: '#7B8EC8', callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '21:26', secretaryIcon: true, hasRecording: true, duration: '02:40', transcript: 'Алло!' },
      { id: '3', name: 'Оля Баба', initials: 'ОБ', initialsColor: '#7B8EC8', callType: 'secretary', typeLabel: 'Ответил Секретарь', time: '21:22', secretaryIcon: true, hasRecording: true, duration: '00:15', transcript: 'Передайте, чтоб маме перезвонил.' },
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

// ─── Helpers: filter data per tab ─────────────────────────────────────────────

function getFilteredLog(tab: FilterTab) {
  if (tab === 'Все') return CALL_LOG

  const filtered = CALL_LOG.map(group => {
    const calls = group.calls.filter(c =>
      tab === 'Записи' ? c.hasRecording : c.callType === 'secretary',
    )
    return { ...group, calls }
  }).filter(g => g.calls.length > 0)

  return filtered
}

// ─── Voicemail icon (∞-style) ─────────────────────────────────────────────────

function VoicemailIcon() {
  return (
    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
        <circle cx="5" cy="7" r="4" stroke="#60A5FA" strokeWidth="2" />
        <circle cx="15" cy="7" r="4" stroke="#60A5FA" strokeWidth="2" />
        <line x1="5" y1="11" x2="15" y2="11" stroke="#60A5FA" strokeWidth="2" />
      </svg>
    </div>
  )
}

// ─── Secretary →T icon (small, in call row) ──────────────────────────────────

function SecretaryIcon() {
  return (
    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
        <path d="M2 8 H12 M9 5 L12 8 L9 11" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 4 H19 M17 4 V12" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  )
}

// ─── Transcribe →T icon (for recording cards) ───────────────────────────────

function TranscribeIcon() {
  return (
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
        <path d="M2 8H10M7 5L10 8L7 11" stroke="#F44336" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 4H18M16 4V12" stroke="#F44336" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  )
}

// ─── Audio Player ────────────────────────────────────────────────────────────

function AudioPlayer({ duration }: { duration: string }) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <button className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
        <Play size={18} color="white" fill="white" className="ml-0.5" />
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="w-full h-1 bg-gray-200 rounded-full" />
        <div className="flex justify-between">
          <span className="text-xs text-gray-400 font-compact">00:00</span>
          <span className="text-xs text-gray-400 font-compact">{duration}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function CallAvatar({ initials, initialsColor, callType }: {
  initials?: string
  initialsColor?: string
  callType: CallType
}) {
  const hasInitials = !!initials

  return (
    <div className="relative shrink-0 w-[52px] h-[52px]">
      <div
        className={`w-[52px] h-[52px] flex items-center justify-center overflow-hidden
          ${hasInitials ? 'rounded-2xl' : 'rounded-full'}`}
        style={{ background: hasInitials ? initialsColor : '#D1D5DB' }}
      >
        {hasInitials
          ? <span className="text-white font-sans font-bold text-base">{initials}</span>
          : (
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <circle cx="17" cy="13" r="7" fill="#9CA3AF" />
              <path d="M3 30c0-7.732 6.268-12 14-12s14 4.268 14 12" fill="#9CA3AF" />
            </svg>
          )
        }
      </div>

      {/* Secretary sparkle badge */}
      {callType === 'secretary' && hasInitials && (
        <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-white flex items-center justify-center"
          style={{ boxShadow: '0 0 0 1.5px #E5E7EB' }}>
          <span style={{ fontSize: 10 }}>✦</span>
        </div>
      )}

      {/* Arrow badge for outgoing/incoming */}
      {callType !== 'secretary' && (
        <div className="absolute -bottom-0.5 -left-0.5 w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center"
          style={{ boxShadow: '0 0 0 1.5px #E5E7EB' }}>
          <ArrowUpRight size={10} strokeWidth={2.5} className="text-gray-400" />
        </div>
      )}
    </div>
  )
}

// ─── Simple call row (for "Все" tab) ─────────────────────────────────────────

function CallRow({ entry }: { entry: CallEntry }) {
  return (
    <button
      className="w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5 text-left active:bg-gray-50 transition-colors"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}
    >
      <CallAvatar initials={entry.initials} initialsColor={entry.initialsColor} callType={entry.callType} />
      <div className="flex-1 min-w-0">
        <p className="font-sans font-bold text-base text-gray-900 truncate">{entry.name}</p>
        <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">{entry.typeLabel}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {entry.voicemail && <VoicemailIcon />}
        {entry.secretaryIcon && <SecretaryIcon />}
        <span className="font-compact font-normal text-sm text-gray-500 min-w-[38px] text-right">{entry.time}</span>
      </div>
    </button>
  )
}

// ─── Recording card (for "Записи" & "Секретарь" tabs) ───────────────────────

function RecordingCard({ entry, showTranscript }: { entry: CallEntry; showTranscript?: boolean }) {
  return (
    <div
      className="w-full bg-white rounded-2xl px-4 py-3.5 text-left"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}
    >
      {/* Top row: avatar + name + time */}
      <div className="flex items-center gap-4">
        <CallAvatar initials={entry.initials} initialsColor={entry.initialsColor} callType={entry.callType} />
        <div className="flex-1 min-w-0">
          <p className="font-sans font-bold text-base text-gray-900 truncate">{entry.name}</p>
          <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">{entry.typeLabel}</p>
        </div>
        <span className="font-compact font-normal text-sm text-gray-500 shrink-0">{entry.time}</span>
      </div>

      {/* Audio player + transcribe */}
      <div className="flex items-end gap-2 mt-1 pl-[68px]">
        <div className="flex-1">
          <AudioPlayer duration={entry.duration!} />
        </div>
        <TranscribeIcon />
      </div>

      {/* Transcript text */}
      {showTranscript && entry.transcript && (
        <p className="font-compact font-normal text-sm text-gray-900 mt-3 pl-1">{entry.transcript}</p>
      )}
    </div>
  )
}

// ─── Banner configs ──────────────────────────────────────────────────────────

const BANNERS: Record<FilterTab, { title: string; subtitle: string; icon: 'secretary' | 'voicemail' }> = {
  'Все':       { title: 'Секретарь в звонке', subtitle: 'Команды для вашего цифрового помощника', icon: 'secretary' },
  'Записи':    { title: 'Интеллектуальная запись', subtitle: 'Все возможности записи разговоров', icon: 'voicemail' },
  'Секретарь': { title: 'Секретарь в звонке', subtitle: 'Команды для вашего цифрового помощника', icon: 'secretary' },
}

// ─── Calls ────────────────────────────────────────────────────────────────────

export default function Calls() {
  const navigate = useNavigate()
  const [bannerVisible, setBannerVisible] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Все')

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
                <Settings size={18} color="white" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* ── White card ── */}
        <div className="flex-1 bg-white rounded-t-[28px] -mt-10 overflow-y-auto pb-24 flex flex-col">

          <div className="px-4 pt-5 pb-3 flex flex-col gap-4">

            {/* Banner */}
            {bannerVisible && (
              <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: '#E8EAF4' }}>
                {banner.icon === 'voicemail' ? (
                  <div className="shrink-0">
                    <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
                      <circle cx="8" cy="9" r="5.5" stroke="#374151" strokeWidth="2" />
                      <circle cx="20" cy="9" r="5.5" stroke="#374151" strokeWidth="2" />
                      <line x1="8" y1="14.5" x2="20" y2="14.5" stroke="#374151" strokeWidth="2" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect x="3" y="3" width="16" height="16" rx="5" stroke="white" strokeWidth="1.8" />
                      <circle cx="11" cy="11" r="2" fill="white" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-bold text-sm text-gray-900">{banner.title}</p>
                  <p className="font-compact font-normal text-xs text-gray-400 mt-0.5 leading-snug">{banner.subtitle}</p>
                </div>
                <button onClick={() => setBannerVisible(false)} className="shrink-0 ml-1">
                  <X size={16} className="text-gray-400" strokeWidth={2} />
                </button>
              </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3">
              <Search size={16} className="text-gray-400 shrink-0" strokeWidth={1.5} />
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
                      />
                    ) : (
                      <CallRow key={entry.id} entry={entry} />
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
          <Grid3x3 size={22} color="white" strokeWidth={1.5} />
        </button>

        <BottomNav />
      </div>
    </div>
  )
}
