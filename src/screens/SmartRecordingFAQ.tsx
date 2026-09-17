import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const FAQ_ITEMS = [
  'Как подключить и отключить запись разговоров',
  'Как работает запись разговоров',
  'Где хранятся записи и расшифровки',
  'Законно ли записывать разговор без согласия собеседника',
  'Сколько стоит услуга',
  'Совместимость с тарифами и устройствами',
  'Где и кому доступно',
]

export default function SmartRecordingFAQ() {
  const navigate = useNavigate()
  const [showSheet, setShowSheet] = useState(false)

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#F2F3F7' }}>
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* MTS Website Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid #E8E8E8' }}>
          {/* Logo */}
          <button onClick={() => navigate(-1)}>
            <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: '#E30611' }}>
              <div className="text-white font-sans font-black leading-none text-center" style={{ fontSize: 9, lineHeight: 1.1 }}>
                <div>М</div>
                <div style={{ letterSpacing: '0.05em' }}>Т С</div>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button className="px-4 py-1.5 rounded-full font-sans font-bold text-sm text-white" style={{ background: '#E30611' }}>
              ВОЙТИ
            </button>
            <button>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D2023" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="font-sans font-black text-2xl" style={{ color: '#1D2023' }}>Что нужно знать</h1>
        </div>

        {/* FAQ List */}
        <div className="px-4 flex flex-col gap-0">
          <div className="bg-white rounded-2xl overflow-hidden">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                {i > 0 && <div className="h-px mx-4" style={{ background: '#F2F3F7' }}/>}
                <button className="w-full flex items-center justify-between px-4 py-4 text-left active:bg-gray-50 transition-colors">
                  <span className="font-compact text-[15px] leading-snug flex-1 pr-3" style={{ color: '#1D2023' }}>{item}</span>
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M1 1l6 6-6 6" stroke="#C7CBD0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}

            {/* Дополнительно */}
            <div className="h-px mx-4" style={{ background: '#F2F3F7' }}/>
            <button
              onClick={() => setShowSheet(true)}
              className="w-full flex items-center justify-between px-4 py-4 text-left active:bg-gray-50 transition-colors"
            >
              <span className="font-compact text-[15px]" style={{ color: '#1D2023' }}>Дополнительно</span>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0 }}>
                <path d="M1 1l6 6-6 6" stroke="#C7CBD0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Дополнительно bottom sheet */}
        <AnimatePresence>
          {showSheet && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/30" onClick={() => setShowSheet(false)}/>
              <motion.div
                className="relative w-full max-w-app bg-white rounded-t-[24px] overflow-hidden"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              >
                <div className="flex items-center justify-between px-5 pt-5 pb-4">
                  <span className="font-sans font-black text-2xl" style={{ color: '#1D2023' }}>Дополнительно</span>
                  <button
                    onClick={() => setShowSheet(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full"
                    style={{ background: '#F2F3F7' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2L12 12M12 2L2 12" stroke="#1D2023" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                <div className="px-5 pb-10 flex flex-col gap-5">
                  {/* Feedback text */}
                  <p className="font-compact text-sm leading-relaxed" style={{ color: '#1D2023' }}>
                    Напишите что нравится или не нравится в сервисе — ответит живой человек из команды{' '}
                    <a
                      href="mailto:vt_feedback_ns@mts.ru"
                      className="font-compact text-sm"
                      style={{ color: '#E30611' }}
                    >
                      vt_feedback_ns@mts.ru
                    </a>
                  </p>

                  {/* Пользовательское соглашение */}
                  <a
                    href="#"
                    className="font-compact text-sm"
                    style={{ color: '#007AFF' }}
                  >
                    Пользовательское соглашение
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
