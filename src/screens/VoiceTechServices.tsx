import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mic, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Toggle } from '../components/ui/Toggle'

interface ServiceItem {
  id: string
  title: string
  description: string
  icon: 'secretary' | 'recording' | 'assistant' | 'noise'
}

const SERVICES: ServiceItem[] = [
  {
    id: 'secretary',
    title: 'МТС Секретарь',
    description: 'Если неудобно отвечать на звонок, доверьте его Секретарю или переведите в чат',
    icon: 'secretary',
  },
  {
    id: 'recording',
    title: 'Интеллектуальная запись',
    description: 'Автоматическая запись и текстовые расшифровки телефонных звонков',
    icon: 'recording',
  },
  {
    id: 'noise',
    title: 'Шумоподавление',
    description: 'ИИ в реальном времени уберёт из звонка посторонние звуки',
    icon: 'noise',
  },
  {
    id: 'assistant',
    title: 'Ассистент в звонке',
    description: 'Позовите Марвина во время звонка, чтобы он сделал заметки или нашёл ответ в интернете',
    icon: 'assistant',
  },
]

function ServiceIcon({ icon }: { icon: ServiceItem['icon'] }) {
  return (
    <div
      className="w-[52px] h-[52px] rounded-2xl shrink-0 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #9088E9 0%, #6F63D8 100%)' }}
    >
      {icon === 'secretary' && (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M11 4 l2.2 5.3 5.3 2.2 -5.3 2.2 -2.2 5.3 -2.2 -5.3 -5.3 -2.2 5.3 -2.2 z" fill="white" />
          <path d="M19.5 14.5 l1.1 2.6 2.6 1.1 -2.6 1.1 -1.1 2.6 -1.1 -2.6 -2.6 -1.1 2.6 -1.1 z" fill="white" fillOpacity="0.85" />
        </svg>
      )}
      {icon === 'recording' && (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <circle cx="8" cy="15" r="3.5" fill="white" />
          <circle cx="18" cy="15" r="3.5" fill="white" />
          <rect x="8" y="15" width="10" height="3.5" fill="white" />
          <path d="M8 8.5 C10 6, 16 6, 18 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
        </svg>
      )}
      {icon === 'assistant' && (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <circle cx="13" cy="13" r="9.5" stroke="white" strokeWidth="2.2" fill="none" />
          <path d="M13 8.5 l1.6 2.9 2.9 1.6 -2.9 1.6 -1.6 2.9 -1.6 -2.9 -2.9 -1.6 2.9 -1.6 z" fill="white" />
        </svg>
      )}
      {icon === 'noise' && (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <g stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <path d="M5 10 v6" />
            <path d="M10 6.5 v13" />
            <path d="M15 9 v8" />
          </g>
          <g stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.45">
            <path d="M20 11 v4" />
            <path d="M24 12.5 v1" />
          </g>
        </svg>
      )}
    </div>
  )
}

function ServiceRow({
  item,
  enabled,
  onToggle,
  onClick,
}: {
  item: ServiceItem
  enabled: boolean
  onToggle: (v: boolean) => void
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`w-full bg-[#F2F3F7] rounded-[24px] px-4 py-4 flex items-center gap-4 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
    >
      <ServiceIcon icon={item.icon} />
      <div className="flex-1 min-w-0">
        <p className="font-sans font-bold text-[17px] text-gray-900 leading-snug">{item.title}</p>
        <p className="font-compact font-normal text-sm text-gray-500 leading-snug mt-0.5">{item.description}</p>
      </div>
      <div onClick={e => e.stopPropagation()}>
        <Toggle enabled={enabled} onChange={onToggle} />
      </div>
    </div>
  )
}

// ─── Иллюстрация Ассистента ──────────────────────────────────────────────────

function AssistantIllustration({ onClose, connected }: { onClose: () => void; connected?: boolean }) {
  return (
    <div
      className="relative h-[200px] flex items-center justify-center"
      style={{ background: 'linear-gradient(150deg, #C6CAEC 0%, #D6D9F3 60%, #E1E3F6 100%)' }}
    >
      {connected && (
        <div className="absolute top-4 left-4 bg-white/50 rounded-full px-3 py-1.5">
          <span className="font-compact text-xs text-gray-700">Подключено</span>
        </div>
      )}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 flex items-center justify-center"
      >
        <X size={16} className="text-gray-700" strokeWidth={2} />
      </button>

      {/* Стеклянный сквиркл с трубкой */}
      <div className="relative">
        <div
          className="w-[120px] h-[120px] rounded-[32px] flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.55), rgba(255,255,255,0.2))',
            boxShadow: '0 8px 24px rgba(110,100,200,0.25)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}
        >
          <Phone size={46} className="text-[#8D93C9]" strokeWidth={1.5} />
        </div>

        {/* Красный бейдж с микрофоном */}
        <div
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: '#E30611', boxShadow: '0 4px 12px rgba(227,6,17,0.35)' }}
        >
          <Mic size={18} color="white" strokeWidth={2} />
        </div>

        {/* Чипы */}
        <div className="absolute -left-16 bottom-2 bg-white/50 rounded-full px-3 py-1.5">
          <span className="font-compact text-xs text-gray-700">Заметка</span>
        </div>
        <div className="absolute -right-14 bottom-2 bg-white/50 rounded-full px-3 py-1.5">
          <span className="font-compact text-xs text-gray-700">Сейчас</span>
        </div>
      </div>
    </div>
  )
}

// ─── Промо-шторка «Ассистент в звонке» ───────────────────────────────────────

function AssistantPromoSheet({ onClose, onSubscribe }: { onClose: () => void; onSubscribe: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <AssistantIllustration onClose={onClose} />

        {/* Контент */}
        <div className="px-5 pt-5 pb-6">
          <h2 className="font-sans font-black text-[1.6rem] text-gray-900 leading-tight mb-3">
            Ассистент в звонке
          </h2>
          <p className="font-compact font-normal text-base text-gray-600 leading-snug mb-4">
            Цифровой помощник выполняет ваши поручения прямо во время разговора. Ищет информацию
            в интернете, рассказывает о погоде, сохраняет важное и не только
          </p>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-sans font-black text-xl text-gray-900">0 ₽</span>
            <span className="font-compact text-base text-gray-400 line-through">99 ₽/мес</span>
          </div>
          <p className="font-compact font-normal text-xs text-gray-400 leading-snug mb-3">
            При первом подключении 30 дней за 0 ₽/мес,<br />далее 99 ₽/мес
          </p>

          <button className="font-compact text-sm text-[#0070E5] mb-5">Подробнее об услуге</button>

          <button
            onClick={onSubscribe}
            className="w-full bg-gray-900 rounded-2xl py-4 font-sans font-bold text-sm text-white uppercase tracking-widest active:opacity-80 transition-opacity"
          >
            Подключить
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Шторка оплаты «Подключение» ─────────────────────────────────────────────

function PaymentSheet({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-app px-2 pb-2 flex flex-col gap-2"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        {/* Блок «Подключение» */}
        <div className="bg-white rounded-[24px] p-5">
          <div className="flex items-start justify-between mb-1">
            <h2 className="font-sans font-bold text-xl text-gray-900">Подключение</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 active:bg-gray-200"
            >
              <X size={15} className="text-gray-700" strokeWidth={2} />
            </button>
          </div>
          <p className="font-compact font-normal text-sm text-gray-400 mb-5">На номер +7 904 000-83-17</p>

          <p className="font-sans font-bold text-sm text-gray-900 mb-1">Услуга</p>
          <p className="font-compact font-normal text-sm text-gray-500 mb-5">Ассистент в звонке</p>

          <p className="font-sans font-bold text-sm text-gray-900 mb-2">Способ оплаты</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#0070E5] flex items-center justify-center">
              <span className="font-sans font-bold text-white" style={{ fontSize: 11 }}>₽</span>
            </div>
            <span className="font-compact font-normal text-sm text-gray-900">Баланс: 900 ₽</span>
          </div>
        </div>

        {/* Блок «К оплате» */}
        <div className="bg-white rounded-[24px] p-5">
          <div className="flex items-center justify-between mb-0.5">
            <span className="font-sans font-bold text-base text-gray-900">К оплате</span>
            <span className="font-sans font-bold text-base text-gray-900">0 ₽</span>
          </div>
          <p className="font-compact font-normal text-sm text-gray-400 mb-4">С 4 августа 99 ₽/мес</p>

          <button
            onClick={onConfirm}
            className="w-full bg-[#E30611] rounded-2xl py-4 font-sans font-bold text-sm text-white uppercase tracking-widest active:opacity-80 transition-opacity"
          >
            Подключить
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Инфо-шторка подключённого «Ассистента в звонке» ─────────────────────────

function AssistantConnectedSheet({ onClose, onDisconnect }: { onClose: () => void; onDisconnect: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <AssistantIllustration onClose={onClose} connected />

        {/* Контент */}
        <div className="px-5 pt-5 pb-6">
          <h2 className="font-sans font-black text-[1.6rem] text-gray-900 leading-tight mb-3">
            Ассистент в звонке
          </h2>
          <p className="font-compact font-normal text-base text-gray-600 leading-snug mb-4">
            Цифровой помощник выполняет ваши поручения прямо во время разговора. Ищет информацию
            в интернете, рассказывает о погоде, сохраняет важное и не только
          </p>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-sans font-black text-xl text-gray-900">0 ₽</span>
            <span className="font-compact text-base text-gray-400 line-through">99 ₽/мес</span>
          </div>
          <p className="font-compact font-normal text-xs text-gray-400 leading-snug mb-3">
            Дата подключения 8 июля 2026 в 15:16
          </p>

          <button className="font-compact text-sm text-[#0070E5] mb-5">Подробнее об услуге</button>

          <button
            onClick={onDisconnect}
            className="w-full bg-[#F2F3F7] rounded-2xl py-4 font-sans font-bold text-sm text-gray-900 uppercase tracking-widest active:bg-gray-200 transition-colors"
          >
            Отключить
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Шторка подтверждения отключения ─────────────────────────────────────────

function DisconnectConfirmSheet({ onKeep, onDisconnect }: { onKeep: () => void; onDisconnect: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onKeep} />

      <motion.div
        className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <div className="px-5 pt-4 pb-6">
          <div className="flex justify-end mb-1">
            <button
              onClick={onKeep}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"
            >
              <X size={15} className="text-gray-700" strokeWidth={2} />
            </button>
          </div>

          {/* Сквиркл с вопросом */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div
                className="w-[84px] h-[84px] rounded-[24px] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(140deg, #B9AFF0 0%, #9088E9 55%, #C9A8EE 100%)',
                  boxShadow: '0 10px 26px rgba(130,110,220,0.35)',
                }}
              >
                <span className="font-sans font-black text-white" style={{ fontSize: 38 }}>?</span>
              </div>
              <div
                className="absolute -left-4 -bottom-2 w-9 h-9 rounded-2xl"
                style={{ background: 'linear-gradient(140deg, #D4CDF6, #B9AFF0)', opacity: 0.8 }}
              />
            </div>
          </div>

          <h2 className="font-sans font-bold text-xl text-gray-900 text-center mb-2">
            Точно отключить<br />услугу?
          </h2>
          <p className="font-compact font-normal text-sm text-gray-400 text-center leading-snug mb-6">
            «Ассистент в звонке» перестанет<br />работать
          </p>

          <button
            onClick={onKeep}
            className="w-full bg-gray-900 rounded-2xl py-4 font-sans font-bold text-sm text-white uppercase tracking-widest mb-3 active:opacity-80 transition-opacity"
          >
            Оставить услугу
          </button>
          <button
            onClick={onDisconnect}
            className="w-full bg-[#F2F3F7] rounded-2xl py-4 font-sans font-bold text-sm text-[#E8552E] uppercase tracking-widest active:bg-gray-200 transition-colors"
          >
            Отключить
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Шторка процесса (подключение / отключение) ──────────────────────────────

function ProcessingSheet({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle: ReactNode
  onClose: () => void
}) {
  const petals = Array.from({ length: 10 }, (_, i) => i)
  const colors = ['#8F86E8', '#A5B4F0', '#7C9BEB', '#B9AFF0', '#93C0F2']
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Шторка процесса закрывается только по «Понятно» — фон и крестик не закрывают */}
      <div className="absolute inset-0 bg-black/40" />

      <motion.div
        className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <div className="px-5 pt-8 pb-6">
          {/* Цветной спиннер */}
          <div className="flex justify-center mb-6">
            <motion.svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              animate={{ rotate: 360 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            >
              {petals.map(i => (
                <rect
                  key={i}
                  x="33"
                  y="6"
                  width="6"
                  height="18"
                  rx="3"
                  fill={colors[i % colors.length]}
                  opacity={0.35 + 0.65 * (i / petals.length)}
                  transform={`rotate(${(360 / petals.length) * i} 36 36)`}
                />
              ))}
            </motion.svg>
          </div>

          <h2 className="font-sans font-bold text-xl text-gray-900 text-center mb-2">
            {title}
          </h2>
          <p className="font-compact font-normal text-sm text-gray-400 text-center leading-snug mb-6">
            {subtitle}
          </p>

          <button
            onClick={onClose}
            className="w-full bg-[#F2F3F7] rounded-2xl py-4 font-sans font-bold text-sm text-gray-900 uppercase tracking-widest active:bg-gray-200 transition-colors"
          >
            Понятно
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Экран ────────────────────────────────────────────────────────────────────

export default function VoiceTechServices() {
  const navigate = useNavigate()
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({
    secretary: true,
    recording: true,
    noise: true,
    assistant: false,
  })
  const [assistantConnected, setAssistantConnected] = useState(false)
  const [showPromo, setShowPromo] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showProcessing, setShowProcessing] = useState(false)
  const [showConnectedInfo, setShowConnectedInfo] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [showDisconnecting, setShowDisconnecting] = useState(false)

  const setEnabled = (id: string) => (v: boolean) => setEnabledMap(m => ({ ...m, [id]: v }))

  const connected = SERVICES.filter(s => s.id !== 'assistant' || assistantConnected)
  const available = assistantConnected ? [] : SERVICES.filter(s => s.id === 'assistant')

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* Header */}
        <div className="px-4 pt-12 pb-4 flex items-center">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center shrink-0">
            <ArrowLeft size={24} className="text-gray-900" strokeWidth={2} />
          </button>
          <h1 className="font-sans font-bold text-lg text-gray-900 flex-1 text-center pr-9">
            Сервисы VoiceTech
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-10 px-4">
          <p className="font-sans font-bold text-base text-gray-400 uppercase tracking-wide pt-2 pb-3">
            Подключено
          </p>
          <div className="flex flex-col gap-3">
            {connected.map(item => (
              <ServiceRow
                key={item.id}
                item={item}
                enabled={enabledMap[item.id]}
                onToggle={
                  item.id === 'assistant'
                    ? (v) => { if (!v) setShowDisconnectConfirm(true) }
                    : setEnabled(item.id)
                }
                onClick={item.id === 'assistant' ? () => setShowConnectedInfo(true) : undefined}
              />
            ))}
          </div>

          {available.length > 0 && (
            <>
              <p className="font-sans font-bold text-base text-gray-400 uppercase tracking-wide pt-6 pb-3">
                Доступно
              </p>
              <div className="flex flex-col gap-3">
                {available.map(item => (
                  <ServiceRow
                    key={item.id}
                    item={item}
                    enabled={enabledMap[item.id]}
                    onToggle={() => setShowPromo(true)}
                    onClick={() => setShowPromo(true)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Промо-шторка */}
        <AnimatePresence>
          {showPromo && (
            <AssistantPromoSheet
              onClose={() => setShowPromo(false)}
              onSubscribe={() => setShowPayment(true)}
            />
          )}
        </AnimatePresence>

        {/* Шторка оплаты */}
        <AnimatePresence>
          {showPayment && (
            <PaymentSheet
              onClose={() => setShowPayment(false)}
              onConfirm={() => {
                setShowPayment(false)
                setShowProcessing(true)
              }}
            />
          )}
        </AnimatePresence>

        {/* Шторка «Услуга подключается» */}
        <AnimatePresence>
          {showProcessing && (
            <ProcessingSheet
              title="Услуга подключается"
              subtitle={<>Пришлём СМС или пуш-уведомление,<br />как всё будет готово</>}
              onClose={() => {
                setShowProcessing(false)
                setShowPromo(false)
                setAssistantConnected(true)
                setEnabledMap(m => ({ ...m, assistant: true }))
              }}
            />
          )}
        </AnimatePresence>

        {/* Инфо-шторка подключённого Ассистента */}
        <AnimatePresence>
          {showConnectedInfo && (
            <AssistantConnectedSheet
              onClose={() => setShowConnectedInfo(false)}
              onDisconnect={() => setShowDisconnectConfirm(true)}
            />
          )}
        </AnimatePresence>

        {/* Шторка подтверждения отключения */}
        <AnimatePresence>
          {showDisconnectConfirm && (
            <DisconnectConfirmSheet
              onKeep={() => setShowDisconnectConfirm(false)}
              onDisconnect={() => {
                setShowDisconnectConfirm(false)
                setShowDisconnecting(true)
              }}
            />
          )}
        </AnimatePresence>

        {/* Шторка «Отключаем» */}
        <AnimatePresence>
          {showDisconnecting && (
            <ProcessingSheet
              title="Отключаем"
              subtitle={<>Обычно это занимает до минуты — пришлём<br />уведомление в приложении или СМС результатом</>}
              onClose={() => {
                setShowDisconnecting(false)
                setShowConnectedInfo(false)
                setAssistantConnected(false)
                setEnabledMap(m => ({ ...m, assistant: false }))
              }}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
