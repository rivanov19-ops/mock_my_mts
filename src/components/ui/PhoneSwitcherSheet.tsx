import { Check, Crown, Smartphone, Wifi } from 'lucide-react'
import { BottomSheet } from './BottomSheet'

export interface PhoneAccount {
  id: string
  phone: string
  label: string
  tariff: string
  icon: 'crown' | 'sim' | 'virtual'
}

export const PHONE_ACCOUNTS: PhoneAccount[] = [
  { id: 'main',     phone: '+7 (916) 123-45-67', label: 'Основной номер', tariff: 'Smart Maxi',  icon: 'crown' },
  { id: 'second',   phone: '+7 (925) 880-21-04', label: 'Вторая SIM',     tariff: 'Smart Ultra',  icon: 'sim' },
  { id: 'virtual',  phone: '+7 (958) 014-77-32', label: 'Виртуальный номер', tariff: 'МТС Линия', icon: 'virtual' },
]

export const ACCOUNT_ICONS = { crown: Crown, sim: Smartphone, virtual: Wifi }
export const ACCOUNT_ICON_BG = {
  crown:   'linear-gradient(135deg, #4A90D9, #7B68EE)',
  sim:     'linear-gradient(135deg, #E91E8C, #FF6B35)',
  virtual: 'linear-gradient(135deg, #34C759, #30B0C7)',
}

interface PhoneSwitcherSheetProps {
  open: boolean
  selectedId: string
  onClose: () => void
  onSelect: (account: PhoneAccount) => void
}

export function PhoneSwitcherSheet({ open, selectedId, onClose, onSelect }: PhoneSwitcherSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-2">
        <h2 className="font-sans font-bold text-lg text-gray-900 mb-4">Выберите номер</h2>

        <div className="flex flex-col gap-2">
          {PHONE_ACCOUNTS.map((acc) => {
            const Icon = ACCOUNT_ICONS[acc.icon]
            const isSelected = acc.id === selectedId
            return (
              <button
                key={acc.id}
                onClick={() => onSelect(acc)}
                className={`w-full rounded-2xl px-4 py-3 flex items-center gap-3 transition-colors
                  ${isSelected ? 'bg-blue-50' : 'bg-gray-50 active:bg-gray-100'}`}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: ACCOUNT_ICON_BG[acc.icon] }}
                >
                  <Icon size={20} color="white" strokeWidth={2} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-sans font-bold text-sm text-gray-900 truncate">{acc.phone}</p>
                  <p className="font-compact font-normal text-xs text-gray-500 truncate">
                    {acc.label} · {acc.tariff}
                  </p>
                </div>
                {isSelected && (
                  <Check size={20} className="text-blue-500 shrink-0" strokeWidth={2.5} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </BottomSheet>
  )
}
