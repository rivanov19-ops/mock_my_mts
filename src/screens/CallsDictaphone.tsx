import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X, Mic, Square, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { appHome } from '../core/appHome'

// ─── Голосовая заметка · этап 1 «Моего Контекста» ─────────────────────────────
// Отдельная ветка мока, основной экран /calls/tobe не трогает.
//
// Что показываем:
//   1. Запись только с заданной привязкой — вход с карточки контакта, поэтому
//      «про кого заметка» известно до записи. Автопривязка по содержанию —
//      этап 2, здесь её нет намеренно.
//   2. Явные старт/стоп, видимый индикатор, лимит 3 минуты. Ambient-режима нет.
//   3. Извлечение с цитатой: непроверяемый факт неотличим от галлюцинации.
//   4. Склейку с контекстом из звонков — ради неё всё и делается.
//   5. Лимит 10 заметок в месяц без подписки ИЗ и апсейл на исчерпании.

// ─── Данные ───────────────────────────────────────────────────────────────────

const CONTACT = {
  name: 'Сергей',
  nameGen: 'Сергея',      // «заметка про кого» — падеж хранится рядом с именем
  initials: 'СЕ',
  color: '#FF9500',
  role: 'прораб',
  storylines: ['Ремонт', 'Дача'],
  history: '7-й разговор с июня',
}

type Source = 'call' | 'note'

interface OpenItem { text: string; days: number; source: Source; detail?: string }
interface FactItem { text: string; when: string; source: Source }

const OPEN_ITEMS: OpenItem[] = [
  { text: 'Смета на кухню — обещал до пятницы', days: 9, source: 'call' },
  { text: 'Замер на даче', days: 3, source: 'call' },
]

const FACTS: FactItem[] = [
  { text: 'Пересчитал материалы после подорожания — итог вырос примерно на 18%', when: 'Сегодня, 20:10', source: 'call' },
  { text: 'По плитке два варианта, ищем дешевле', when: 'Сегодня, 20:10', source: 'call' },
  { text: 'Работает через ИП, оплата по факту этапа', when: '14 июля', source: 'call' },
]

// Что пользователь надиктовал. Держим дословно — на этом тексте проверяется
// извлечение, и пользователь помнит, что именно сказал.
const NOTE_TRANSCRIPT =
  'Заехал на объект после работы. Сергей показал плитку, которую нашёл дешевле — на восемь тысяч выходит выгоднее, но её везут три недели. Договорились, что решаем в пятницу вместе со сметой. И он сказал, что бригада освободится только с двадцать пятого, раньше начать не получится.'

type ExtractKind = 'fact' | 'task' | 'story'

interface Extracted {
  kind: ExtractKind
  text: string
  quote: string
}

const EXTRACTED: Extracted[] = [
  {
    kind: 'fact',
    text: 'Нашлась плитка дешевле на 8 000 ₽, но срок поставки — 3 недели',
    quote: 'на восемь тысяч выходит выгоднее, но её везут три недели',
  },
  {
    kind: 'task',
    text: 'Решить по плитке в пятницу — вместе со сметой',
    quote: 'решаем в пятницу вместе со сметой',
  },
  {
    kind: 'story',
    text: 'Ремонт: старт работ сдвигается на 25-е',
    quote: 'бригада освободится только с двадцать пятого',
  },
]

const KIND_META: Record<ExtractKind, { label: string; color: string; bg: string }> = {
  fact: { label: 'Факт о человеке', color: '#0070E5', bg: '#E6F1FC' },
  task: { label: 'Задача', color: '#E30611', bg: '#FDECEC' },
  story: { label: 'Сюжет «Ремонт»', color: '#B45309', bg: '#FEF3C7' },
}

const LIMIT_TOTAL = 10
const MAX_SECONDS = 180

const daysWord = (d: number) => {
  const n = d % 100
  if (n >= 11 && n <= 14) return 'дней'
  switch (d % 10) {
    case 1: return 'день'
    case 2: case 3: case 4: return 'дня'
    default: return 'дней'
  }
}

const notesWord = (n: number) => {
  const k = n % 100
  if (k >= 11 && k <= 14) return 'заметок'
  switch (n % 10) {
    case 1: return 'заметка'
    case 2: case 3: case 4: return 'заметки'
    default: return 'заметок'
  }
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// ─── Мелкие элементы ──────────────────────────────────────────────────────────

// Метка источника. Ради неё вся конструкция: в одном списке видно, что пришло
// из разговора, а что пользователь добавил сам.
function SourceMark({ source }: { source: Source }) {
  if (source === 'note') {
    return (
      <span className="inline-flex items-center gap-1 shrink-0 px-1.5 py-[2px] rounded-full align-middle" style={{ background: '#EDE9FE' }}>
        <Mic size={9} strokeWidth={2.6} style={{ color: '#6D28D9' }}/>
        <span className="font-compact text-[10px] font-bold" style={{ color: '#6D28D9' }}>заметка</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 shrink-0 px-1.5 py-[2px] rounded-full align-middle" style={{ background: '#F2F2F7' }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#8D969F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
      <span className="font-compact text-[10px] font-bold" style={{ color: '#8D969F' }}>звонок</span>
    </span>
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

// ─── Экран записи ─────────────────────────────────────────────────────────────
// Привязка показана до старта: пользователь видит, про кого пишет, и это же
// снимает необходимость угадывать контакт по содержанию.

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

        {/* relative z-10: иначе центральный блок с -mt-10 перекрывает крестик */}
        <div className="px-4 pt-12 pb-3 flex items-center relative z-10">
          <button onClick={onCancel} className="w-9 h-9 flex items-center justify-center -ml-2 active:opacity-60">
            <X size={22} strokeWidth={2} style={{ color: 'white' }}/>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-10">

          {/* Привязка задана до записи — этап 1 не угадывает контакт */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-9" style={{ background: 'rgba(255,255,255,0.10)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(180deg, ${CONTACT.color}99, ${CONTACT.color})` }}>
              <span className="font-sans font-bold text-[9px] text-white">{CONTACT.initials}</span>
            </div>
            <span className="font-compact text-[13px]" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Заметка про {CONTACT.nameGen}
            </span>
          </div>

          {/* Индикатор записи виден всё время, пока идёт запись */}
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
              ? 'Расскажите, что произошло — как рассказали бы человеку'
              : 'Коротко о том, что случилось вне разговора'}
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

// ─── Расшифровка ──────────────────────────────────────────────────────────────

function ProcessingScreen() {
  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col items-center justify-center min-h-screen px-10">
        <motion.div className="flex items-center justify-center rounded-full mb-5"
          style={{ width: 56, height: 56, background: '#FDECEC' }}
          animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
          <Mic size={24} strokeWidth={2} style={{ color: '#E30611' }}/>
        </motion.div>
        <p className="font-sans font-bold text-[16px]" style={{ color: '#1D2023' }}>Расшифровываем</p>
        <p className="font-compact text-[13px] mt-1 text-center" style={{ color: '#8D969F' }}>
          Заметка про {CONTACT.nameGen} · 34 секунды
        </p>
      </div>
    </div>
  )
}

// ─── Верификация извлечённого ─────────────────────────────────────────────────
// Петля верификации переехала сюда из дневника: пользователь только что
// произнёс этот текст и помнит его дословно — это лучшая точка проверки
// качества извлечения, какая вообще есть в проекте.

function ReviewScreen({ onCancel, onSave }: { onCancel: () => void; onSave: (kept: Extracted[]) => void }) {
  const [dropped, setDropped] = useState<number[]>([])
  const [showQuote, setShowQuote] = useState<number | null>(null)

  const kept = EXTRACTED.filter((_, i) => !dropped.includes(i))

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
              <p className="font-compact text-xs" style={{ color: '#8D969F' }}>Уберите лишнее — остальное уйдёт в контекст</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">

          {/* Привязка. Она задана входом с карточки контакта, а не угадана */}
          <div className="flex items-center gap-2 mb-4">
            <span className="font-compact text-[12px]" style={{ color: '#8D969F' }}>Заметка про</span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(180deg, ${CONTACT.color}99, ${CONTACT.color})` }}>
                <span className="font-sans font-bold text-[8px] text-white">{CONTACT.initials}</span>
              </div>
              <span className="font-compact text-[12px] font-semibold" style={{ color: '#1D2023' }}>{CONTACT.name}</span>
            </span>
            <span className="font-compact text-[12px] px-2 py-1 rounded-full" style={{ background: '#F2F2F7', color: '#1D2023' }}>Ремонт</span>
          </div>

          <Section label="Расшифровка">
            <div className="bg-white rounded-2xl px-4 py-3.5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
              <p className="font-compact text-[14px] leading-relaxed" style={{ color: '#1D2023' }}>{NOTE_TRANSCRIPT}</p>
            </div>
          </Section>

          <Section label={`Извлекли · ${kept.length} из ${EXTRACTED.length}`}>
            {EXTRACTED.map((e, i) => {
              const meta = KIND_META[e.kind]
              const isDropped = dropped.includes(i)
              return (
                <div key={i} className="bg-white rounded-2xl px-4 py-3.5 mb-2 relative"
                  style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)', opacity: isDropped ? 0.42 : 1 }}>
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="font-compact text-[9px] font-bold uppercase tracking-wider px-1.5 py-[3px] rounded-full shrink-0"
                      style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
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

                  {/* Цитата обязательна: без неё факт неотличим от выдуманного */}
                  <button onClick={() => setShowQuote(q => q === i ? null : i)}
                    className="font-compact text-[12px] font-semibold mt-2 active:opacity-60" style={{ color: '#0070E5' }}>
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </Section>
        </div>

        <div className="px-4 pb-8 pt-3 bg-white border-t border-gray-100 shrink-0">
          <button onClick={() => onSave(kept)} disabled={!kept.length}
            className="w-full rounded-2xl py-3.5 font-sans font-bold text-[16px] text-white active:opacity-85 transition-opacity"
            style={{ background: kept.length ? '#1D2023' : '#C7C7CC' }}>
            Сохранить в контекст
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Экран исчерпания лимита ──────────────────────────────────────────────────
// Апсейл опирается на данные, которые пользователь уже накопил сам, —
// поэтому оффер честный и проверяемый, а не обещание.

function LimitScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen">

        <div className="px-4 pt-12 pb-3 flex items-center">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center -ml-2 active:opacity-60">
            <X size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 pb-16">
          <div className="flex items-center justify-center rounded-2xl mb-5 self-start"
            style={{ width: 46, height: 46, background: '#FDECEC' }}>
            <Mic size={21} strokeWidth={2} style={{ color: '#E30611' }}/>
          </div>

          <h1 className="font-sans font-black text-[24px] leading-tight mb-2.5" style={{ color: '#1D2023' }}>
            Заметки на этот месяц закончились
          </h1>
          <p className="font-compact text-[15px] leading-relaxed mb-6" style={{ color: '#5C6570' }}>
            Вы записали {LIMIT_TOTAL} из {LIMIT_TOTAL}. Новые появятся 1 сентября — всё, что уже сохранено, остаётся на месте.
          </p>

          <div className="rounded-2xl px-4 py-4 mb-5 bg-white" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
            <p className="font-compact text-[14px] leading-relaxed" style={{ color: '#1D2023' }}>
              Здесь только то, что вы записали сами. Половина ваших договорённостей произносится в звонках —
              с Интеллектуальной записью они будут попадать в контекст автоматически, без лимита.
            </p>
            <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #F2F2F7' }}>
              <span className="font-compact text-[12px]" style={{ color: '#8D969F' }}>За неделю мимо контекста прошло</span>
              <span className="font-compact text-[12px] font-bold" style={{ color: '#E30611' }}>14 разговоров</span>
            </div>
          </div>

          <button className="w-full rounded-2xl py-3.5 font-sans font-bold text-[16px] text-white active:opacity-85 transition-opacity mb-2.5"
            style={{ background: '#E30611' }}>
            Подключить за 249 ₽ в месяц
          </button>
          <p className="font-compact text-[12px] text-center" style={{ color: '#8D969F' }}>
            VoiceTech Pro — Секретарь, Запись, Шумоподавление и Ассистент. 30 дней бесплатно
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Главный экран: контекст контакта ─────────────────────────────────────────

type Screen = 'contact' | 'recording' | 'processing' | 'review' | 'limit'

export default function CallsDictaphone() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('contact')
  const [used, setUsed] = useState(3)
  const [hasIZ, setHasIZ] = useState(false)
  const [noteFacts, setNoteFacts] = useState<FactItem[]>([])
  const [noteTasks, setNoteTasks] = useState<OpenItem[]>([])
  const [merged, setMerged] = useState(false)   // блок «склеилось» — живёт до ухода с экрана
  const [toast, setToast] = useState(false)     // тост — отдельно, гасится сам и крестиком

  const left = Math.max(0, LIMIT_TOTAL - used)

  const startRecording = () => {
    if (!hasIZ && left <= 0) { setScreen('limit'); return }
    setScreen('recording')
  }

  const handleSave = (kept: Extracted[]) => {
    const facts: FactItem[] = kept
      .filter(e => e.kind !== 'task')
      .map(e => ({ text: e.text, when: 'Только что', source: 'note' as Source }))
    const tasks: OpenItem[] = kept
      .filter(e => e.kind === 'task')
      .map(e => ({ text: e.text, days: 0, source: 'note' as Source }))
    setNoteFacts(f => [...facts, ...f])
    setNoteTasks(t => [...tasks, ...t])
    if (!hasIZ) setUsed(u => u + 1)
    setMerged(kept.some(e => e.kind === 'fact'))
    setToast(true)
    setScreen('contact')
  }

  // Тост живёт 3.5 секунды и не тянет за собой блок склейки
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(false), 3500)
    return () => window.clearTimeout(t)
  }, [toast])

  if (screen === 'recording') {
    return <RecorderScreen onCancel={() => setScreen('contact')} onDone={() => {
      setScreen('processing')
      setTimeout(() => setScreen('review'), 1600)
    }}/>
  }
  if (screen === 'processing') return <ProcessingScreen/>
  if (screen === 'review') {
    return <ReviewScreen onCancel={() => setScreen('contact')} onSave={handleSave}/>
  }
  if (screen === 'limit') return <LimitScreen onBack={() => setScreen('contact')}/>

  const openItems = [...noteTasks, ...OPEN_ITEMS]
  const facts = [...noteFacts, ...FACTS]

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Header */}
        <div className="px-4 pt-12 pb-4 bg-white shrink-0">
          <div className="flex items-center gap-3 mb-4">
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
            {/* Переход в свободную заметку — вторая ветка показа */}
            <button onClick={() => navigate('/calls/note')}
              className="font-compact text-[11px] px-2 py-1 rounded-full active:opacity-60"
              style={{ background: 'rgba(29,32,35,0.06)', color: '#8D969F' }}>
              свободная
            </button>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(180deg, ${CONTACT.color}99, ${CONTACT.color})` }}>
              <span className="font-sans font-bold text-[17px] text-white">{CONTACT.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-sans font-black text-[22px] leading-tight" style={{ color: '#1D2023' }}>{CONTACT.name}</h1>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-1">
                <span className="font-compact text-[13px]" style={{ color: '#8D969F' }}>{CONTACT.role}</span>
                <span className="font-compact text-[13px]" style={{ color: '#C7C7CC' }}>·</span>
                {CONTACT.storylines.map(s => (
                  <span key={s} className="font-compact text-[12px] px-2 py-[2px] rounded-full"
                    style={{ background: '#F2F2F7', color: '#1D2023' }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">

          {/* Склейка — ради неё диктофон и живёт в контексте, а не отдельно */}
          <AnimatePresence>
            {merged && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-2xl px-4 py-3.5 mb-4"
                style={{ background: '#EDE9FE', border: '1px solid #C4B5FD' }}>
                <p className="font-compact text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#6D28D9' }}>
                  Склеилось с разговорами
                </p>
                <p className="font-compact text-[13px] leading-snug" style={{ color: '#1D2023' }}>
                  Пункт «Смета на кухню» висел с 5 августа без движения. Ваша заметка добавила к нему причину и срок —
                  в самом разговоре этого не было.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <Section label="Осталось без ответа">
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
              {openItems.map((o, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3" style={{ borderTop: i > 0 ? '1px solid #F2F2F7' : 'none' }}>
                  <span className="rounded-full shrink-0" style={{ width: 6, height: 6, background: '#E30611', marginTop: 7 }}/>
                  <div className="flex-1 min-w-0">
                    <p className="font-compact text-sm leading-snug" style={{ color: '#1D2023' }}>{o.text}</p>
                    <div className="mt-1.5"><SourceMark source={o.source}/></div>
                  </div>
                  <span className="font-compact text-[11px] font-semibold shrink-0 px-2 py-[2px] rounded-full"
                    style={{ background: o.days >= 7 ? '#FDECEC' : '#F2F2F7', color: o.days >= 7 ? '#E30611' : '#8D969F' }}>
                    {o.days === 0 ? 'сегодня' : `${o.days} ${daysWord(o.days)}`}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section label="Что известно">
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
              {facts.map((f, i) => (
                <div key={i} className="px-4 py-3" style={{ borderTop: i > 0 ? '1px solid #F2F2F7' : 'none' }}>
                  <p className="font-compact text-sm leading-snug" style={{ color: '#1D2023' }}>{f.text}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <SourceMark source={f.source}/>
                    <span className="font-compact text-[12px]" style={{ color: '#8D969F' }}>{f.when}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <p className="font-compact text-[12px] text-center px-6 mt-5" style={{ color: '#8D969F' }}>
            {CONTACT.history}. Всё, что здесь есть, можно открыть до источника или удалить.
          </p>
        </div>

        {/* Кнопка записи + счётчик лимита */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-7 pt-3"
          style={{ background: 'linear-gradient(to bottom, rgba(242,243,247,0) 0%, #F2F3F7 38%)' }}>
          {!hasIZ && (
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="font-compact text-[12px]" style={{ color: left <= 2 ? '#E30611' : '#8D969F' }}>
                {left > 0 ? `Осталось ${left} ${notesWord(left)} в этом месяце` : 'Заметки на этот месяц закончились'}
              </span>
              <button onClick={() => setScreen('limit')} className="font-compact text-[12px] font-semibold active:opacity-60" style={{ color: '#0070E5' }}>
                Без лимита
              </button>
            </div>
          )}
          <button onClick={startRecording}
            className="w-full rounded-2xl py-3.5 font-sans font-bold text-[16px] text-white active:opacity-85 transition-opacity flex items-center justify-center gap-2"
            style={{ background: left > 0 || hasIZ ? '#1D2023' : '#C7C7CC' }}>
            <Mic size={17} strokeWidth={2.4}/>
            Добавить голосом
          </button>
        </div>

        {/* Тост после сохранения */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}
              className="absolute left-4 right-4 flex items-center gap-2 rounded-2xl px-4 py-3"
              style={{ bottom: 132, background: '#1D2023', boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}>
              <Check size={16} strokeWidth={2.6} style={{ color: '#34C759' }}/>
              <span className="font-compact text-[13px] flex-1" style={{ color: 'white' }}>Заметка добавлена в контекст</span>
              <button onClick={() => setToast(false)} className="active:opacity-60">
                <X size={14} strokeWidth={2.2} style={{ color: 'rgba(255,255,255,0.5)' }}/>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
