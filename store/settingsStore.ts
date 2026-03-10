import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  language: string
  setLanguage: (language: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: 'English',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'spacefeel-settings' }
  )
)
