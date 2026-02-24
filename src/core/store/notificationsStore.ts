import { create } from 'zustand'
import mock from '../data/mock'
import type { Notification } from '../types'

interface NotificationsState {
  notifications: Notification[]
  markRead: (id: string) => void
  markAllRead: () => void
  unreadCount: () => number
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  notifications: mock.notifications,
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}))
