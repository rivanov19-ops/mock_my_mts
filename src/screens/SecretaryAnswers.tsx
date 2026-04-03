import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreHorizontal } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from '../components/layout/BottomNav'

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="relative shrink-0 transition-colors duration-200"
      style={{
        width: 51, height: 31, borderRadius: 15.5,
        background: enabled ? '#34C759' : '#D1D5DB',
      }}
    >
      <div
        className="absolute top-[2px] bg-white rounded-full transition-all duration-200"
        style={{
          width: 27, height: 27,
          left: enabled ? 22 : 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.22)',
        }}
      />
    </button>
  )
}

// ─── Toaster ──────────────────────────────────────────────────────────────────

function ErrorToast({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-24 left-0 right-0 flex justify-center z-50 px-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{ background: '#1D2023', boxShadow: '0 4px 20px rgba(0,0,0,0.28)' }}
          >
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-compact text-[14px] text-white">Ошибка, попробуйте снова</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SecretaryAnswers() {
  const navigate = useNavigate()
  const [couriersOn, setCouriersOn] = useState(true)
  const [toastVisible, setToastVisible] = useState(false)

  const handleToggle = (next: boolean) => {
    if (next === false) {
      // Simulate error: revert and show toast
      setCouriersOn(true)
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 2800)
    } else {
      setCouriersOn(next)
    }
  }

  return (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* Header */}
        <div className="px-4 pt-12 pb-4 bg-white shrink-0" style={{ borderBottom: '1px solid #F2F2F7' }}>
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center shrink-0">
              <ArrowLeft size={22} strokeWidth={2} style={{ color: '#1D2023' }} />
            </button>
            <h1 className="font-sans font-bold text-[17px] flex-1 text-center pr-9" style={{ color: '#1D2023' }}>
              Ответы Секретаря
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-6 pb-28 px-4">

          <h2 className="font-sans font-black text-[20px] mb-3" style={{ color: '#1D2023' }}>Сценарии</h2>

          <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.08)', border: '1px solid #F2F3F7' }}>

            {/* Курьеры */}
            <div className="px-4 py-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-[16px]" style={{ color: '#1D2023' }}>Курьеры</p>
                <p className="font-compact text-[14px] leading-snug mt-0.5" style={{ color: '#8D969F' }}>
                  Секретарь поможет курьеру добраться без звонков вам
                </p>
              </div>
              <Toggle enabled={couriersOn} onChange={handleToggle} />
            </div>

            <div className="h-px mx-4" style={{ background: '#F2F3F7' }} />

            {/* Дом */}
            <button
              className="w-full px-4 py-4 flex items-start gap-3 text-left active:bg-gray-50 transition-colors"
              onClick={() => navigate('/calls/secretary-answers/home')}
            >
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-[16px]" style={{ color: '#1D2023' }}>Дом</p>
                <p className="font-compact text-[14px] leading-snug mt-0.5" style={{ color: '#8D969F' }}>
                  Москва, ул. Александры Монаховой, д. 4, к. 1, этаж 9, кв. 135
                </p>
              </div>
              <MoreHorizontal size={20} strokeWidth={2} style={{ color: '#C7CBD0' }} className="shrink-0 mt-0.5" />
            </button>

          </div>
        </div>

        <BottomNav />

        <ErrorToast visible={toastVisible} />
      </div>
    </div>
  )
}
