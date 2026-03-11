import { create } from 'zustand'
import { Movie, TVShow } from '@/types/tmdb'

interface MediaPlayerStore {
  isOpen: boolean
  mediaType: 'movie' | 'tv' | 'anime' | 'cartoon'
  item: Movie | TVShow | null
  tmdbId: number | null
  shikimoriId: number | null
  season: number
  episode: number
  openPlayer: (params: {
    mediaType: 'movie' | 'tv' | 'anime' | 'cartoon'
    item?: Movie | TVShow | null
    tmdbId?: number
    shikimoriId?: number
    season?: number
    episode?: number
  }) => void
  closePlayer: () => void
  setSeason: (season: number) => void
  setEpisode: (episode: number) => void
}

export const useMediaPlayerStore = create<MediaPlayerStore>((set) => ({
  isOpen: false,
  mediaType: 'movie',
  item: null,
  tmdbId: null,
  shikimoriId: null,
  season: 1,
  episode: 1,

  openPlayer: ({ mediaType, item, tmdbId, shikimoriId, season, episode }) => {
    set({
      isOpen: true,
      mediaType,
      item: item || null,
      tmdbId: tmdbId || (item ? (item as Movie | TVShow).id : undefined) || null,
      shikimoriId: shikimoriId || null,
      season: season || 1,
      episode: episode || 1,
    })
  },

  closePlayer: () => set({ isOpen: false }),

  setSeason: (season) => set({ season }),

  setEpisode: (episode) => set({ episode }),
}))
