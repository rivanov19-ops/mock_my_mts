import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronRight, CheckCircle, Crown, Users, Smartphone, Tv, Home } from 'lucide-react'
import { BottomNav } from '../components/layout/BottomNav'
import mock from '../core/data/mock'

// ─── Promo cards ─────────────────────────────────────────────────────────────

const PROMO_CARDS = [
  {
    label: '5G: скоро\nв МТС',
    bg: 'linear-gradient(135deg, #E30611 0%, #FF6B35 100%)',
    accent: '#FF8C42',
  },
  {
    label: 'Ваши\nперсональные\nбонусы',
    bg: 'linear-gradient(135deg, #4A90D9 0%, #7B68EE 100%)',
    accent: '#6A9FE0',
  },
  {
    label: 'Всё\nо задолжен-\nностях',
    bg: 'linear-gradient(135deg, #2C2C2E 0%, #48484A 100%)',
    accent: '#636366',
  },
  {
    label: 'Какие услуги\nподключены',
    bg: 'linear-gradient(135deg, #E91E8C 0%, #FF9A3C 100%)',
    accent: '#F06292',
  },
]

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const location   = useLocation()
  const statePhone = (location.state as { phone?: string } | null)?.phone
  const phone      = statePhone ?? mock.user.phone
  const [showToast, setShowToast] = useState(!!statePhone)

  useEffect(() => {
    if (!showToast) return
    const id = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(id)
  }, [showToast])

  return (
    <div className="min-h-screen bg-mts-surface flex justify-center">
      <div className="w-full max-w-app flex flex-col min-h-screen relative">

        {/* ── Top bar ── */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3 bg-mts-surface">

          {/* Account icon */}
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0">
            <Crown size={22} color="white" strokeWidth={2} />
          </div>

          {/* Account info */}
          <div className="flex-1 min-w-0">
            <p className="font-compact font-normal text-xs text-gray-500">Основной номер</p>
            <p className="font-sans font-bold text-sm text-gray-900 truncate">{phone}</p>
          </div>

          {/* Bell */}
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
            <Bell size={18} className="text-gray-700" strokeWidth={1.5} />
          </button>

          {/* Cashback */}
          <button
            className="h-10 px-4 rounded-full flex items-center gap-1 shrink-0"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #E91E8C)' }}
          >
            <span className="text-white font-sans font-bold text-xs">✦</span>
            <span className="text-white font-sans font-bold text-xs uppercase tracking-wide">CASHBACK</span>
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto pb-24 flex flex-col gap-4">

          {/* Promo carousel */}
          <div className="flex gap-3 overflow-x-auto px-4 pt-1 pb-1"
               style={{ scrollbarWidth: 'none' }}>
            {PROMO_CARDS.map((card) => (
              <div
                key={card.label}
                className="shrink-0 p-[2px] rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #E30611 0%, #FF6B9D 100%)' }}
              >
                <div
                  className="w-[134px] h-[152px] rounded-[14px] flex flex-col justify-end p-3"
                  style={{ background: card.bg }}
                >
                  {/* Decorative circle */}
                  <div
                    className="absolute w-16 h-16 rounded-full opacity-20 self-end mb-6 mr-2"
                    style={{ background: card.accent }}
                  />
                  <p className="font-sans font-bold text-xs text-white whitespace-pre-line leading-snug relative z-10">
                    {card.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Семейная группа */}
          <div className="px-4">
            <button className="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-4 shadow-sm">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #E91E8C, #FF6B35)' }}
              >
                <Users size={22} color="white" strokeWidth={2} />
              </div>
              <span className="font-sans font-bold text-base text-gray-900 flex-1 text-left">
                Семейная группа
              </span>
              <ChevronRight size={18} className="text-gray-400 shrink-0" />
            </button>
          </div>

          {/* В МТС со своим номером */}
          <div className="px-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-1">
                  <p className="font-sans font-bold text-base text-gray-900 mb-1">
                    В МТС со своим номером
                  </p>
                  <p className="font-compact font-normal text-sm text-gray-500">
                    Оформите документы онлайн
                  </p>
                </div>
                <div
                  className="w-14 h-16 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(160deg, #E8EAF6, #C5CAE9)' }}
                >
                  <Smartphone size={28} className="text-blue-400" strokeWidth={1.5} />
                </div>
              </div>
              <button className="w-full border border-gray-200 rounded-full py-3.5 font-sans font-bold text-sm text-gray-900 uppercase tracking-widest hover:bg-gray-50 transition-colors">
                Перенести номер
              </button>
            </div>
          </div>

          {/* Для дома */}
          <div className="px-4 flex flex-col gap-3">
            <h2 className="font-sans font-black text-xl text-gray-900">Для дома</h2>

            {/* Один тариф для всего */}
            <div
              className="rounded-2xl p-5 flex items-center gap-4 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #F5F5F7 0%, #EBEBF0 100%)' }}
            >
              <div className="flex-1">
                <p className="font-sans font-bold text-base text-gray-900 mb-1">
                  Один тариф для всего
                </p>
                <p className="font-compact font-normal text-sm text-gray-500 leading-snug">
                  Мобильная связь, домашний интернет и ТВ
                </p>
              </div>
              <div
                className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7B68EE, #E91E8C)' }}
              >
                <Tv size={28} color="white" strokeWidth={1.5} />
              </div>
            </div>

            {/* КИОН + Умный дом */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'КИОН',        sub: 'Кино, сериалы и ТВ',  color: '#E30611' },
                { title: 'Умный дом',   sub: 'Камеры и датчики',    color: '#4A90D9' },
              ].map(({ title, sub, color }) => (
                <div
                  key={title}
                  className="rounded-2xl p-4 flex flex-col gap-2"
                  style={{ background: 'linear-gradient(135deg, #F5F5F7, #EBEBF0)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: color }}
                  >
                    <Home size={18} color="white" strokeWidth={2} />
                  </div>
                  <p className="font-sans font-bold text-sm text-gray-900">{title}</p>
                  <p className="font-compact font-normal text-xs text-gray-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Bottom nav ── */}
        <BottomNav />

        {/* ── Login toast ── */}
        <AnimatePresence>
          {showToast && (
            <div className="fixed bottom-[76px] left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
              <motion.div
                className="bg-[#1C1C1E] text-white rounded-full px-5 py-3
                  flex items-center gap-3 shadow-xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.25 }}
              >
                <CheckCircle size={18} className="text-green-400 shrink-0" strokeWidth={2.5} />
                <span className="font-compact font-medium text-sm whitespace-nowrap">
                  Вы вошли под аккаунтом {phone}
                </span>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
