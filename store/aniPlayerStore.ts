import { create } from 'zustand'
import { AniEpisode } from '@/types/anilibria'

interface AniPlayerStore {
  isOpen: boolean
  episodes: AniEpisode[]
  host: string
  titleName: string
  currentEpisode: number
  quality: 'fhd' | 'hd' | 'sd'
  openPlayer: (params: {
    episodes: AniEpisode[]
    host: string
    titleName: string
    startEpisode?: number
  }) => void
  closePlayer: () => void
  setEpisode: (ep: number) => void
  setQuality: (q: 'fhd' | 'hd' | 'sd') => void
}

export const useAniPlayerStore = create<AniPlayerStore>((set) => ({
  isOpen: false,
  episodes: [],
  host: '',
  titleName: '',
  currentEpisode: 1,
  quality: 'hd',
  openPlayer: ({ episodes, host, titleName, startEpisode }) =>
    set({
      isOpen: true,
      episodes,
      host,
      titleName,
      currentEpisode: startEpisode ?? episodes[0]?.serie ?? 1,
    }),
  closePlayer: () => set({ isOpen: false }),
  setEpisode: (ep) => set({ currentEpisode: ep }),
  setQuality: (q) => set({ quality: q }),
}))
