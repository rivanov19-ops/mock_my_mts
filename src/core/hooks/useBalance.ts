import { useAccountStore } from '../store/accountStore'

export function useBalance() {
  const { account, topUp } = useAccountStore()

  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(account.balance)

  return {
    balance: account.balance,
    formatted: `${formatted} ₽`,
    topUp,
  }
}
