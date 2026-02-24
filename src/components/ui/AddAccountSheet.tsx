import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from './Logo'

// ─── helpers ────────────────────────────────────────────────────────────────

function formatPhone(d: string): string {
  if (d.length === 0) return ''
  if (d.length <= 3) return `+7 (${d}`
  if (d.length <= 6) return `+7 (${d.slice(0, 3)}) ${d.slice(3)}`
  if (d.length <= 8) return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`
}

const VALID_CODE = '1234'
const TIMER_START = 60

// ─── OTP boxes ──────────────────────────────────────────────────────────────

interface OtpStepProps {
  phone: string
  onBack: () => void
  onSuccess: () => void
}

function OtpStep({ phone, onBack, onSuccess }: OtpStepProps) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError]   = useState(false)
  const [seconds, setSeconds] = useState(TIMER_START)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  // auto-focus first box on mount
  useEffect(() => { refs.current[0]?.focus() }, [])

  // countdown
  useEffect(() => {
    if (seconds <= 0) return
    const id = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds])

  function handleChange(i: number, val: string) {
    const char = val.replace(/\D/g, '').slice(-1)
    setError(false)
    const next = [...digits]
    next[i] = char
    setDigits(next)

    if (char && i < 3) {
      refs.current[i + 1]?.focus()
    }

    // auto-validate when all 4 filled
    if (char && i === 3) {
      const code = [...next.slice(0, 3), char].join('')
      if (code === VALID_CODE) {
        onSuccess()
      } else {
        setError(true)
        setDigits(['', '', '', ''])
        setTimeout(() => refs.current[0]?.focus(), 0)
      }
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  return (
    <>
      {/* Heading */}
      <h2 className="font-sans font-bold text-[1.4rem] text-gray-900 mb-1 leading-snug">
        Введите код из СМС
      </h2>
      <p className="font-compact font-normal text-sm text-gray-400 mb-6">
        Отправили его на {phone}
      </p>

      {/* OTP boxes */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            placeholder="0"
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className={`h-16 text-center text-2xl font-sans font-bold
              rounded-2xl outline-none transition-all
              placeholder:text-gray-300 placeholder:font-normal
              ${error
                ? 'bg-red-50 ring-2 ring-red-400 text-red-500'
                : 'bg-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500'
              }`}
          />
        ))}
      </div>

      {/* Countdown / resend */}
      <p className="font-compact font-normal text-sm text-gray-400 mb-4">
        {seconds > 0
          ? `Получить код ещё раз через ${seconds} сек.`
          : (
            <button
              onClick={() => setSeconds(TIMER_START)}
              className="text-blue-500"
            >
              Получить код ещё раз
            </button>
          )
        }
      </p>

      {/* Links */}
      <button onClick={onBack} className="font-compact font-medium text-sm text-blue-500 block mb-3">
        Войти с другим номером
      </button>
      <button className="font-compact font-medium text-sm text-blue-500 block">
        Не могу получить СМС
      </button>
    </>
  )
}

// ─── Phone step ─────────────────────────────────────────────────────────────

interface PhoneStepProps {
  onNext: (phone: string) => void
}

function PhoneStep({ onNext }: PhoneStepProps) {
  const [digits, setDigits] = useState('')
  const isValid = digits.length === 10

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    const d = raw.startsWith('7') && raw.length > 1 ? raw.slice(1) : raw
    setDigits(d.slice(0, 10))
  }

  return (
    <>
      {/* Heading */}
      <h2 className="font-sans font-bold text-[1.4rem] text-gray-900 mb-2 leading-snug">
        Введите ваш номер
      </h2>
      <p className="font-compact font-normal text-sm text-gray-500 leading-snug mb-6">
        Это может быть номер телефона МТС или другого оператора, городской, виртуальный или номер лицевого счёта
      </p>

      {/* Input */}
      <input
        type="tel"
        inputMode="numeric"
        autoFocus
        value={formatPhone(digits)}
        onChange={handleChange}
        placeholder="Ваш номер"
        className="w-full bg-gray-100 rounded-full px-5 py-4 text-base
          font-compact font-normal text-gray-900 outline-none mb-3
          placeholder:text-gray-400"
      />

      {/* ДАЛЕЕ */}
      <button
        onClick={() => isValid && onNext(formatPhone(digits))}
        disabled={!isValid}
        className={`w-full rounded-full py-4 font-sans font-bold text-sm
          uppercase tracking-widest transition-colors mb-5
          ${isValid
            ? 'bg-mts-red text-white hover:bg-mts-red-dark'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
      >
        Далее
      </button>

      <button className="font-compact font-medium text-sm text-blue-500">
        Не знаю, какие данные вводить
      </button>
    </>
  )
}

// ─── Main sheet ──────────────────────────────────────────────────────────────

interface AddAccountSheetProps {
  open: boolean
  onClose: () => void
}

export function AddAccountSheet({ open, onClose }: AddAccountSheetProps) {
  const navigate = useNavigate()
  const [step, setStep]   = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')

  // reset to phone step when closed
  useEffect(() => {
    if (!open) setTimeout(() => setStep('phone'), 400)
  }, [open])

  function handlePhoneNext(formatted: string) {
    setPhone(formatted)
    setStep('otp')
  }

  function handleSuccess() {
    onClose()
    navigate('/dashboard', { state: { phone } })
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">

          {/* Gradient backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, #b0c4e8 0%, #d6e0f0 40%, #e8ecf4 100%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* White card */}
          <motion.div
            className="relative w-full max-w-app bg-white rounded-t-[28px] flex flex-col"
            style={{ height: '92%' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-4 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5">

              {/* MTS ID header */}
              <div className="flex items-center gap-2 mb-5">
                <Logo size={40} />
                <span className="font-sans font-black text-xl text-gray-900">ID</span>
              </div>

              {/* Step content */}
              {step === 'phone'
                ? <PhoneStep onNext={handlePhoneNext} />
                : <OtpStep phone={phone} onBack={() => setStep('phone')} onSuccess={handleSuccess} />
              }

            </div>

            {/* Pinned footer */}
            <div className="px-5 pt-4 pb-8 shrink-0 border-t border-gray-100">
              <p className="font-compact font-normal text-xs text-gray-400 leading-snug mb-1">
                При входе на ресурс, вы принимаете{' '}
                <span className="text-blue-500 cursor-pointer">условия доступа</span>
                {' '}и{' '}
                <span className="text-blue-500 cursor-pointer">политику обработки ПДн в ПАО МТС</span>
              </p>
              <p className="font-compact font-normal text-xs text-gray-400">
                © 2026 ПАО МТС. Все права защищены
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
