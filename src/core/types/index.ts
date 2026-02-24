export interface User {
  name: string
  phone: string
}

export interface Usage {
  used: number
  total: number
}

export interface Account {
  balance: number
  tariff: string
  minutes: Usage
  sms: { unlimited: boolean }
  data_gb: Usage
}

export interface Tariff {
  id: string
  name: string
  price: number
  minutes: number | '∞'
  gb: number
  sms: number | '∞'
}

export type ServiceCategory = 'security' | 'entertainment' | 'communication'

export interface Service {
  id: string
  name: string
  description: string
  category: ServiceCategory
  pricePerMonth: number
  enabled: boolean
}

export type TransactionType = 'topup' | 'charge'

export interface Transaction {
  id: string
  date: string        // ISO date string YYYY-MM-DD
  description: string
  amount: number      // positive = top-up, negative = charge
  type: TransactionType
}

export interface FamilyMember {
  id: string
  name: string
  phone: string
  tariff: string
  balance: number
}

export type NotificationType = 'payment' | 'security' | 'promo'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  timestamp: string  // ISO datetime string
  read: boolean
}

export interface MockData {
  user: User
  account: Account
  tariffs: Tariff[]
  services: Service[]
  transactions: Transaction[]
  family: FamilyMember[]
  notifications: Notification[]
}
