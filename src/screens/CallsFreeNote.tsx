import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, X, Mic, Square, Check, ChevronDown, AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { appHome } from '../core/appHome'

// ─── Свободная голосовая заметка · этап 2 «Моего Контекста» ───────────────────
// Ветка /calls/dictaphone (заметка с карточки контакта) не трогается.
//
// Отличие от этапа 1: привязки нет на входе. Пользователь наговаривает всё
// подряд, одна заметка задевает несколько человек и сюжетов, разложить их —
// работа системы. Отсюда всё остальное:
//
//   1. Адресат у каждого пункта показан явно и меняется в один тап. Раскладка
//      по контактам — угадывание, и цена ошибки выше, чем у извлечения текста:
//      факт про Сергея, уехавший к маме, пользователь найдёт нескоро.
//   2. Где имя названо прямо — привязываем молча. Где названо родство или роль
//      и кандидатов несколько — спрашиваем до сохранения, а не решаем сами.
//   3. Пункт без адресата — нормальный исход, а не ошибка: уходит в «Только мне».
//   4. Итоговый экран показывает раскладку целиком: что и кому ушло из одной
//      записи. Без него пользователь не понимает, куда делась его заметка.

// ─── Контакты ─────────────────────────────────────────────────────────────────

interface Contact {
  id: string
  name: string
  initials: string
  color: string
  role: string
  storyline?: string
}

const CONTACTS: Contact[] = [
  { id: 'sergey', name: 'Сергей', initials: 'СЕ', color: '#FF9500', role: 'прораб', storyline: 'Ремонт' },
  { id: 'alena', name: 'Алёна', initials: 'АЛ', color: '#34C759', role: 'жена', storyline: 'Дача' },
  { id: 'mama', name: 'Мама', initials: 'МА', color: '#AF52DE', role: 'Ирина Петровна' },
  { id: 'mama-lena', name: 'Мама Лена', initials: 'МЛ', color: '#FF2D55', role: 'мама Алёны' },
]

const SELF = { id: 'self', name: 'Только мне', initials: 'Я', color: '#8D969F', role: 'личные задачи' } as const

const byId = (id: string): Contact | typeof SELF | null =>
  id === SELF.id ? SELF : CONTACTS.find(c => c.id === id) ?? null

// ─── Заметка ──────────────────────────────────────────────────────────────────

// Дословно то, что наговорили. Одна запись про четырёх адресатов — ровно тот
// случай, ради которого свободная заметка и нужна.
const TRANSCRIPT =
  'Так, по дороге домой, пока не забыл. Сергей сказал, плитку раньше двадцать пятого не привезут, решаем в пятницу вместе со сметой. Алёне надо перезвонить до обеда, она спрашивала, едем ли мы на дачу в выходные. Маме обещал разобраться с тарифом, у неё второй месяц списывают лишнее. И самому не забыть продлить страховку до среды.'

type ExtractKind = 'fact' | 'task' | 'story'

interface Extracted {
  kind: ExtractKind
  text: string
  quote: string
  target: string          // '' — адресат не определён, нужен выбор пользователя
  storyline?: string
  reason: string          // почему привязали именно так — показываем рядом с цитатой
  candidates?: string[]   // варианты, когда однозначного адресата нет
}

const EXTRACTED: Extracted[] = [
  {
    kind: 'fact',
    text: 'Плитку привезут не раньше 25-го',
    quote: 'плитку раньше двадцать пятого не привезут',
    target: 'sergey',
    storyline: 'Ремонт',
    reason: 'имя названо прямо',
  },
  {
    kind: 'task',
    text: 'Решить по плитке в пятницу — вместе со сметой',
    quote: 'решаем в пятницу вместе со сметой',
    target: 'sergey',
    storyline: 'Ремонт',
    reason: 'та же фраза, что и про плитку',
  },
  {
    kind: 'task',
    text: 'Перезвонить до обеда — подтвердить дачу на выходные',
    quote: 'Алёне надо перезвонить до обеда',
    target: 'alena',
    storyline: 'Дача',
    reason: 'имя названо прямо',
  },
  {
    kind: 'task',
    text: 'Разобраться с тарифом — второй месяц списывают лишнее',
    quote: 'Маме обещал разобраться с тарифом',
    target: '',
    reason: 'сказано «маме», а в контактах их две',
    candidates: ['mama', 'mama-lena'],
  },
  {
    kind: 'task',
    text: 'Продлить страховку до среды',
    quote: 'самому не забыть продлить страховку до среды',
    target: SELF.id,
    reason: 'про себя — человек не назван',
  },
]

const KIND_META: Record<ExtractKind, { label: string; color: string; bg: string }> = {
  fact: { label: 'Факт о человеке', color: '#0070E5', bg: '#E6F1FC' },
  task: { label: 'Задача', color: '#E30611', bg: '#FDECEC' },
  story: { label: 'Сюжет', color: '#B45309', bg: '#FEF3C7' },
}

// Уже сохранённые заметки — чтобы список не был пустым на первом показе
const PAST_NOTES = [
  { text: 'Про машину: до среды продлить ОСАГО, в сервисе сказали менять колодки', when: 'Вчера, 19:40', targets: ['self'] },
  { text: 'Созвон с Сергеем: смету пришлёт до пятницы, по плитке два варианта', when: '12 августа', targets: ['sergey'] },
]

const LIMIT_TOTAL = 10
const MAX_SECONDS = 180

const notesWord = (n: number) => {
  const k = n % 100
  if (k >= 11 && k <= 14) return 'заметок'
  switch (n % 10) {
    case 1: return 'заметка'
    case 2: case 3: case 4: return 'заметки'
    default: return 'заметок'
  }
}

const itemsWord = (n: number) => {
  const k = n % 100
  if (k >= 11 && k <= 14) return 'пунктов'
  switch (n % 10) {
    case 1: return 'пункт'
    case 2: case 3: case 4: return 'пункта'
    default: return 'пунктов'
  }
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// ─── Мелкие элементы ──────────────────────────────────────────────────────────

function Avatar({ person, size = 26 }: { person: Contact | typeof SELF; size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size, height: size,
        background: person.id === SELF.id
          ? '#E5E5EA'
          : `linear-gradient(180deg, ${person.color}99, ${person.color})`,
      }}>
      <span className="font-sans font-bold text-white" style={{ fontSize: size * 0.36, color: person.id === SELF.id ? '#5C6570' : 'white' }}>
        {person.initials}
      </span>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="font-compact text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">{label}</p>
      {children}
    </div>
  )
}

function NoteMark() {
  return (
    <span className="inline-flex items-center gap-1 shrink-0 px-1.5 py-[2px] rounded-full align-middle" style={{ background: '#EDE9FE' }}>
      <Mic size={9} strokeWidth={2.6} style={{ color: '#6D28D9' }}/>
      <span className="font-compact text-[10px] font-bold" style={{ color: '#6D28D9' }}>заметка</span>
    </span>
  )
}

// ─── Экран записи ─────────────────────────────────────────────────────────────
// Привязки нет, и это сказано прямо: обещание «разложим сами» надо дать до
// записи, иначе пользователь наговорит про одного человека и не воспользуется
// главным свойством режима.

function RecorderScreen({ onCancel, onDone }: { onCancel: () => void; onDone: () => void }) {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    timer.current = window.setInterval(() => {
      setSeconds(s => {
        if (s + 1 >= MAX_SECONDS) { setRunning(false); return MAX_SECONDS }
        return s + 1
      })
    }, 1000)
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [running])

  const progress = seconds / MAX_SECONDS

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#1D2023' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* relative z-10 обязателен: центральный блок ниже поднят на -mt-10 и
            без этого перекрывает крестик — кнопка видна, но не нажимается */}
        <div className="px-4 pt-12 pb-3 flex items-center relative z-10">
          <button onClick={onCancel} className="w-9 h-9 flex items-center justify-center -ml-2 active:opacity-60">
            <X size={22} strokeWidth={2} style={{ color: 'white' }}/>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-10">

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-9" style={{ background: 'rgba(255,255,255,0.10)' }}>
            <Mic size={13} strokeWidth={2.4} style={{ color: 'rgba(255,255,255,0.7)' }}/>
            <span className="font-compact text-[13px]" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Заметка без привязки
            </span>
          </div>

          <div className="relative flex items-center justify-center mb-8" style={{ width: 168, height: 168 }}>
            <svg width="168" height="168" viewBox="0 0 168 168" className="absolute -rotate-90">
              <circle cx="84" cy="84" r="78" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3"/>
              <circle cx="84" cy="84" r="78" fill="none" stroke="#E30611" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 78}
                strokeDashoffset={2 * Math.PI * 78 * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}/>
            </svg>

            {running ? (
              <div className="flex items-end gap-[5px]" style={{ height: 54 }}>
                {[0.45, 0.9, 0.6, 1, 0.7, 0.35, 0.8].map((h, i) => (
                  <motion.span key={i} className="rounded-full" style={{ width: 5, background: '#E30611' }}
                    animate={{ height: [12, 54 * h, 16, 44 * h, 12] }}
                    transition={{ duration: 1.1 + i * 0.13, repeat: Infinity, ease: 'easeInOut' }}/>
                ))}
              </div>
            ) : (
              <Mic size={46} strokeWidth={1.7} style={{ color: 'rgba(255,255,255,0.55)' }}/>
            )}
          </div>

          <p className="font-sans font-black text-[34px] tabular-nums" style={{ color: 'white' }}>{mmss(seconds)}</p>
          <p className="font-compact text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {seconds >= MAX_SECONDS ? 'Достигнут предел — 3 минуты' : `максимум ${mmss(MAX_SECONDS)}`}
          </p>

          <p className="font-compact text-[14px] text-center leading-snug mt-8 px-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {running
              ? 'Говорите про всех сразу — разложим по людям и сюжетам'
              : 'Всё, что накопилось за день. Про кого — определим сами'}
          </p>
        </div>

        <div className="px-8 pb-12 flex flex-col items-center gap-4">
          {running || seconds >= MAX_SECONDS ? (
            <button onClick={onDone}
              className="w-full rounded-2xl py-4 font-sans font-bold text-[16px] active:opacity-85 transition-opacity flex items-center justify-center gap-2"
              style={{ background: 'white', color: '#1D2023' }}>
              <Square size={15} strokeWidth={2.6} fill="#1D2023" style={{ color: '#1D2023' }}/>
              Остановить и расшифровать
            </button>
          ) : (
            <button onClick={() => setRunning(true)}
              className="w-full rounded-2xl py-4 font-sans font-bold text-[16px] text-white active:opacity-85 transition-opacity flex items-center justify-center gap-2"
              style={{ background: '#E30611' }}>
              <Mic size={17} strokeWidth={2.4}/>
              Начать запись
            </button>
          )}
          <p className="font-compact text-[11px] text-center leading-snug" style={{ color: 'rgba(255,255,255,0.32)' }}>
            Запись идёт только пока открыт этот экран. Фоновой записи нет.
          </p>
        </div>
      </div>
    </div>
  )
}

function ProcessingScreen() {
  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col items-center justify-center min-h-screen px-10">
        <motion.div className="flex items-center justify-center rounded-full mb-5"
          style={{ width: 56, height: 56, background: '#FDECEC' }}
          animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
          <Mic size={24} strokeWidth={2} style={{ color: '#E30611' }}/>
        </motion.div>
        <p className="font-sans font-bold text-[16px]" style={{ color: '#1D2023' }}>Расшифровываем и раскладываем</p>
        <p className="font-compact text-[13px] mt-1 text-center" style={{ color: '#8D969F' }}>
          Свободная заметка · 41 секунда
        </p>
      </div>
    </div>
  )
}

// ─── Выбор адресата ───────────────────────────────────────────────────────────

function AssigneeSheet({ current, onPick, onClose }: {
  current: string
  onPick: (id: string) => void
  onClose: () => void
}) {
  const rows: (Contact | typeof SELF)[] = [...CONTACTS, SELF]
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-app rounded-t-3xl bg-white px-4 pt-4 pb-8"
        onClick={e => e.stopPropagation()}>
        <p className="font-sans font-bold text-[17px] mb-1" style={{ color: '#1D2023' }}>Кому это относится</p>
        <p className="font-compact text-[13px] mb-3" style={{ color: '#8D969F' }}>
          Пункт уйдёт в контекст выбранного человека
        </p>

        {rows.map(p => (
          <button key={p.id} onClick={() => onPick(p.id)}
            className="w-full flex items-center gap-3 py-2.5 active:opacity-60"
            style={{ borderTop: '1px solid #F2F2F7' }}>
            <Avatar person={p} size={34}/>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-compact text-[15px]" style={{ color: '#1D2023' }}>{p.name}</p>
              <p className="font-compact text-[12px]" style={{ color: '#8D969F' }}>{p.role}</p>
            </div>
            {current === p.id && <Check size={18} strokeWidth={2.6} style={{ color: '#0070E5' }}/>}
          </button>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Верификация и раскладка ──────────────────────────────────────────────────

function ReviewScreen({ onCancel, onSave }: {
  onCancel: () => void
  onSave: (kept: { item: Extracted; target: string }[]) => void
}) {
  const [dropped, setDropped] = useState<number[]>([])
  const [showQuote, setShowQuote] = useState<number | null>(null)
  const [assigned, setAssigned] = useState<Record<number, string>>(
    () => Object.fromEntries(EXTRACTED.map((e, i) => [i, e.target])),
  )
  const [sheetFor, setSheetFor] = useState<number | null>(null)

  const kept = EXTRACTED
    .map((item, i) => ({ item, target: assigned[i], i }))
    .filter(x => !dropped.includes(x.i))

  const unresolved = kept.filter(x => !x.target).length
  const people = Array.from(new Set(kept.map(x => x.target).filter(Boolean)))

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen">

        <div className="px-4 pt-12 pb-3 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="w-9 h-9 flex items-center justify-center shrink-0 -ml-2 active:opacity-60">
              <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-sans font-bold text-[17px]" style={{ color: '#1D2023' }}>Что мы поняли</p>
              <p className="font-compact text-xs" style={{ color: '#8D969F' }}>Проверьте, кому что уйдёт</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">

          {/* Сводка раскладки: одна заметка задела несколько человек */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="font-compact text-[12px]" style={{ color: '#8D969F' }}>Заметка коснётся</span>
            {people.map(id => {
              const p = byId(id)
              if (!p) return null
              return (
                <span key={id} className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                  style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <Avatar person={p} size={18}/>
                  <span className="font-compact text-[12px] font-semibold" style={{ color: '#1D2023' }}>{p.name}</span>
                </span>
              )
            })}
          </div>

          <Section label="Расшифровка">
            <div className="bg-white rounded-2xl px-4 py-3.5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
              <p className="font-compact text-[14px] leading-relaxed" style={{ color: '#1D2023' }}>{TRANSCRIPT}</p>
            </div>
          </Section>

          <Section label={`Извлекли · ${kept.length} из ${EXTRACTED.length}`}>
            {EXTRACTED.map((e, i) => {
              const meta = KIND_META[e.kind]
              const isDropped = dropped.includes(i)
              const target = assigned[i]
              const person = target ? byId(target) : null
              const needsPick = !target && !isDropped

              return (
                <div key={i} className="bg-white rounded-2xl px-4 py-3.5 mb-2 relative"
                  style={{
                    boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
                    opacity: isDropped ? 0.42 : 1,
                    border: needsPick ? '1px solid #FCD34D' : '1px solid transparent',
                  }}>
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="font-compact text-[9px] font-bold uppercase tracking-wider px-1.5 py-[3px] rounded-full shrink-0"
                      style={{ background: meta.bg, color: meta.color }}>
                      {e.kind === 'story' && e.storyline ? `Сюжет «${e.storyline}»` : meta.label}
                    </span>
                    <div className="flex-1"/>
                    {isDropped ? (
                      <button onClick={() => setDropped(d => d.filter(x => x !== i))}
                        className="font-compact text-[12px] font-semibold shrink-0 active:opacity-60" style={{ color: '#0070E5' }}>
                        Вернуть
                      </button>
                    ) : (
                      <button onClick={() => setDropped(d => [...d, i])}
                        className="flex items-center justify-center shrink-0 active:opacity-60 -mt-0.5" style={{ width: 22, height: 22 }}>
                        <X size={14} strokeWidth={2.2} style={{ color: '#1D2023', opacity: 0.3 }}/>
                      </button>
                    )}
                  </div>

                  <p className="font-compact text-[14px] leading-snug" style={{ color: '#1D2023', textDecoration: isDropped ? 'line-through' : 'none' }}>
                    {e.text}
                  </p>

                  {/* Адресат. Главное отличие свободной заметки: привязку видно
                      и меняют в один тап, не проваливаясь в контакт */}
                  {needsPick ? (
                    <div className="mt-2.5 rounded-xl px-3 py-2.5" style={{ background: '#FFFBEB' }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertCircle size={13} strokeWidth={2.4} style={{ color: '#B45309' }}/>
                        <span className="font-compact text-[12px] font-semibold" style={{ color: '#B45309' }}>
                          Не поняли, кому это
                        </span>
                      </div>
                      <p className="font-compact text-[12px] mb-2" style={{ color: '#8D969F' }}>{e.reason}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(e.candidates ?? []).map(cid => {
                          const c = byId(cid)
                          if (!c) return null
                          return (
                            <button key={cid} onClick={() => setAssigned(a => ({ ...a, [i]: cid }))}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white active:opacity-60"
                              style={{ boxShadow: '0 1px 5px rgba(0,0,0,0.08)' }}>
                              <Avatar person={c} size={17}/>
                              <span className="font-compact text-[12px] font-semibold" style={{ color: '#1D2023' }}>{c.name}</span>
                            </button>
                          )
                        })}
                        <button onClick={() => setAssigned(a => ({ ...a, [i]: SELF.id }))}
                          className="px-2 py-1 rounded-full bg-white font-compact text-[12px] active:opacity-60"
                          style={{ color: '#5C6570', boxShadow: '0 1px 5px rgba(0,0,0,0.08)' }}>
                          Только мне
                        </button>
                      </div>
                    </div>
                  ) : person ? (
                    <button onClick={() => setSheetFor(i)}
                      className="flex items-center gap-1.5 mt-2.5 pl-1 pr-2 py-1 rounded-full active:opacity-60"
                      style={{ background: '#F2F2F7' }}>
                      <Avatar person={person} size={18}/>
                      <span className="font-compact text-[12px] font-semibold" style={{ color: '#1D2023' }}>{person.name}</span>
                      {e.storyline && (
                        <span className="font-compact text-[11px]" style={{ color: '#8D969F' }}>· {e.storyline}</span>
                      )}
                      <ChevronDown size={13} strokeWidth={2.4} style={{ color: '#8D969F' }}/>
                    </button>
                  ) : null}

                  {/* Цитата и основание привязки: проверяться должны обе догадки —
                      и что извлекли, и кому это отнесли */}
                  <button onClick={() => setShowQuote(q => q === i ? null : i)}
                    className="font-compact text-[12px] font-semibold mt-2 block active:opacity-60" style={{ color: '#0070E5' }}>
                    {showQuote === i ? 'Скрыть цитату' : 'Откуда это'}
                  </button>
                  <AnimatePresence>
                    {showQuote === i && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <p className="font-compact text-[13px] leading-snug mt-2 pl-3 py-1"
                          style={{ color: '#8D969F', borderLeft: '2px solid #E5E5EA' }}>
                          «{e.quote}»
                        </p>
                        {!needsPick && (
                          <p className="font-compact text-[12px] mt-1.5 pl-3" style={{ color: '#B0B7BE' }}>
                            Кому: {e.reason}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </Section>
        </div>

        <div className="px-4 pb-8 pt-3 bg-white border-t border-gray-100 shrink-0">
          {unresolved > 0 && (
            <p className="font-compact text-[12px] text-center mb-2" style={{ color: '#B45309' }}>
              Остался {unresolved} {itemsWord(unresolved)} без адресата
            </p>
          )}
          <button onClick={() => onSave(kept.map(({ item, target }) => ({ item, target })))}
            disabled={!kept.length || unresolved > 0}
            className="w-full rounded-2xl py-3.5 font-sans font-bold text-[16px] text-white active:opacity-85 transition-opacity"
            style={{ background: kept.length && !unresolved ? '#1D2023' : '#C7C7CC' }}>
            Разложить по контактам
          </button>
        </div>
      </div>

      <AnimatePresence>
        {sheetFor !== null && (
          <AssigneeSheet
            current={assigned[sheetFor] ?? ''}
            onPick={id => { setAssigned(a => ({ ...a, [sheetFor]: id })); setSheetFor(null) }}
            onClose={() => setSheetFor(null)}/>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Итог раскладки ───────────────────────────────────────────────────────────
// Без этого экрана свободная заметка выглядит как отправка в пустоту: человек
// сказал одно длинное сообщение и не знает, что с ним стало.

function ResultScreen({ saved, onDone, onOpenContact }: {
  saved: { item: Extracted; target: string }[]
  onDone: () => void
  onOpenContact: () => void
}) {
  const order: string[] = []
  const groups: Record<string, Extracted[]> = {}
  saved.forEach(({ item, target }) => {
    if (!groups[target]) { groups[target] = []; order.push(target) }
    groups[target].push(item)
  })

  const mergedWithCalls = saved.some(s => s.target === 'sergey')

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen">

        <div className="px-4 pt-12 pb-4 bg-white shrink-0">
          <div className="flex items-center justify-center rounded-full mb-3" style={{ width: 40, height: 40, background: '#E9F9EE' }}>
            <Check size={21} strokeWidth={2.6} style={{ color: '#34C759' }}/>
          </div>
          <h1 className="font-sans font-black text-[22px] leading-tight" style={{ color: '#1D2023' }}>
            Разложили по местам
          </h1>
          <p className="font-compact text-[13px] mt-1" style={{ color: '#8D969F' }}>
            Одна заметка · {saved.length} {itemsWord(saved.length)} · {order.length} {order.length === 1 ? 'адресат' : 'адресата'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">

          {order.map(id => {
            const p = byId(id)
            if (!p) return null
            const items = groups[id]
            return (
              <div key={id} className="bg-white rounded-2xl overflow-hidden mb-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
                <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: '#FAFAFC' }}>
                  <Avatar person={p} size={30}/>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-bold text-[15px]" style={{ color: '#1D2023' }}>{p.name}</p>
                    <p className="font-compact text-[12px]" style={{ color: '#8D969F' }}>{p.role}</p>
                  </div>
                  <span className="font-compact text-[12px] font-bold px-2 py-[3px] rounded-full shrink-0"
                    style={{ background: '#EDE9FE', color: '#6D28D9' }}>
                    +{items.length}
                  </span>
                </div>
                {items.map((it, k) => (
                  <div key={k} className="px-4 py-3" style={{ borderTop: '1px solid #F2F2F7' }}>
                    <p className="font-compact text-sm leading-snug" style={{ color: '#1D2023' }}>{it.text}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <NoteMark/>
                      <span className="font-compact text-[12px]" style={{ color: '#8D969F' }}>
                        {it.kind === 'task' ? 'в открытые пункты' : 'в «что известно»'}
                      </span>
                      {it.storyline && (
                        <span className="font-compact text-[11px] px-2 py-[2px] rounded-full" style={{ background: '#F2F2F7', color: '#1D2023' }}>
                          {it.storyline}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

          {/* Склейка — то же обещание, что и в заметке с карточки контакта */}
          {mergedWithCalls && (
            <div className="rounded-2xl px-4 py-3.5 mb-2" style={{ background: '#EDE9FE', border: '1px solid #C4B5FD' }}>
              <p className="font-compact text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#6D28D9' }}>
                Склеилось с разговорами
              </p>
              <p className="font-compact text-[13px] leading-snug" style={{ color: '#1D2023' }}>
                Пункт «Смета на кухню» висел у Сергея с 5 августа. Ваша заметка добавила к нему срок —
                в самом разговоре его не было.
              </p>
            </div>
          )}

          <p className="font-compact text-[12px] text-center px-6 mt-4" style={{ color: '#8D969F' }}>
            Запись и расшифровка остаются целиком — любой пункт можно открыть до исходной фразы.
          </p>
        </div>

        <div className="px-4 pb-8 pt-3 bg-white border-t border-gray-100 shrink-0 flex gap-2">
          <button onClick={onOpenContact}
            className="flex-1 rounded-2xl py-3.5 font-sans font-bold text-[15px] active:opacity-85 transition-opacity"
            style={{ background: '#F2F2F7', color: '#1D2023' }}>
            Открыть Сергея
          </button>
          <button onClick={onDone}
            className="flex-1 rounded-2xl py-3.5 font-sans font-bold text-[15px] text-white active:opacity-85 transition-opacity"
            style={{ background: '#1D2023' }}>
            Готово
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Список заметок ───────────────────────────────────────────────────────────

type Screen = 'home' | 'recording' | 'processing' | 'review' | 'result'

interface SavedNote {
  text: string
  when: string
  targets: string[]
}

export default function CallsFreeNote() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // ?rec=1 — открыть сразу диктофон: вход из ленты звонков ведёт к записи,
  // а список заметок между тапом и микрофоном — лишний шаг.
  // ?screen=review|result — прямая ссылка на экран для показов и скриншотов,
  // тот же приём, что ?open=r9 в ленте звонков
  const deepScreen = params.get('screen')
  const [screen, setScreen] = useState<Screen>(() => {
    if (deepScreen === 'review' || deepScreen === 'result') return deepScreen
    return params.get('rec') === '1' ? 'recording' : 'home'
  })
  const [used, setUsed] = useState(3)
  const [hasIZ, setHasIZ] = useState(false)
  const [notes, setNotes] = useState<SavedNote[]>(PAST_NOTES)
  const [lastSaved, setLastSaved] = useState<{ item: Extracted; target: string }[]>([])

  const left = Math.max(0, LIMIT_TOTAL - used)
  const blocked = !hasIZ && left <= 0

  const handleSave = (kept: { item: Extracted; target: string }[]) => {
    setLastSaved(kept)
    setNotes(n => [{
      text: TRANSCRIPT,
      when: 'Только что',
      targets: Array.from(new Set(kept.map(k => k.target))),
    }, ...n])
    if (!hasIZ) setUsed(u => u + 1)
    setScreen('result')
  }

  // Уходя с записи, снимаем ?rec=1 — иначе возврат назад снова стартует диктофон
  const goHome = () => {
    setScreen('home')
    if (params.get('rec') === '1') navigate('/calls/note', { replace: true })
  }

  // Крестик закрывает диктофон: открыли из ленты — возвращаемся в ленту, а не в
  // список заметок. Переход явный, без history.back(): при заходе по прямой
  // ссылке предыдущей записью истории может оказаться этот же экран, и тогда
  // крестик выглядит нерабочим
  const closeRecorder = () => {
    if (params.get('rec') === '1') navigate(appHome(), { replace: true })
    else setScreen('home')
  }

  if (screen === 'recording') {
    return <RecorderScreen onCancel={closeRecorder} onDone={() => {
      setScreen('processing')
      setTimeout(() => setScreen('review'), 1600)
    }}/>
  }
  if (screen === 'processing') return <ProcessingScreen/>
  if (screen === 'review') return <ReviewScreen onCancel={goHome} onSave={handleSave}/>
  if (screen === 'result') {
    // По прямой ссылке сохранённого ещё нет — показываем разбор целиком,
    // спорный пункт при этом уходит в «Только мне»
    const saved = lastSaved.length
      ? lastSaved
      : EXTRACTED.map(item => ({ item, target: item.target || SELF.id }))
    return <ResultScreen saved={saved} onDone={goHome} onOpenContact={() => navigate('/calls/dictaphone')}/>
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        <div className="px-4 pt-12 pb-4 bg-white shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate(appHome())} className="w-9 h-9 flex items-center justify-center shrink-0 -ml-2 active:opacity-60">
              <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
            </button>
            <div className="flex-1"/>
            {/* Переключатели для показа — не часть продукта */}
            <button onClick={() => setHasIZ(v => !v)}
              className="font-compact text-[11px] px-2 py-1 rounded-full active:opacity-60"
              style={{ background: hasIZ ? '#E6F1FC' : 'rgba(29,32,35,0.06)', color: hasIZ ? '#0070E5' : '#8D969F' }}>
              {hasIZ ? 'с ИЗ' : 'без ИЗ'}
            </button>
            <button onClick={() => setUsed(LIMIT_TOTAL)}
              className="font-compact text-[11px] px-2 py-1 rounded-full active:opacity-60"
              style={{ background: 'rgba(29,32,35,0.06)', color: '#8D969F' }}>
              лимит
            </button>
          </div>

          <h1 className="font-sans font-black text-[26px] leading-tight" style={{ color: '#1D2023' }}>Заметки</h1>
          <p className="font-compact text-[14px] mt-1 leading-snug" style={{ color: '#8D969F' }}>
            Скажите всё подряд — разложим по людям и сюжетам. Про кого заметка, знать заранее не нужно.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36">
          <Section label={notes.length ? 'Записанное' : 'Пока пусто'}>
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
              {notes.map((n, i) => (
                <div key={i} className="px-4 py-3" style={{ borderTop: i > 0 ? '1px solid #F2F2F7' : 'none' }}>
                  <p className="font-compact text-sm leading-snug" style={{ color: '#1D2023' }}>
                    {n.text.length > 96 ? `${n.text.slice(0, 96)}…` : n.text}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="font-compact text-[12px] mr-0.5" style={{ color: '#8D969F' }}>{n.when}</span>
                    {n.targets.map(t => {
                      const p = byId(t)
                      if (!p) return null
                      return (
                        <span key={t} className="flex items-center gap-1 pl-0.5 pr-1.5 py-[2px] rounded-full" style={{ background: '#F2F2F7' }}>
                          <Avatar person={p} size={15}/>
                          <span className="font-compact text-[11px] font-semibold" style={{ color: '#1D2023' }}>{p.name}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <p className="font-compact text-[12px] text-center px-6 mt-5" style={{ color: '#8D969F' }}>
            Заметка живёт целиком и после раскладки: пункты у людей ссылаются на неё, а не заменяют.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-7 pt-3"
          style={{ background: 'linear-gradient(to bottom, rgba(242,243,247,0) 0%, #F2F3F7 38%)' }}>
          {!hasIZ && (
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="font-compact text-[12px]" style={{ color: left <= 2 ? '#E30611' : '#8D969F' }}>
                {left > 0 ? `Осталось ${left} ${notesWord(left)} в этом месяце` : 'Заметки на этот месяц закончились'}
              </span>
              <button onClick={() => navigate('/calls/dictaphone')} className="font-compact text-[12px] font-semibold active:opacity-60" style={{ color: '#0070E5' }}>
                Без лимита
              </button>
            </div>
          )}
          <button onClick={() => { if (!blocked) setScreen('recording') }}
            className="w-full rounded-2xl py-3.5 font-sans font-bold text-[16px] text-white active:opacity-85 transition-opacity flex items-center justify-center gap-2"
            style={{ background: blocked ? '#C7C7CC' : '#1D2023' }}>
            <Mic size={17} strokeWidth={2.4}/>
            Записать заметку
          </button>
        </div>
      </div>
    </div>
  )
}
