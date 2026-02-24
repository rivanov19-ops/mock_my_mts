import { create } from 'zustand'
import mock from '../data/mock'
import type { Account, User } from '../types'

interface AccountState {
  user: User
  account: Account
  topUp: (amount: number) => void
  setTariff: (tariff: string) => void
}

export const useAccountStore = create<AccountState>()((set) => ({
  user: mock.user,
  account: mock.account,
  topUp: (amount) =>
    set((s) => ({
      account: { ...s.account, balance: +(s.account.balance + amount).toFixed(2) },
    })),
  setTariff: (tariff) =>
    set((s) => ({ account: { ...s.account, tariff } })),
}))
