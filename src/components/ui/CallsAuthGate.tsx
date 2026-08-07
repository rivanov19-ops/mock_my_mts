import { useState, useRef, useEffect } from 'react'
import { Phone, MessageSquare, ArrowLeft } from 'lucide-react'
import { BottomNav } from '../layout/BottomNav'

interface CallsAuthGateProps {
  phone: string
  onConfirm: () => void
}

/**
 * Authorization gate shown in the Calls section when a non-main number is
 * selected. Flow: info dialog → confirm step → SMS code (OTP) → success.
 */
export function CallsAuthGate({ phone, onConfirm }: CallsAuthGateProps) {
  const [step, setStep] = useState<'confirm' | 'otp'>('confirm')

  if (step === 'otp') {
    return <OtpStep phone={phone} onBack={() => setStep('confirm')} onSuccess={onConfirm} />
  }

  return <ConfirmStep onConfirm={() => setStep('otp')} />
}

// ─── Confirm step ─────────────────────────────────────────────────────────────

function ConfirmStep({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Confirm content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-28 text-center">
          {/* Illustration */}
          <div className="relative w-44 h-40 mb-8">
            <div
              className="absolute left-1/2 top-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8E9BE8, #6C5CE7)' }}
            >
              <Phone size={40} color="white" strokeWidth={1.6} fill="white" />
            </div>
            <div
              className="absolute right-3 bottom-3 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7B68EE, #5E48D0)' }}
            >
              <MessageSquare size={20} color="white" strokeWidth={2} />
            </div>
            <div className="absolute left-2 top-6 w-5 h-5 rounded-full" style={{ background: '#C8CCE8' }} />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 176 160" fill="none">
              <path d="M30 120 Q10 60 70 30 Q140 -2 150 70" stroke="#E30611" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            </svg>
          </div>

          <h1 className="font-sans font-bold text-2xl text-gray-900 mb-3 leading-tight">
            Подтвердите<br />номер телефона
          </h1>
          <p className="font-compact font-normal text-sm text-gray-400 leading-snug max-w-[280px]">
            Это дополнительный номер: доступ к звонкам, записям и расшифровкам по нему{' '}
            <span className="font-bold text-gray-900">подтверждается раз в 7 дней</span>
          </p>
        </div>

        {/* Pinned confirm button */}
        <div className="absolute left-0 right-0 px-5" style={{ bottom: '110px' }}>
          <button
            onClick={onConfirm}
            className="w-full bg-gray-900 rounded-full py-4 font-sans font-bold text-sm text-white uppercase tracking-widest active:scale-[0.98] transition-transform"
          >
            Подтвердить номер
          </button>
          <p className="font-compact font-normal text-xs text-gray-400 text-center mt-3 leading-snug">
            Подтверждая номер, вы соглашаетесь{' '}
            <span className="text-blue-500">с условиями оказания услуг</span>
          </p>
        </div>

        <BottomNav />

      </div>
    </div>
  )
}

// ─── OTP step ─────────────────────────────────────────────────────────────────

const TIMER_START = 22

function OtpStep({ phone, onBack, onSuccess }: { phone: string; onBack: () => void; onSuccess: () => void }) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [seconds, setSeconds] = useState(TIMER_START)
  const [loading, setLoading] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { refs.current[0]?.focus() }, [])

  useEffect(() => {
    if (seconds <= 0 || loading) return
    const id = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds, loading])

  function handleChange(i: number, val: string) {
    const char = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = char
    setDigits(next)

    if (char && i < 3) refs.current[i + 1]?.focus()

    // happy path: as soon as all 4 are filled, show loader and succeed
    if (char && i === 3) {
      setLoading(true)
      setTimeout(onSuccess, 1400)
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Header */}
        <div className="px-4 pt-12 pb-4 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0">
            <ArrowLeft size={22} className="text-gray-900" strokeWidth={2} />
          </button>
          <span className="font-sans font-bold text-base text-gray-900">Подтверждение номера</span>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pt-6 flex flex-col items-center">
          <h1 className="font-sans font-bold text-2xl text-gray-900 mb-2">Введите код из SMS</h1>
          <p className="font-compact font-normal text-sm text-gray-400 text-center leading-snug mb-7">
            Мы отправили его<br />на {phone}
          </p>

          {/* OTP card */}
          <div className="w-full bg-gray-50 rounded-2xl px-6 py-7 flex flex-col items-center">
            <div className="flex gap-4 mb-5">
              {digits.map((d, i) => (
                <div key={i} className="flex flex-col items-center w-10">
                  <input
                    ref={el => { refs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    disabled={loading}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-full text-center text-2xl font-sans font-bold text-gray-900 bg-transparent outline-none caret-blue-500"
                  />
                  <div className={`w-7 h-0.5 rounded-full ${d ? 'bg-gray-900' : 'bg-gray-300'}`} />
                </div>
              ))}
            </div>

            {loading ? (
              <div
                className="w-7 h-7 rounded-full animate-spin"
                style={{ border: '2.5px solid #F1D6DA', borderTopColor: '#E30611' }}
              />
            ) : (
              <p className="font-compact font-normal text-sm text-gray-400">
                Отправить ещё раз через {seconds} сек
              </p>
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
