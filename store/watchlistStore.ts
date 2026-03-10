import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WatchlistItem } from '@/types/tmdb'

interface WatchlistStore {
  items: WatchlistItem[]
  addItem: (item: WatchlistItem) => void
  removeItem: (id: number) => void
  toggleItem: (item: WatchlistItem) => void
  isInWatchlist: (id: number) => boolean
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      toggleItem: (item) =>
        get().isInWatchlist(item.id) ? get().removeItem(item.id) : get().addItem(item),
      isInWatchlist: (id) => get().items.some((i) => i.id === id),
    }),
    { name: 'spacefeel-watchlist' }
  )
)
