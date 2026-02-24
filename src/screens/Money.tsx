import { QrCode, ArrowLeftRight, Globe, Smartphone, Plus, ChevronRight, TrendingUp, RefreshCw, Wallet, Zap } from 'lucide-react'
import { BottomNav } from '../components/layout/BottomNav'
import mock from '../core/data/mock'

const QUICK_ACTIONS = [
  { icon: QrCode,          label: 'Оплата по\nQR-коду' },
  { icon: ArrowLeftRight,  label: 'Переводы\nпо России' },
  { icon: Globe,           label: 'Переводы\nза рубеж' },
  { icon: Smartphone,      label: 'Оплата\nсотовой связи' },
]

export default function Money() {
  return (
    <div className="min-h-screen bg-mts-surface flex justify-center">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* ── Top bar ── */}
        <div className="px-4 pt-12 pb-5 bg-mts-surface flex items-start justify-between">
          <div>
            <h1 className="font-sans font-black text-2xl text-gray-900 leading-tight">Деньги</h1>
            <p className="font-compact font-normal text-sm text-gray-400">{mock.user.name}</p>
          </div>
          <button
            className="h-9 px-3 rounded-full flex items-center gap-1.5 mt-1 shrink-0"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #E91E8C)' }}
          >
            <span className="text-white font-sans font-bold text-xs">✦</span>
            <span className="text-white font-sans font-bold text-xs uppercase tracking-wide">CASHBACK</span>
          </button>
        </div>

        {/* ── Scrollable ── */}
        <div className="flex-1 overflow-y-auto pb-24 flex flex-col gap-4">

          {/* Quick actions */}
          <div className="mx-4 bg-white rounded-2xl px-4 py-5 shadow-sm">
            <div className="grid grid-cols-4 gap-2">
              {QUICK_ACTIONS.map(({ icon: Icon, label }) => (
                <button key={label} className="flex flex-col items-center gap-2 active:opacity-70 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon size={22} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                  <span className="font-compact font-normal text-[11px] text-gray-500 text-center leading-snug whitespace-pre-line">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Карты */}
          <div className="mx-4 bg-white rounded-2xl px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans font-black text-xl text-gray-900">Карты</h2>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors">
                <Plus size={18} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>
            {/* Add card promo */}
            <button className="w-full flex items-center gap-4 active:opacity-70 transition-opacity">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
                <Plus size={22} className="text-gray-400" strokeWidth={1.8} />
              </div>
              <div className="text-left">
                <p className="font-sans font-bold text-sm text-gray-900">Вернём 790 ₽ за связь</p>
                <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">
                  Оформите виртуальную карту МТС Деньги
                </p>
              </div>
            </button>
          </div>

          {/* Кешбэк и бонусы */}
          <div className="mx-4 bg-white rounded-2xl px-4 py-4 shadow-sm">
            <button className="w-full flex items-center gap-4 active:opacity-70 transition-opacity">
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 relative"
                style={{ background: 'linear-gradient(135deg, #7B52D3, #4A3AB5)' }}
              >
                <Wallet size={26} color="white" strokeWidth={1.5} />
                {/* Hearts accent */}
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-[9px]">♥</span>
                </div>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-1.5">
                  <p className="font-sans font-bold text-sm text-gray-900">Кешбэк и бонусы</p>
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                </div>
                <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">Совершайте покупки</p>
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </button>
          </div>

          {/* МТС Накопления */}
          <div className="mx-4 bg-white rounded-2xl px-4 py-4 shadow-sm">
            <h2 className="font-sans font-black text-xl text-gray-900 mb-4">МТС Накопления</h2>
            <button className="w-full flex items-center gap-4 active:opacity-70 transition-opacity">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #8B7ED8, #6A5CC8)' }}
              >
                <TrendingUp size={26} color="white" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-sans font-bold text-sm text-gray-900">Получайте доход каждый день</p>
                <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">
                  Ставка 17,5% и бесплатное обслуживание
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </button>
          </div>

          {/* Автоплатежи */}
          <div className="mx-4 bg-white rounded-2xl px-4 py-4 shadow-sm">
            <h2 className="font-sans font-black text-xl text-gray-900 mb-4">Автоплатежи</h2>
            <button className="w-full flex items-center gap-4 active:opacity-70 transition-opacity">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <RefreshCw size={24} className="text-blue-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-sans font-bold text-sm text-gray-900">Подключите автоплатёж</p>
                <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">
                  Никогда не забывайте пополнять счёт
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </button>
          </div>

          {/* История платежей */}
          <div className="mx-4 bg-white rounded-2xl px-4 py-4 shadow-sm">
            <h2 className="font-sans font-black text-xl text-gray-900 mb-4">История платежей</h2>
            <button className="w-full flex items-center gap-4 active:opacity-70 transition-opacity">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                <Zap size={24} className="text-green-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-sans font-bold text-sm text-gray-900">Последние операции</p>
                <p className="font-compact font-normal text-xs text-gray-400 mt-0.5">
                  Все ваши платежи и переводы
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </button>
          </div>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
