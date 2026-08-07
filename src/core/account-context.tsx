import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { PHONE_ACCOUNTS, type PhoneAccount } from '../components/ui/PhoneSwitcherSheet'

interface AccountContextValue {
  account: PhoneAccount
  isMain: boolean
  /** true when the current non-main number is authorized for the Calls section */
  callsConfirmed: boolean
  selectAccount: (account: PhoneAccount) => void
  confirmCalls: () => void
}

const AccountContext = createContext<AccountContextValue | null>(null)

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<PhoneAccount>(PHONE_ACCOUNTS[0])
  const [callsConfirmed, setCallsConfirmed] = useState(false)
  const [toastPhone, setToastPhone] = useState<string | null>(null)

  function selectAccount(next: PhoneAccount) {
    setAccount(next)
    // switching number invalidates previous Calls authorization
    setCallsConfirmed(false)
    // show a global "logged in as …" toast
    setToastPhone(next.phone)
  }

  useEffect(() => {
    if (!toastPhone) return
    const id = setTimeout(() => setToastPhone(null), 3000)
    return () => clearTimeout(id)
  }, [toastPhone])

  const isMain = account.id === 'main'

  return (
    <AccountContext.Provider
      value={{
        account,
        isMain,
        // the main number never needs confirmation
        callsConfirmed: isMain || callsConfirmed,
        selectAccount,
        confirmCalls: () => setCallsConfirmed(true),
      }}
    >
      {children}

      {/* Global account-switch toast */}
      <AnimatePresence>
        {toastPhone && (
          <div className="fixed bottom-[76px] left-0 right-0 z-[60] flex justify-center px-6 pointer-events-none">
            <motion.div
              className="bg-[#1C1C1E] text-white rounded-full px-5 py-3 flex items-center gap-3 shadow-xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
            >
              <CheckCircle size={18} className="text-green-400 shrink-0" strokeWidth={2.5} />
              <span className="font-compact font-medium text-sm whitespace-nowrap">
                Вы вошли под аккаунтом {toastPhone}
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount must be used within AccountProvider')
  return ctx
}
