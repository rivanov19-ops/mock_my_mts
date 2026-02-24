import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, ShieldCheck, Phone, Wallet, Headphones, ChevronRight, User, MoreHorizontal, Plus } from 'lucide-react'
import { Logo } from '../components/ui/Logo'
import { BottomSheet } from '../components/ui/BottomSheet'
import { AddAccountSheet } from '../components/ui/AddAccountSheet'

const SIM_ACTIONS = [
  { icon: CreditCard,  label: 'Заменить\nSIM-карту' },
  { icon: ShieldCheck, label: 'Активация\nSIM-карты' },
  { icon: Phone,       label: 'Стать\nабонентом' },
]

const USEFUL_LINKS = [
  { icon: Wallet,     label: 'Платежи и переводы' },
  { icon: Headphones, label: 'Справка и контакты' },
]

// Mock saved account
const SAVED_ACCOUNT = {
  name: 'Загадочный Пришелец',
  phone: '+7 999 812-77-94',
}

export default function Login() {
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [addAccountOpen, setAddAccountOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-app flex flex-col min-h-screen">

        {/* ── White top section ── */}
        <div className="px-5 pt-12 pb-8 bg-white">

          <Logo size={64} className="mb-5" />

          {/* Headline — MTS Wide Black */}
          <h1 className="font-sans font-black text-[2rem] uppercase leading-[1.15] tracking-tight text-gray-900 mb-3">
            Цифровая<br />экосистема
          </h1>

          {/* Subtitle — MTS Wide Medium */}
          <p className="font-sans font-medium text-sm text-gray-900 mb-6">
            Вход для абонентов МТС и других операторов
          </p>

          {/* ВОЙТИ — opens account sheet */}
          <button
            onClick={() => setSheetOpen(true)}
            className="w-full bg-mts-red text-white font-sans font-bold text-base
              uppercase tracking-widest rounded-full py-4 mb-4
              hover:bg-mts-red-dark active:bg-mts-red-dark transition-colors"
          >
            Войти
          </button>

          {/* Terms — MTS Compact Regular */}
          <p className="font-compact font-normal text-xs text-gray-500 leading-snug">
            При входе вы принимаете{' '}
            <span className="text-blue-500 cursor-pointer">условия</span>
            {' '}и{' '}
            <span className="text-blue-500 cursor-pointer">политику использования</span>
            {' '}сервиса
          </p>
        </div>

        {/* ── Grey bottom section ── */}
        <div className="flex-1 bg-mts-surface rounded-t-[28px] px-5 pt-7 pb-10 flex flex-col gap-7">

          {/* SIM action cards — MTS Compact Regular */}
          <div className="grid grid-cols-3 gap-3">
            {SIM_ACTIONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3
                  shadow-sm active:scale-95 transition-transform text-center"
              >
                <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center">
                  <Icon size={20} color="white" strokeWidth={2} />
                </div>
                <span className="font-compact font-normal text-xs text-gray-800 whitespace-pre-line leading-snug">
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Может быть полезно */}
          <div>
            <h2 className="font-sans font-bold text-xl text-gray-900 mb-3">
              Может быть полезно
            </h2>
            <div className="flex flex-col gap-2">
              {USEFUL_LINKS.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-4
                    shadow-sm active:scale-[0.99] transition-transform w-full text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-mts-muted" strokeWidth={1.5} />
                  </div>
                  <span className="font-compact font-medium text-sm text-gray-900 flex-1">
                    {label}
                  </span>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Version — MTS Compact Regular */}
          <p className="font-compact font-normal text-sm text-blue-500 text-center mt-auto pt-2">
            Ваша версия: 6.60.0
          </p>
        </div>
      </div>

      {/* ── Account picker bottom sheet ── */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="px-5 pt-3 pb-2">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-sans font-bold text-xl text-gray-900">
              Выберите аккаунт
            </h2>
            <div className="flex items-center gap-1.5">
              <Logo size={32} />
              <span className="font-sans font-black text-lg text-gray-900">ID</span>
            </div>
          </div>

          {/* Saved account row */}
          <button
            onClick={() => { setSheetOpen(false); navigate('/dashboard', { state: { phone: SAVED_ACCOUNT.phone } }) }}
            className="w-full flex items-center gap-3 py-3 active:bg-gray-50 rounded-xl -mx-2 px-2 transition-colors"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <User size={26} className="text-gray-400" strokeWidth={1.5} />
            </div>

            {/* Name + phone */}
            <div className="flex-1 text-left">
              <p className="font-compact font-semibold text-sm text-gray-900 leading-tight">
                {SAVED_ACCOUNT.name}
              </p>
              <p className="font-compact font-normal text-sm text-mts-muted leading-tight mt-0.5">
                {SAVED_ACCOUNT.phone}
              </p>
            </div>

            {/* Three dots */}
            <MoreHorizontal size={20} className="text-gray-400 shrink-0" />
          </button>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2" />

          {/* Add account row */}
          <button
            onClick={() => { setSheetOpen(false); setAddAccountOpen(true) }}
            className="w-full flex items-center gap-3 py-3 active:bg-gray-50 rounded-xl -mx-2 px-2 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Plus size={22} className="text-blue-500" strokeWidth={2} />
            </div>
            <span className="font-compact font-medium text-sm text-blue-500">
              Добавить аккаунт
            </span>
          </button>

        </div>
      </BottomSheet>

      {/* ── Add account sheet ── */}
      <AddAccountSheet open={addAccountOpen} onClose={() => setAddAccountOpen(false)} />
    </div>
  )
}
