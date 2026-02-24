import { ChevronRight, GraduationCap, HelpCircle, PhoneForwarded, AlertCircle, MessageCircle } from 'lucide-react'
import { BottomNav } from '../components/layout/BottomNav'
import { Logo } from '../components/ui/Logo'
import mock from '../core/data/mock'

const MENU_ITEMS = [
  { icon: GraduationCap,   label: 'О приложении',         sub: '' },
  { icon: HelpCircle,      label: 'Справка',               sub: 'Ответы на частые вопросы' },
  { icon: PhoneForwarded,  label: 'Поддержка в роуминге',  sub: '' },
  { icon: AlertCircle,     label: 'Сообщить о номере',     sub: '' },
]

export default function Support() {
  return (
    <div className="min-h-screen bg-mts-surface flex justify-center">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* ── Top bar ── */}
        <div className="px-4 pt-12 pb-5 bg-mts-surface">
          <h1 className="font-sans font-black text-2xl text-gray-900 leading-tight">Поддержка</h1>
          <p className="font-compact font-normal text-sm text-gray-400">{mock.user.name}</p>
        </div>

        {/* ── Scrollable ── */}
        <div className="flex-1 overflow-y-auto pb-24 flex flex-col gap-6">

          {/* Hero cards */}
          <div className="grid grid-cols-2 gap-3 px-4">

            {/* Чат со специалистом */}
            <button
              className="rounded-3xl overflow-hidden flex flex-col justify-between p-4 min-h-[160px] text-left active:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(145deg, #dde4f8 0%, #ccd0f0 100%)' }}
            >
              <p className="font-sans font-black text-base text-[#2D2F7B] leading-snug">
                Чат со<br />специалистом
              </p>
              {/* Chat bubble illustration */}
              <div className="flex justify-center mt-2">
                <div className="relative">
                  {/* Main bubble */}
                  <div
                    className="w-16 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.85), rgba(200,210,255,0.6))',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 16px rgba(100,120,220,0.25)',
                    }}
                  >
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    </div>
                  </div>
                  {/* Red arrow accent */}
                  <div
                    className="absolute -top-2 -right-3 w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #E30611, #FF4444)' }}
                  >
                    <MessageCircle size={16} color="white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </button>

            {/* Салоны экосистемы МТС */}
            <button
              className="rounded-3xl overflow-hidden flex flex-col justify-between p-4 min-h-[160px] text-left active:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(145deg, #dde4f8 0%, #ccd0f0 100%)' }}
            >
              <p className="font-sans font-black text-base text-[#2D2F7B] leading-snug">
                Салоны<br />экосистемы<br />МТС
              </p>
              {/* MTS cube illustration */}
              <div className="flex justify-center mt-1">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, #E30611, #C0000A)',
                    boxShadow: '0 6px 20px rgba(227,6,17,0.35)',
                    transform: 'perspective(60px) rotateY(-6deg) rotateX(4deg)',
                  }}
                >
                  <Logo size={36} />
                </div>
              </div>
            </button>

          </div>

          {/* Menu list */}
          <div className="flex flex-col gap-2 px-4">
            {MENU_ITEMS.map(({ icon: Icon, label, sub }) => (
              <button
                key={label}
                className="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-4 shadow-sm active:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-gray-500" strokeWidth={1.8} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-sans font-bold text-sm text-gray-900">{label}</p>
                  {sub && (
                    <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">{sub}</p>
                  )}
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </button>
            ))}
          </div>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
