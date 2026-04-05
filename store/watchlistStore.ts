import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WatchlistItem } from '@/types/tmdb'

interface WatchlistStore {
  items: WatchlistItem[]
  addItem: (item: WatchlistItem, isLoggedIn?: boolean) => Promise<void>
  removeItem: (id: number, mediaType: string, isLoggedIn?: boolean) => Promise<void>
  toggleItem: (item: WatchlistItem, isLoggedIn?: boolean) => Promise<void>
  updateStatus: (id: number, mediaType: string, status: string, isLoggedIn?: boolean) => Promise<void>
  isInWatchlist: (id: number) => boolean
  getStatus: (id: number, mediaType: string) => string
  syncFromDB: () => Promise<void>
  clearItems: () => void
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      syncFromDB: async () => {
        const res = await fetch('/api/watchlist')
        if (!res.ok) return
        const data = await res.json()
        const mapped: WatchlistItem[] = data.map((d: {
          tmdbId: number
          mediaType: string
          posterPath: string | null
          voteAverage: number | null
          releaseDate: string | null
          status: string | null
        }) => ({
          id: d.tmdbId,
          media_type: d.mediaType as 'movie' | 'tv' | 'anime',
          poster_path: d.posterPath ?? null,
          vote_average: d.voteAverage ?? 0,
          release_date: d.releaseDate ?? '',
          status: d.status ?? 'planning',
        }))
        set({ items: mapped })
      },

      addItem: async (item, isLoggedIn = false) => {
        set((s) => ({ items: [...s.items, item] }))
        if (isLoggedIn) {
          await fetch('/api/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tmdbId: item.id,
              mediaType: item.media_type,
              posterPath: item.poster_path,
              voteAverage: item.vote_average,
              releaseDate: item.release_date,
            }),
          })
        }
      },

      removeItem: async (id, mediaType, isLoggedIn = false) => {
        set((s) => ({ items: s.items.filter((i) => !(i.id === id && i.media_type === mediaType)) }))
        if (isLoggedIn) {
          await fetch(`/api/watchlist/${id}:${mediaType}`, { method: 'DELETE' })
        }
      },

      toggleItem: async (item, isLoggedIn = false) => {
        if (get().isInWatchlist(item.id)) {
          await get().removeItem(item.id, item.media_type, isLoggedIn)
        } else {
          await get().addItem(item, isLoggedIn)
        }
      },

      updateStatus: async (id, mediaType, status, isLoggedIn = false) => {
        set(s => ({
          items: s.items.map(i =>
            i.id === id && i.media_type === mediaType ? { ...i, status } : i
          ),
        }))
        if (isLoggedIn) {
          await fetch('/api/watchlist/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tmdbId: id, mediaType, status }),
          })
        }
      },

      isInWatchlist: (id) => get().items.some((i) => i.id === id),

      getStatus: (id, mediaType) =>
        get().items.find(i => i.id === id && i.media_type === mediaType)?.status ?? 'planning',

      clearItems: () => set({ items: [] }),
    }),
    { name: 'spacefeel-watchlist' }
  )
)
