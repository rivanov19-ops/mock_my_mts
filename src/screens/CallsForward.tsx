import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, X, Check, FileText, Search, CornerUpRight, MessageCircle, Phone } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { appHome } from '../core/appHome'

// ─── Пересылка из мессенджера · M1 интеграции «Моего Контекста» ───────────────
// Третий источник графа. Первый уровень доступа — самый узкий: мы не читаем
// переписку, пользователь сам пересылает боту то, что считает важным.
//
// Что показываем:
//   1. Выбор сообщений в обычном чате и пересылка боту «Мой Контекст» — никакой
//      новой механики для пользователя, привычный жест мессенджера.
//   2. Привязка берётся из отправителя исходного сообщения: у мессенджера она,
//      как у звонка, есть по номеру — угадывать не нужно.
//   3. Главная ценность мессенджера — развязки: смета, обещанная в звонке,
//      пришла в чате, и пункт можно закрыть. Закрываем только с согласия.
//   4. Письменное значение точнее устного: «примерно +18%» из звонка
//      уточняется до «412 500 ₽» из чата.
//   5. Вложение прикрепляется к пункту, а не тонет в ленте.
//   6. Переписку не храним: в графе извлечённое, цитата и ссылка на исходник.
//
// Мессенджер нарисован нейтрально — это не макет конкретного продукта.

// ─── Данные ───────────────────────────────────────────────────────────────────

const CONTACT = {
  name: 'Сергей',
  nameGen: 'Сергея',
  initials: 'СЕ',
  color: '#FF9500',
  role: 'прораб',
  storylines: ['Ремонт', 'Дача'],
}

const BOT = { name: 'Мой Контекст', sub: 'бот МТС' }

interface Msg {
  id: string
  out?: boolean
  text?: string
  file?: { name: string; size: string }
  time: string
}

const CHAT: Msg[] = [
  { id: 'm1', text: 'Добрый вечер! Досчитал смету по кухне', time: '19:40' },
  { id: 'm2', file: { name: 'Смета_кухня.pdf', size: '214 КБ' }, time: '19:41' },
  {
    id: 'm3',
    text: 'Итого 412 500 с материалами. Плитку берём ту, что дешевле, но её привезут только 3 сентября. Чтобы заказать, нужна предоплата 30% до среды',
    time: '19:42',
  },
  { id: 'm4', out: true, text: 'Ок, посмотрю вечером', time: '19:50' },
  { id: 'm5', text: '👍', time: '19:51' },
]

// Что бот извлёк из пересланного. kind = что это для графа.
type Kind = 'close' | 'task' | 'refine' | 'story'

interface Extracted {
  kind: Kind
  text: string
  quote: string
  note?: string      // связь с тем, что уже было в графе
}

const EXTRACTED: Extracted[] = [
  {
    kind: 'close',
    text: 'Смета на кухню — обещал до пятницы',
    quote: 'Смета_кухня.pdf',
    note: 'Висел 9 дней, из звонка 5 августа. Смета приложится к пункту',
  },
  {
    kind: 'task',
    text: 'Внести предоплату 30% — до среды',
    quote: 'нужна предоплата 30% до среды',
  },
  {
    kind: 'refine',
    text: 'Смета с материалами — 412 500 ₽',
    quote: 'Итого 412 500 с материалами',
    note: 'Уточняет «итог вырос примерно на 18%» из звонка',
  },
  {
    kind: 'story',
    text: 'Ремонт: дешёвая плитка приедет 3 сентября',
    quote: 'её привезут только 3 сентября',
  },
]

const KIND_META: Record<Kind, { label: string; color: string; bg: string }> = {
  close:  { label: 'Закрывает пункт', color: '#15803D', bg: '#DCFCE7' },
  task:   { label: 'Задача', color: '#E30611', bg: '#FDECEC' },
  refine: { label: 'Уточнение', color: '#0070E5', bg: '#E6F1FC' },
  story:  { label: 'Сюжет «Ремонт»', color: '#B45309', bg: '#FEF3C7' },
}

// ─── Цвета нейтрального мессенджера ───────────────────────────────────────────

const M = {
  bg: '#E9EEF2',
  head: '#FFFFFF',
  inBubble: '#FFFFFF',
  outBubble: '#DCF3E0',
  accent: '#2A7BE4',
  text: '#1D2023',
  muted: '#8D969F',
}

// ─── Мелкие элементы ──────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(180deg, ${color}99, ${color})` }}>
      <span className="font-sans font-bold text-white" style={{ fontSize: size * 0.33 }}>{initials}</span>
    </div>
  )
}

function BotAvatar({ size = 36 }: { size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: size, height: size, background: '#E30611' }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="10" cy="18" r="2.5"/>
        <path d="M8.2 7.2 15.6 7.6M16.6 10.2 11.6 16M7 8.4 9.2 15.6"/>
      </svg>
    </div>
  )
}

function ChatHeader({ title, sub, avatar, onBack, right }: {
  title: string; sub: string; avatar: React.ReactNode; onBack: () => void; right?: React.ReactNode
}) {
  return (
    <div className="px-3 pt-12 pb-2.5 flex items-center gap-2.5 shrink-0 relative z-10"
      style={{ background: M.head, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <button onClick={onBack} className="w-8 h-8 flex items-center justify-center shrink-0 active:opacity-60">
        <ArrowLeft size={22} strokeWidth={2} style={{ color: M.accent }}/>
      </button>
      {avatar}
      <div className="flex-1 min-w-0">
        <p className="font-sans font-bold text-[16px] leading-tight truncate" style={{ color: M.text }}>{title}</p>
        <p className="font-compact text-[12px]" style={{ color: M.muted }}>{sub}</p>
      </div>
      {right}
    </div>
  )
}

function FileChip({ name, size, dark }: { name: string; size: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="rounded-xl flex items-center justify-center shrink-0"
        style={{ width: 38, height: 38, background: dark ? 'rgba(255,255,255,0.7)' : '#E6F1FC' }}>
        <FileText size={18} strokeWidth={2} style={{ color: M.accent }}/>
      </div>
      <div className="min-w-0">
        <p className="font-compact text-[14px] font-semibold truncate" style={{ color: M.text }}>{name}</p>
        <p className="font-compact text-[12px]" style={{ color: M.muted }}>{size}</p>
      </div>
    </div>
  )
}

// Метка источника в карточке контакта Мой МТС. Здесь появляется третий вид — «чат».
type Source = 'call' | 'note' | 'chat'

function SourceMark({ source }: { source: Source }) {
  const meta = {
    call: { label: 'звонок', color: '#8D969F', bg: '#F2F2F7', icon: <Phone size={9} strokeWidth={2.6}/> },
    note: { label: 'заметка', color: '#6D28D9', bg: '#EDE9FE', icon: null },
    chat: { label: 'чат', color: '#0E7490', bg: '#CFFAFE', icon: <MessageCircle size={9} strokeWidth={2.6}/> },
  }[source]
  return (
    <span className="inline-flex items-center gap-1 shrink-0 px-1.5 py-[2px] rounded-full align-middle"
      style={{ background: meta.bg, color: meta.color }}>
      {meta.icon}
      <span className="font-compact text-[10px] font-bold">{meta.label}</span>
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

// ─── 1. Чат с Сергеем ─────────────────────────────────────────────────────────
// Обычная переписка. Тап по сообщению Сергея включает выбор — дальше
// привычная пересылка. Своё и мусорное («👍») выбрать можно, но смысла нет.

function ChatScreen({ selected, setSelected, onForward, onBack }: {
  selected: string[]; setSelected: (f: (s: string[]) => string[]) => void; onForward: () => void; onBack: () => void
}) {
  const selecting = selected.length > 0
  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  return (
    <div className="min-h-screen flex justify-center" style={{ background: M.bg }}>
      <div className="w-full max-w-app flex flex-col min-h-screen relative">
        {selecting ? (
          <div className="px-4 pt-12 pb-3 flex items-center gap-3 shrink-0" style={{ background: M.head, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <button onClick={() => setSelected(() => [])} className="w-8 h-8 flex items-center justify-center -ml-1 active:opacity-60">
              <X size={22} strokeWidth={2} style={{ color: M.accent }}/>
            </button>
            <p className="font-sans font-bold text-[16px] flex-1" style={{ color: M.text }}>Выбрано: {selected.length}</p>
          </div>
        ) : (
          <ChatHeader title={`${CONTACT.name} прораб`} sub="был(а) недавно" onBack={onBack}
            avatar={<Avatar initials={CONTACT.initials} color={CONTACT.color}/>}/>
        )}

        <div className="flex-1 overflow-y-auto px-3 pt-4 pb-32">
          <div className="flex justify-center mb-3">
            <span className="font-compact text-[12px] px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.08)', color: '#5C6570' }}>Сегодня</span>
          </div>

          {CHAT.map(m => {
            const isSel = selected.includes(m.id)
            return (
              <div key={m.id} onClick={() => toggle(m.id)}
                className={`flex items-end gap-2 mb-1.5 cursor-pointer rounded-xl -mx-1 px-1 py-0.5 ${m.out ? 'justify-end' : ''}`}
                style={{ background: isSel ? 'rgba(42,123,228,0.12)' : 'transparent' }}>
                {selecting && !m.out && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mb-2"
                    style={{ background: isSel ? M.accent : 'white', border: isSel ? 'none' : '1.5px solid #C7C7CC' }}>
                    {isSel && <Check size={12} strokeWidth={3} style={{ color: 'white' }}/>}
                  </div>
                )}
                <div className="rounded-2xl px-3 py-2 max-w-[80%]"
                  style={{
                    background: m.out ? M.outBubble : M.inBubble,
                    borderBottomLeftRadius: m.out ? 16 : 4,
                    borderBottomRightRadius: m.out ? 4 : 16,
                    boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
                  }}>
                  {m.file ? <FileChip {...m.file}/> : (
                    <p className="font-compact text-[15px] leading-snug" style={{ color: M.text }}>{m.text}</p>
                  )}
                  <p className="font-compact text-[11px] text-right mt-0.5" style={{ color: M.muted }}>{m.time}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Подсказка для показа, пока ничего не выбрано */}
        {!selecting && (
          <div className="absolute left-0 right-0 bottom-0 px-4 pb-8 pt-3" style={{ background: M.head, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: '#F2F3F7' }}>
              <span className="font-compact text-[14px] flex-1" style={{ color: M.muted }}>Сообщение</span>
            </div>
            <motion.p className="font-compact text-[12px] text-center mt-2.5" style={{ color: M.accent }}
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
              Для показа: выберите сообщения Сергея — смету и текст
            </motion.p>
          </div>
        )}

        {selecting && (
          <div className="absolute left-0 right-0 bottom-0 px-4 pb-8 pt-3 flex" style={{ background: M.head, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <button onClick={onForward} className="flex-1 flex items-center justify-center gap-2 py-2 active:opacity-60">
              <CornerUpRight size={20} strokeWidth={2.2} style={{ color: M.accent }}/>
              <span className="font-compact text-[15px] font-semibold" style={{ color: M.accent }}>Переслать</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 2. Кому переслать ────────────────────────────────────────────────────────
// Бот закреплён первым — единственное, что добавляем в привычный жест.

function PickerSheet({ count, onPick, onClose }: { count: number; onPick: () => void; onClose: () => void }) {
  const others = [
    { initials: 'ЖЕ', color: '#FF2D55', name: 'Жена', sub: 'в сети' },
    { initials: 'МА', color: '#34C759', name: 'Мама', sub: 'была вчера' },
    { initials: 'РЧ', color: '#5856D6', name: 'Ремонт кухни', sub: 'группа · 4 участника' },
  ]
  return (
    <motion.div className="fixed inset-0 z-40 flex justify-center items-end" style={{ background: 'rgba(0,0,0,0.35)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="w-full max-w-app bg-white rounded-t-3xl pb-8" onClick={e => e.stopPropagation()}
        initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
        <div className="flex justify-center pt-2.5 pb-1"><div className="w-10 h-1 rounded-full bg-gray-300"/></div>
        <p className="font-sans font-bold text-[17px] text-center py-2" style={{ color: M.text }}>
          Переслать {count === 1 ? 'сообщение' : `${count} сообщения`}
        </p>
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#F2F3F7' }}>
          <Search size={16} style={{ color: M.muted }}/>
          <span className="font-compact text-[14px]" style={{ color: M.muted }}>Поиск</span>
        </div>

        <button onClick={onPick} className="w-full flex items-center gap-3 px-4 py-2.5 active:bg-gray-50 text-left">
          <BotAvatar size={42}/>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-bold text-[15px]" style={{ color: M.text }}>{BOT.name}</p>
            <p className="font-compact text-[13px]" style={{ color: M.muted }}>{BOT.sub} · разложит по контексту</p>
          </div>
          <span className="font-compact text-[10px] font-bold uppercase tracking-wider px-1.5 py-[3px] rounded-full"
            style={{ background: '#FDECEC', color: '#E30611' }}>закреплён</span>
        </button>
        <div className="mx-4 my-1" style={{ borderTop: '1px solid #F2F2F7' }}/>
        {others.map(o => (
          <div key={o.name} className="flex items-center gap-3 px-4 py-2.5 opacity-60">
            <Avatar initials={o.initials} color={o.color} size={42}/>
            <div>
              <p className="font-sans font-semibold text-[15px]" style={{ color: M.text }}>{o.name}</p>
              <p className="font-compact text-[13px]" style={{ color: M.muted }}>{o.sub}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ─── 3. Чат с ботом ───────────────────────────────────────────────────────────
// Бот отвечает карточкой: от кого, что извлёк, что это меняет в графе.
// Всё правится прямо в сообщении — открывать приложение не обязательно.

type BotPhase = 'typing' | 'card' | 'saved' | 'dismissed'

function BotScreen({ forwarded, phase, setPhase, onOpenCard, onBack }: {
  forwarded: Msg[]; phase: BotPhase; setPhase: (p: BotPhase) => void; onOpenCard: () => void; onBack: () => void
}) {
  const [dropped, setDropped] = useState<number[]>([])
  const [quote, setQuote] = useState<number | null>(null)

  useEffect(() => {
    if (phase !== 'typing') return
    const t = window.setTimeout(() => setPhase('card'), 1600)
    return () => window.clearTimeout(t)
  }, [phase, setPhase])

  const kept = EXTRACTED.filter((_, i) => !dropped.includes(i))
  const locked = phase === 'saved' || phase === 'dismissed'

  return (
    <div className="min-h-screen flex justify-center" style={{ background: M.bg }}>
      <div className="w-full max-w-app flex flex-col min-h-screen">
        <ChatHeader title={BOT.name} sub={BOT.sub} avatar={<BotAvatar/>} onBack={onBack}/>

        <div className="flex-1 overflow-y-auto px-3 pt-4 pb-10">

          {/* Приветствие бота — висит в истории с момента подключения */}
          <BotBubble time="12 авг">
            <p className="font-compact text-[14px] leading-snug" style={{ color: M.text }}>
              Пересылайте сюда сообщения и файлы — разложу их по вашему контексту в Мой МТС: к людям, задачам и сюжетам.
            </p>
            <p className="font-compact text-[13px] leading-snug mt-1.5" style={{ color: M.muted }}>
              Переписку не храню. Сохраняю только то, что извлеку, цитату и ссылку на исходное сообщение.
            </p>
          </BotBubble>

          <div className="flex justify-center my-3">
            <span className="font-compact text-[12px] px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.08)', color: '#5C6570' }}>Сегодня</span>
          </div>

          {/* Пересланное */}
          {forwarded.map(m => (
            <div key={m.id} className="flex justify-end mb-1.5">
              <div className="rounded-2xl px-3 py-2 max-w-[80%]"
                style={{ background: M.outBubble, borderBottomRightRadius: 4, boxShadow: '0 1px 1px rgba(0,0,0,0.06)' }}>
                <p className="font-compact text-[12px] font-semibold mb-1" style={{ color: M.accent }}>
                  Переслано от {CONTACT.name} прораб
                </p>
                {m.file ? <FileChip {...m.file} dark/> : (
                  <p className="font-compact text-[15px] leading-snug" style={{ color: M.text }}>{m.text}</p>
                )}
                <p className="font-compact text-[11px] text-right mt-0.5" style={{ color: M.muted }}>20:05 ✓✓</p>
              </div>
            </div>
          ))}

          {phase === 'typing' && (
            <div className="flex items-end gap-2 mt-2">
              <BotAvatar size={28}/>
              <div className="rounded-2xl px-4 py-3 flex gap-1" style={{ background: M.inBubble, borderBottomLeftRadius: 4 }}>
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="rounded-full" style={{ width: 7, height: 7, background: '#C7C7CC' }}
                    animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}/>
                ))}
              </div>
            </div>
          )}

          {phase !== 'typing' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <BotBubble time="20:05" wide>
                {/* Привязка — из отправителя пересланного, как номер у звонка */}
                <div className="flex items-center gap-2 mb-3">
                  <Avatar initials={CONTACT.initials} color={CONTACT.color} size={22}/>
                  <p className="font-compact text-[13px]" style={{ color: M.text }}>
                    <b>{CONTACT.name}</b> <span style={{ color: M.muted }}>· {CONTACT.role} · Ремонт</span>
                  </p>
                </div>

                {EXTRACTED.map((e, i) => {
                  const meta = KIND_META[e.kind]
                  const isDropped = dropped.includes(i)
                  return (
                    <div key={i} className="rounded-xl px-3 py-2.5 mb-1.5"
                      style={{ background: '#F7F8FA', opacity: isDropped ? 0.42 : 1 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-compact text-[9px] font-bold uppercase tracking-wider px-1.5 py-[3px] rounded-full"
                          style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                        <div className="flex-1"/>
                        {!locked && (isDropped ? (
                          <button onClick={() => setDropped(d => d.filter(x => x !== i))}
                            className="font-compact text-[12px] font-semibold active:opacity-60" style={{ color: M.accent }}>Вернуть</button>
                        ) : (
                          <button onClick={() => setDropped(d => [...d, i])} className="active:opacity-60 w-5 h-5 flex items-center justify-center">
                            <X size={13} strokeWidth={2.2} style={{ color: M.text, opacity: 0.3 }}/>
                          </button>
                        ))}
                      </div>
                      <p className="font-compact text-[14px] leading-snug"
                        style={{ color: M.text, textDecoration: isDropped || (e.kind === 'close' && phase === 'saved') ? 'line-through' : 'none' }}>
                        {e.text}
                      </p>
                      {e.note && (
                        <p className="font-compact text-[12px] leading-snug mt-1" style={{ color: meta.color }}>{e.note}</p>
                      )}
                      <button onClick={() => setQuote(q => q === i ? null : i)}
                        className="font-compact text-[12px] font-semibold mt-1 active:opacity-60" style={{ color: M.accent }}>
                        {quote === i ? 'Скрыть' : 'Откуда это'}
                      </button>
                      <AnimatePresence>
                        {quote === i && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="font-compact text-[12px] leading-snug mt-1 pl-2.5 overflow-hidden"
                            style={{ color: M.muted, borderLeft: '2px solid #E5E5EA' }}>
                            {e.kind === 'close' ? `Файл «${e.quote}» от ${CONTACT.nameGen}` : `«${e.quote}»`}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}

                {/* Инлайн-кнопки бота */}
                {phase === 'card' && (
                  <div className="flex gap-1.5 mt-2.5">
                    <button onClick={() => setPhase('saved')} disabled={!kept.length}
                      className="flex-1 rounded-xl py-2.5 font-sans font-bold text-[14px] text-white active:opacity-85"
                      style={{ background: kept.length ? '#1D2023' : '#C7C7CC' }}>
                      Сохранить {kept.length < EXTRACTED.length ? `${kept.length} из ${EXTRACTED.length}` : 'всё'}
                    </button>
                    <button onClick={() => setPhase('dismissed')}
                      className="rounded-xl px-3.5 py-2.5 font-compact font-semibold text-[14px] active:opacity-60"
                      style={{ background: '#F2F3F7', color: M.text }}>
                      Не надо
                    </button>
                  </div>
                )}
              </BotBubble>
            </motion.div>
          )}

          {phase === 'saved' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <BotBubble time="20:06">
                <p className="font-compact text-[14px] leading-snug" style={{ color: M.text }}>
                  Готово. У {CONTACT.nameGen}{' '}
                  {[
                    kept.some(e => e.kind === 'close') && 'закрыт пункт про смету, файл приложен',
                    kept.some(e => e.kind === 'task') && 'новая задача до среды',
                    kept.some(e => e.kind === 'refine' || e.kind === 'story') && 'уточнены факты по ремонту',
                  ].filter(Boolean).join(', ')}.
                </p>
                <p className="font-compact text-[13px] leading-snug mt-1.5" style={{ color: M.muted }}>
                  Напомню про предоплату во вторник вечером.
                </p>
                <button onClick={onOpenCard}
                  className="w-full rounded-xl py-2.5 mt-2.5 font-compact font-semibold text-[14px] active:opacity-60"
                  style={{ background: '#F2F3F7', color: M.accent }}>
                  Открыть контекст {CONTACT.nameGen}
                </button>
              </BotBubble>
            </motion.div>
          )}

          {phase === 'dismissed' && (
            <BotBubble time="20:06">
              <p className="font-compact text-[14px] leading-snug" style={{ color: M.text }}>
                Не сохраняю. Ничего из этих сообщений у меня не осталось.
              </p>
            </BotBubble>
          )}
        </div>
      </div>
    </div>
  )
}

function BotBubble({ children, time, wide }: { children: React.ReactNode; time: string; wide?: boolean }) {
  return (
    <div className="flex items-end gap-2 mb-2">
      <BotAvatar size={28}/>
      <div className={`rounded-2xl px-3 py-2.5 ${wide ? 'flex-1' : 'max-w-[82%]'}`}
        style={{ background: M.inBubble, borderBottomLeftRadius: 4, boxShadow: '0 1px 1px rgba(0,0,0,0.06)' }}>
        {children}
        <p className="font-compact text-[11px] text-right mt-1" style={{ color: M.muted }}>{time}</p>
      </div>
    </div>
  )
}

// ─── 4. Карточка Сергея в Мой МТС ─────────────────────────────────────────────
// Та же карточка, что у диктофона, — появился третий источник «чат».
// Показываем результат склейки: пункт из звонка закрыт сообщением из чата.

function ContactCard({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen">
        <div className="px-4 pt-12 pb-4 bg-white shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0 -ml-2 active:opacity-60">
              <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
            </button>
            <div className="flex-1"/>
            <button onClick={() => navigate('/calls/dictaphone')}
              className="font-compact text-[11px] px-2 py-1 rounded-full active:opacity-60"
              style={{ background: 'rgba(29,32,35,0.06)', color: '#8D969F' }}>
              диктофон
            </button>
          </div>
          <div className="flex items-center gap-3.5">
            <Avatar initials={CONTACT.initials} color={CONTACT.color} size={52}/>
            <div className="flex-1 min-w-0">
              <h1 className="font-sans font-black text-[22px] leading-tight" style={{ color: '#1D2023' }}>{CONTACT.name}</h1>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-1">
                <span className="font-compact text-[13px]" style={{ color: '#8D969F' }}>{CONTACT.role}</span>
                <span className="font-compact text-[13px]" style={{ color: '#C7C7CC' }}>·</span>
                {CONTACT.storylines.map(s => (
                  <span key={s} className="font-compact text-[12px] px-2 py-[2px] rounded-full" style={{ background: '#F2F2F7', color: '#1D2023' }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-10">
          {/* Склейка источников — то, чего нет ни в мессенджере, ни в звонках по отдельности */}
          <div className="rounded-2xl px-4 py-3.5 mb-4" style={{ background: '#CFFAFE', border: '1px solid #67E8F9' }}>
            <p className="font-compact text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#0E7490' }}>
              Звонок + чат
            </p>
            <p className="font-compact text-[13px] leading-snug" style={{ color: '#1D2023' }}>
              5 августа по телефону Сергей обещал смету до пятницы. Сегодня она пришла в переписке — пункт закрыт,
              файл лежит рядом с ним.
            </p>
          </div>

          <Section label="Осталось без ответа">
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
              {[
                { text: 'Внести предоплату 30% — до среды', badge: 'до среды', src: 'chat' as Source, red: true },
                { text: 'Замер на даче', badge: '3 дня', src: 'call' as Source, red: false },
              ].map((o, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3" style={{ borderTop: i > 0 ? '1px solid #F2F2F7' : 'none' }}>
                  <span className="rounded-full shrink-0" style={{ width: 6, height: 6, background: '#E30611', marginTop: 7 }}/>
                  <div className="flex-1 min-w-0">
                    <p className="font-compact text-sm leading-snug" style={{ color: '#1D2023' }}>{o.text}</p>
                    <div className="mt-1.5"><SourceMark source={o.src}/></div>
                  </div>
                  <span className="font-compact text-[11px] font-semibold shrink-0 px-2 py-[2px] rounded-full"
                    style={{ background: o.red ? '#FDECEC' : '#F2F2F7', color: o.red ? '#E30611' : '#8D969F' }}>{o.badge}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section label="Закрыто">
            <div className="bg-white rounded-2xl px-4 py-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
              <div className="flex items-start gap-3">
                <Check size={15} strokeWidth={2.8} className="shrink-0 mt-0.5" style={{ color: '#15803D' }}/>
                <div className="flex-1 min-w-0">
                  <p className="font-compact text-sm leading-snug line-through" style={{ color: '#8D969F' }}>Смета на кухню — обещал до пятницы</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <SourceMark source="call"/>
                    <span className="font-compact text-[11px]" style={{ color: '#C7C7CC' }}>→</span>
                    <SourceMark source="chat"/>
                    <span className="font-compact text-[12px]" style={{ color: '#8D969F' }}>сегодня</span>
                  </div>
                  <div className="mt-2.5 rounded-xl px-2.5 py-2" style={{ background: '#F7F8FA' }}>
                    <FileChip name="Смета_кухня.pdf" size="214 КБ"/>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section label="Что известно">
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
              <div className="px-4 py-3">
                <p className="font-compact text-sm leading-snug" style={{ color: '#1D2023' }}>Смета с материалами — 412 500 ₽</p>
                <p className="font-compact text-[12px] leading-snug mt-1 line-through" style={{ color: '#C7C7CC' }}>
                  Итог вырос примерно на 18%
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <SourceMark source="chat"/>
                  <span className="font-compact text-[12px]" style={{ color: '#8D969F' }}>уточнило звонок от 14 авг</span>
                </div>
              </div>
              <div className="px-4 py-3" style={{ borderTop: '1px solid #F2F2F7' }}>
                <p className="font-compact text-sm leading-snug" style={{ color: '#1D2023' }}>Дешёвая плитка приедет 3 сентября</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <SourceMark source="chat"/>
                  <span className="font-compact text-[12px]" style={{ color: '#8D969F' }}>Сегодня, 19:42</span>
                </div>
              </div>
              <div className="px-4 py-3" style={{ borderTop: '1px solid #F2F2F7' }}>
                <p className="font-compact text-sm leading-snug" style={{ color: '#1D2023' }}>Работает через ИП, оплата по факту этапа</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <SourceMark source="call"/>
                  <span className="font-compact text-[12px]" style={{ color: '#8D969F' }}>14 июля</span>
                </div>
              </div>
            </div>
          </Section>

          <p className="font-compact text-[12px] text-center px-6 mt-5" style={{ color: '#8D969F' }}>
            Из переписки хранится только извлечённое и ссылка на сообщение. Удалить можно любой пункт или всё по чату.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── 0. Подключение бота в Мой МТС ────────────────────────────────────────────
// Вход из вкладки КОНТЕКСТ. Здесь пользователь узнаёт о боте и соглашается на
// условия — сама пересылка дальше происходит в мессенджере.

function ConnectScreen({ onOpen, onBack }: { onOpen: () => void; onBack: () => void }) {
  const steps = [
    { title: 'Перешлите сообщение или файл боту', text: 'Из любого чата — тем же жестом, что и человеку' },
    { title: 'Мы разложим его по контексту', text: 'К человеку, задачам и сюжетам. Если там висел пункт из звонка — предложим его закрыть' },
    { title: 'Переписку не храним', text: 'Только извлечённое, цитату и ссылку на сообщение. Сам бот чаты не читает' },
  ]
  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen">
        <div className="px-4 pt-12 pb-3 flex items-center">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center -ml-2 active:opacity-60">
            <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }}/>
          </button>
        </div>

        <div className="flex-1 px-6 pt-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="rounded-2xl flex items-center justify-center" style={{ width: 46, height: 46, background: '#CFFAFE' }}>
              <MessageCircle size={21} strokeWidth={2} style={{ color: '#0E7490' }}/>
            </div>
            <span className="font-compact text-[18px]" style={{ color: '#C7C7CC' }}>→</span>
            <BotAvatar size={46}/>
          </div>

          <h1 className="font-sans font-black text-[24px] leading-tight mb-2.5" style={{ color: '#1D2023' }}>
            Пересылайте из мессенджера
          </h1>
          <p className="font-compact text-[15px] leading-relaxed mb-6" style={{ color: '#5C6570' }}>
            Смету, адрес, «договорились на среду» — всё, что прислали в переписке, окажется рядом с тем, что сказали по телефону.
          </p>

          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
            {steps.map((s, i) => (
              <div key={i} className="px-4 py-3.5 flex gap-3" style={{ borderTop: i > 0 ? '1px solid #F2F2F7' : 'none' }}>
                <span className="font-sans font-bold text-[13px] shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: '#F2F3F7', color: '#1D2023' }}>{i + 1}</span>
                <div>
                  <p className="font-compact text-[14px] font-semibold leading-snug" style={{ color: '#1D2023' }}>{s.title}</p>
                  <p className="font-compact text-[13px] leading-snug mt-0.5" style={{ color: '#8D969F' }}>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-10 pt-6">
          <button onClick={onOpen}
            className="w-full rounded-2xl py-3.5 font-sans font-bold text-[16px] text-white active:opacity-85 transition-opacity"
            style={{ background: '#1D2023' }}>
            Открыть бота в мессенджере
          </button>
          <p className="font-compact text-[12px] text-center mt-2.5" style={{ color: '#8D969F' }}>
            Отключить можно в любой момент — извлечённое из чатов удалится
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Сценарий ─────────────────────────────────────────────────────────────────

type Screen = 'connect' | 'chat' | 'bot' | 'card'

export default function CallsForward() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initial = (params.get('screen') as Screen) || 'chat'

  const [screen, setScreen] = useState<Screen>(initial)
  // Диплинки сразу в бота или карточку — будто смета и текст уже пересланы
  const [selected, setSelected] = useState<string[]>(initial === 'bot' || initial === 'card' ? ['m2', 'm3'] : [])
  const [picker, setPicker] = useState(false)
  const [phase, setPhase] = useState<BotPhase>(initial === 'card' ? 'saved' : initial === 'bot' ? 'card' : 'typing')

  const forwarded = CHAT.filter(m => selected.includes(m.id))

  const toFeed = () => navigate(`${appHome()}?tab=КОНТЕКСТ`)

  if (screen === 'connect') return <ConnectScreen onOpen={() => setScreen('chat')} onBack={toFeed}/>
  if (screen === 'card') return <ContactCard onBack={toFeed}/>

  if (screen === 'bot') {
    return <BotScreen forwarded={forwarded} phase={phase} setPhase={setPhase}
      onOpenCard={() => setScreen('card')}
      onBack={() => { setScreen('chat'); setSelected(() => []); setPhase('typing') }}/>
  }

  return (
    <>
      <ChatScreen selected={selected} setSelected={setSelected}
        onForward={() => setPicker(true)} onBack={toFeed}/>
      <AnimatePresence>
        {picker && (
          <PickerSheet count={selected.length} onClose={() => setPicker(false)}
            onPick={() => { setPicker(false); setPhase('typing'); setScreen('bot') }}/>
        )}
      </AnimatePresence>
    </>
  )
}
