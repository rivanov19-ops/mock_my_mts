import { create } from 'zustand'
import mock from '../data/mock'
import type { Service } from '../types'

interface ServicesState {
  services: Service[]
  toggle: (id: string) => void
}

export const useServicesStore = create<ServicesState>()((set) => ({
  services: mock.services,
  toggle: (id) =>
    set((s) => ({
      services: s.services.map((svc) =>
        svc.id === id ? { ...svc, enabled: !svc.enabled } : svc
      ),
    })),
}))
