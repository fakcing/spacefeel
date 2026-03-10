import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  language: string
  setLanguage: (language: string) => void
  isLoggedIn: boolean
  setIsLoggedIn: (v: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
      isLoggedIn: false,
      setIsLoggedIn: (v) => set({ isLoggedIn: v }),
    }),
    { name: 'spacefeel-settings' }
  )
)
