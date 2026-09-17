import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from '../components/layout/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

type CallKind = 'incoming' | 'outgoing' | 'missed'
type ProfileKey = 'missed' | 'long' | 'spam' | 'flat'

interface Call {
  id: string
  name: string
  phone: string
  initials?: string
  initialsColor?: string
  kind: CallKind
  time: string
  duration?: string
  operator: string
  region: string
}

interface DayGroup { date: string; calls: Call[] }

const PHONE_NUMBER = '+7 916 708-20-28'

// ─── Data helpers ─────────────────────────────────────────────────────────────

const c = (
  id: string, name: string, phone: string, kind: CallKind, time: string,
  duration: string | undefined, operator: string, region: string,
  initials?: string, initialsColor?: string,
): Call => ({ id, name, phone, kind, time, duration, operator, region, initials, initialsColor })

const LOGS: Record<ProfileKey, DayGroup[]> = {
  missed: [
    { date: 'Сегодня', calls: [
      c('m1', '+7 495 221-84-10', '+7 495 221-84-10', 'missed',   '18:42', undefined, 'МТС',      'Москва'),
      c('m2', 'Мама',             '+7 916 344-12-08', 'incoming', '17:10', '6:41',    'МТС',      'Москва', 'МА', '#E91E8C'),
      c('m3', '+7 916 508-77-21', '+7 916 508-77-21', 'missed',   '15:05', undefined, 'МегаФон',  'Москва'),
      c('m4', 'Поликлиника',      '+7 499 120-45-03', 'missed',   '12:28', undefined, 'МГТС',     'Москва', 'ПО', '#2E7D32'),
      c('m5', 'Андрей',           '+7 903 188-52-64', 'outgoing', '10:14', '2:07',    'Билайн',   'Москва', 'АН', '#5B6CFF'),
    ] },
    { date: 'Вчера', calls: [
      c('m6', '+7 812 644-19-77', '+7 812 644-19-77', 'missed',   '19:33', undefined, 'Ростелеком', 'Санкт-Петербург'),
      c('m7', 'Доставка',         '+7 925 700-31-19', 'missed',   '16:02', undefined, 'МТС',      'Москва', 'ДО', '#FF9800'),
      c('m8', 'Ирина',            '+7 926 415-09-88', 'incoming', '14:20', '11:52',   'МТС',      'Москва', 'ИР', '#8E24AA'),
      c('m9', '+7 968 220-64-31', '+7 968 220-64-31', 'missed',   '11:47', undefined, 'Tele2',    'Московская область'),
    ] },
  ],
  long: [
    { date: 'Сегодня', calls: [
      c('l1', 'Сергей Петров',    '+7 916 233-80-45', 'incoming', '17:55', '38:14',   'МТС',      'Москва', 'СП', '#5B6CFF'),
      c('l2', 'Банк',             '+7 495 777-00-01', 'outgoing', '15:30', '22:06',   'МГТС',     'Москва', 'БА', '#00897B'),
      c('l3', 'Мама',             '+7 916 344-12-08', 'incoming', '13:12', '27:41',   'МТС',      'Москва', 'МА', '#E91E8C'),
      c('l4', '+7 903 555-14-72', '+7 903 555-14-72', 'outgoing', '11:08', '4:19',    'Билайн',   'Москва'),
    ] },
    { date: 'Вчера', calls: [
      c('l5', 'Подрядчик',        '+7 925 618-24-90', 'outgoing', '18:40', '51:33',   'МТС',      'Москва', 'ПО', '#FF6D00'),
      c('l6', 'Ирина',            '+7 926 415-09-88', 'incoming', '16:25', '19:57',   'МТС',      'Москва', 'ИР', '#8E24AA'),
      c('l7', 'Нотариус',         '+7 499 340-71-16', 'outgoing', '12:03', '16:48',   'МГТС',     'Москва', 'НО', '#455A64'),
      c('l8', 'Андрей',           '+7 903 188-52-64', 'incoming', '09:37', '33:12',   'Билайн',   'Москва', 'АН', '#5B6CFF'),
    ] },
  ],
  spam: [
    { date: 'Сегодня', calls: [
      c('s1', '+7 495 989-14-02', '+7 495 989-14-02', 'incoming', '18:22', '0:14',    'МТТ',      'Москва'),
      c('s2', '+7 800 350-77-12', '+7 800 350-77-12', 'missed',   '16:48', undefined, 'Ростелеком', 'Федеральный номер'),
      c('s3', '+7 495 989-14-07', '+7 495 989-14-07', 'missed',   '15:31', undefined, 'МТТ',      'Москва'),
      c('s4', 'Мама',             '+7 916 344-12-08', 'incoming', '14:05', '5:22',    'МТС',      'Москва', 'МА', '#E91E8C'),
      c('s5', '+7 962 411-08-93', '+7 962 411-08-93', 'incoming', '12:40', '0:31',    'Tele2',    'Краснодарский край'),
      c('s6', '+7 800 250-19-04', '+7 800 250-19-04', 'missed',   '10:16', undefined, 'МегаФон',  'Федеральный номер'),
    ] },
    { date: 'Вчера', calls: [
      c('s7', '+7 499 226-73-58', '+7 499 226-73-58', 'incoming', '19:02', '0:22',    'МГТС',     'Москва'),
      c('s8', '+7 495 989-14-19', '+7 495 989-14-19', 'missed',   '17:44', undefined, 'МТТ',      'Москва'),
      c('s9', 'Андрей',           '+7 903 188-52-64', 'outgoing', '13:19', '3:48',    'Билайн',   'Москва', 'АН', '#5B6CFF'),
      c('s10','+7 966 302-55-41', '+7 966 302-55-41', 'incoming', '11:25', '0:09',    'Tele2',    'Ростовская область'),
    ] },
  ],
  flat: [
    { date: 'Сегодня', calls: [
      c('f1', 'Мама',             '+7 916 344-12-08', 'incoming', '18:30', '7:12',    'МТС',      'Москва', 'МА', '#E91E8C'),
      c('f2', 'Андрей',           '+7 903 188-52-64', 'outgoing', '16:14', '3:40',    'Билайн',   'Москва', 'АН', '#5B6CFF'),
      c('f3', '+7 495 221-84-10', '+7 495 221-84-10', 'incoming', '13:02', '1:55',    'МТС',      'Москва'),
      c('f4', 'Ирина',            '+7 926 415-09-88', 'outgoing', '10:48', '4:26',    'МТС',      'Москва', 'ИР', '#8E24AA'),
    ] },
    { date: 'Вчера', calls: [
      c('f5', 'Сергей Петров',    '+7 916 233-80-45', 'incoming', '17:20', '2:31',    'МТС',      'Москва', 'СП', '#5B6CFF'),
      c('f6', 'Доставка',         '+7 925 700-31-19', 'incoming', '15:05', '0:48',    'МТС',      'Москва', 'ДО', '#FF9800'),
      c('f7', 'Мама',             '+7 916 344-12-08', 'outgoing', '12:37', '9:03',    'МТС',      'Москва', 'МА', '#E91E8C'),
      c('f8', '+7 968 220-64-31', '+7 968 220-64-31', 'missed',   '09:51', undefined, 'Tele2',    'Московская область'),
    ] },
  ],
}

interface Recommendation {
  product: string
  accent: string
  trigger: string
  title: string
  text: string
  cta: string
}

const PROFILES: Record<ProfileKey, {
  chip: string
  stats: { calls: string; minutes: string; avg: string }
  highlight: string
  rec?: Recommendation
}> = {
  missed: {
    chip: 'Пропущенные',
    stats: { calls: '212', minutes: '640', avg: '3:01' },
    highlight: '47 пропущенных за 30 дней — каждый пятый звонок',
    rec: {
      product: 'Секретарь',
      accent: '#8390FF',
      trigger: 'Вы часто не отвечаете',
      title: 'Секретарь ответит вместо вас',
      text: 'Примет звонок, спросит, по какому вопросу, и пришлёт расшифровку. Вы увидите, кто звонил и зачем, даже если не взяли трубку.',
      cta: 'Подключить за 149 ₽',
    },
  },
  long: {
    chip: 'Длинные разговоры',
    stats: { calls: '158', minutes: '1 190', avg: '7:32' },
    highlight: '31 разговор дольше 15 минут — это 9 часов за месяц',
    rec: {
      product: 'Интеллектуальная Запись',
      accent: '#7B61FF',
      trigger: 'Вы много говорите по делу',
      title: 'Не держите договорённости в голове',
      text: 'Запишет разговор, перескажет его и вытащит договорённости, суммы и даты. Вернуться к деталям можно в любой момент.',
      cta: 'Подключить за 149 ₽',
    },
  },
  spam: {
    chip: 'Незнакомые номера',
    stats: { calls: '264', minutes: '520', avg: '1:58' },
    highlight: '38 звонков с незнакомых номеров, 11 короче 30 секунд',
    rec: {
      product: 'Защитник',
      accent: '#007AFF',
      trigger: 'Вам звонят те, кого вы не знаете',
      title: 'Защитник отсечёт лишние звонки',
      text: 'Определит рекламные и мошеннические номера до того, как вы возьмёте трубку, и покажет, кто на самом деле звонит.',
      cta: 'Подключить',
    },
  },
  flat: {
    chip: 'Ровный',
    stats: { calls: '196', minutes: '610', avg: '3:07' },
    highlight: 'Звонков немного, пропущенных почти нет',
  },
}

const PROFILE_ORDER: ProfileKey[] = ['missed', 'long', 'spam', 'flat']

// ─── Small pieces ─────────────────────────────────────────────────────────────

function KindIcon({ kind }: { kind: CallKind }) {
  const color = kind === 'missed' ? '#E30611' : '#8D969F'
  if (kind === 'missed') return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M10 2.5C8.5 1 6.3 1 4.8 2.5L3.5 3.8c-.3.3-.3.8 0 1.1l.6.6c.3.3.8.3 1.1 0l.5-.5c.6-.6 1.6-.6 2.2 0 .6.6.6 1.6 0 2.2l-.5.5c-.3.3-.3.8 0 1.1l.6.6c.3.3.8.3 1.1 0L10 8c1.5-1.5 1.5-4 0-5.5z" fill={color}/>
      <path d="M1.5 1.5l3 3M4.5 1.5l-3 3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
  if (kind === 'incoming') return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M10 2.5C8.5 1 6.3 1 4.8 2.5L3.5 3.8c-.3.3-.3.8 0 1.1l.6.6c.3.3.8.3 1.1 0l.5-.5c.6-.6 1.6-.6 2.2 0 .6.6.6 1.6 0 2.2l-.5.5c-.3.3-.3.8 0 1.1l.6.6c.3.3.8.3 1.1 0L10 8c1.5-1.5 1.5-4 0-5.5z" fill={color}/>
      <path d="M2 2l2.5 2.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M2 2h2M2 2v2" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M10 2.5C8.5 1 6.3 1 4.8 2.5L3.5 3.8c-.3.3-.3.8 0 1.1l.6.6c.3.3.8.3 1.1 0l.5-.5c.6-.6 1.6-.6 2.2 0 .6.6.6 1.6 0 2.2l-.5.5c-.3.3-.3.8 0 1.1l.6.6c.3.3.8.3 1.1 0L10 8c1.5-1.5 1.5-4 0-5.5z" fill={color}/>
      <path d="M7.5 2H10M10 2v2.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function Avatar({ call }: { call: Call }) {
  return (
    <div
      className="shrink-0 w-11 h-11 flex items-center justify-center overflow-hidden"
      style={{ borderRadius: 13, background: call.initialsColor ?? 'linear-gradient(135deg, #B9C0CC, #8D969F)' }}
    >
      {call.initials
        ? <span className="text-white font-sans font-bold text-[15px]">{call.initials}</span>
        : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
      }
    </div>
  )
}

function CallRow({ call, onClick }: { call: Call; onClick: () => void }) {
  const label = call.kind === 'missed' ? 'Пропущенный'
    : call.kind === 'incoming' ? 'Входящий' : 'Исходящий'
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-white text-left active:opacity-85 transition-opacity"
      style={{ borderRadius: 22, padding: '11px 14px 11px 11px', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
    >
      <Avatar call={call}/>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <p
            className="font-sans text-[15px] font-semibold truncate"
            style={{ color: call.kind === 'missed' ? '#E30611' : '#1D2023' }}
          >
            {call.name}
          </p>
          <span className="font-compact text-[13px] shrink-0 ml-2" style={{ color: '#8D969F' }}>{call.time}</span>
        </div>
        <div className="flex items-center gap-1">
          <KindIcon kind={call.kind}/>
          <p className="font-compact text-[12px]" style={{ color: '#8D969F' }}>
            {label}{call.duration ? ` · ${call.duration}` : ''}
          </p>
        </div>
      </div>
    </button>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AllCalls() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileKey>('missed')
  const [openCall, setOpenCall] = useState<Call | null>(null)
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'done'>('idle')

  const meta = PROFILES[profile]
  const log = LOGS[profile]

  const openSheet = (call: Call) => {
    setOpenCall(call)
    setLookupState('idle')
  }

  const runLookup = () => {
    setLookupState('loading')
    setTimeout(() => setLookupState('done'), 700)
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Header */}
        <div className="px-4 pt-12 pb-3 flex-shrink-0" style={{ background: '#F9F9FB' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-2">
              <button onClick={() => navigate('/')} className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center active:opacity-60" style={{ background: 'rgba(29,32,35,0.07)' }}>
                <ArrowLeft size={18} strokeWidth={2} style={{ color: '#1D2023' }}/>
              </button>
              <div>
                <h1 className="font-sans font-black text-[1.75rem] leading-tight" style={{ color: '#1D2023' }}>Все звонки</h1>
                <p className="font-compact font-normal text-sm" style={{ color: '#8D969F' }}>{PHONE_NUMBER}</p>
              </div>
            </div>
          </div>

          {/* Demo profile switcher */}
          <p className="font-compact font-semibold text-[10px] uppercase tracking-wider mb-1.5" style={{ color: '#B9C0CC' }}>
            Профиль звонков · демо
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {PROFILE_ORDER.map(key => (
              <button
                key={key}
                onClick={() => { setProfile(key); setOpenCall(null) }}
                className="rounded-full px-3.5 py-1.5 font-compact font-semibold text-[13px] shrink-0 transition-colors"
                style={{
                  background: profile === key ? '#1D2023' : 'rgba(29,32,35,0.07)',
                  color: profile === key ? 'white' : '#1D2023',
                }}
              >
                {PROFILES[key].chip}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-28">
          <div className="px-2 pt-3 flex flex-col gap-[6px]">

            {/* Stats */}
            <div className="bg-white" style={{ borderRadius: 20, padding: '14px 16px' }}>
              <p className="font-compact font-semibold text-[11px] uppercase tracking-wider mb-2.5" style={{ color: '#B9C0CC' }}>
                За последние 30 дней
              </p>
              <div className="flex">
                {[
                  { v: meta.stats.calls,   l: 'звонков'      },
                  { v: meta.stats.minutes, l: 'минут'        },
                  { v: meta.stats.avg,     l: 'средний звонок' },
                ].map(s => (
                  <div key={s.l} className="flex-1">
                    <p className="font-sans font-black text-[20px] leading-none" style={{ color: '#1D2023' }}>{s.v}</p>
                    <p className="font-compact text-[11px] mt-1" style={{ color: '#8D969F' }}>{s.l}</p>
                  </div>
                ))}
              </div>
              <p className="font-compact text-[12px] mt-3 pt-3" style={{ color: '#5A6472', borderTop: '1px solid rgba(29,32,35,0.06)' }}>
                {meta.highlight}
              </p>
            </div>

            {/* Recommendation — only when the profile gives a reason */}
            {meta.rec && (
              <div className="bg-white overflow-hidden" style={{ borderRadius: 20 }}>
                <div style={{ height: 3, background: meta.rec.accent }}/>
                <div style={{ padding: '14px 16px 16px' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span
                      className="font-compact font-semibold text-[10px] uppercase tracking-wider px-2 py-[3px] rounded-full"
                      style={{ background: `${meta.rec.accent}1A`, color: meta.rec.accent }}
                    >
                      {meta.rec.trigger}
                    </span>
                  </div>
                  <p className="font-sans font-bold text-[17px] leading-snug mb-1.5" style={{ color: '#1D2023' }}>
                    {meta.rec.title}
                  </p>
                  <p className="font-compact text-[13px] leading-relaxed mb-3.5" style={{ color: '#5A6472' }}>
                    {meta.rec.text}
                  </p>
                  <button
                    className="w-full h-11 rounded-xl flex items-center justify-center active:opacity-80 transition-opacity"
                    style={{ background: meta.rec.accent }}
                  >
                    <span className="font-sans font-bold text-[14px] text-white">{meta.rec.cta}</span>
                  </button>
                  <p className="font-compact text-[11px] text-center mt-2" style={{ color: '#B9C0CC' }}>
                    {meta.rec.product} · первый месяц бесплатно
                  </p>
                </div>
              </div>
            )}

            {/* Call log */}
            {log.map(group => (
              <div key={group.date} className="flex flex-col gap-[6px]">
                <p className="font-compact font-semibold text-[12px] px-3 pt-2 pb-0.5" style={{ color: '#8D969F' }}>
                  {group.date}
                </p>
                {group.calls.map(call => (
                  <CallRow key={call.id} call={call} onClick={() => openSheet(call)}/>
                ))}
              </div>
            ))}
          </div>
        </div>

        <BottomNav/>

        {/* Call sheet with on-demand number lookup */}
        <AnimatePresence>
          {openCall && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/30" onClick={() => setOpenCall(null)}/>
              <motion.div
                className="relative w-full max-w-app bg-white"
                style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 'env(safe-area-inset-bottom)' }}
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                <div style={{ padding: '18px 18px 24px' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar call={openCall}/>
                      <div className="min-w-0">
                        <p className="font-sans font-bold text-[17px] truncate" style={{ color: '#1D2023' }}>{openCall.name}</p>
                        <p className="font-compact text-[13px]" style={{ color: '#8D969F' }}>
                          {openCall.kind === 'missed' ? 'Пропущенный' : openCall.kind === 'incoming' ? 'Входящий' : 'Исходящий'}
                          {' · '}{openCall.time}{openCall.duration ? ` · ${openCall.duration}` : ''}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setOpenCall(null)} className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center active:opacity-60" style={{ background: 'rgba(29,32,35,0.07)' }}>
                      <X size={16} strokeWidth={2} style={{ color: '#1D2023' }}/>
                    </button>
                  </div>

                  <div style={{ borderRadius: 16, background: '#F5F6F9', padding: '14px 16px' }}>
                    <p className="font-sans font-semibold text-[14px] mb-0.5" style={{ color: '#1D2023' }}>Проверка номера</p>
                    <p className="font-compact text-[12px] mb-3" style={{ color: '#8D969F' }}>
                      {openCall.phone}
                    </p>

                    {lookupState === 'idle' && (
                      <>
                        <button
                          onClick={runLookup}
                          className="w-full h-10 rounded-xl flex items-center justify-center active:opacity-80 transition-opacity"
                          style={{ background: '#1D2023' }}
                        >
                          <span className="font-sans font-bold text-[13px] text-white">Проверить номер</span>
                        </button>
                        <p className="font-compact text-[11px] text-center mt-2" style={{ color: '#B9C0CC' }}>
                          Оператор и регион запрашиваются по вашему запросу
                        </p>
                      </>
                    )}

                    {lookupState === 'loading' && (
                      <div className="h-10 flex items-center justify-center gap-2">
                        <motion.div
                          className="w-4 h-4 rounded-full"
                          style={{ border: '2px solid rgba(29,32,35,0.15)', borderTopColor: '#1D2023' }}
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                        />
                        <span className="font-compact text-[13px]" style={{ color: '#8D969F' }}>Проверяем…</span>
                      </div>
                    )}

                    {lookupState === 'done' && (
                      <div className="flex flex-col gap-2">
                        {[
                          { l: 'Оператор', v: openCall.operator },
                          { l: 'Регион',   v: openCall.region   },
                        ].map(r => (
                          <div key={r.l} className="flex items-center justify-between">
                            <span className="font-compact text-[13px]" style={{ color: '#8D969F' }}>{r.l}</span>
                            <span className="font-sans font-semibold text-[14px]" style={{ color: '#1D2023' }}>{r.v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    className="w-full h-12 rounded-xl flex items-center justify-center mt-3 active:opacity-80 transition-opacity"
                    style={{ background: 'rgba(29,32,35,0.07)' }}
                  >
                    <span className="font-sans font-bold text-[14px]" style={{ color: '#1D2023' }}>Позвонить</span>
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
