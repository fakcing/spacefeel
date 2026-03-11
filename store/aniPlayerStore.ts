import { create } from 'zustand'
import { AniEpisode } from '@/types/anilibria'

interface AniPlayerStore {
  isOpen: boolean
  episodes: AniEpisode[]
  titleName: string
  currentEpisode: number
  quality: 'hls_1080' | 'hls_720' | 'hls_480'
  openPlayer: (params: {
    episodes: AniEpisode[]
    titleName: string
    startEpisode?: number
  }) => void
  closePlayer: () => void
  setEpisode: (ep: number) => void
  setQuality: (q: 'hls_1080' | 'hls_720' | 'hls_480') => void
}

export const useAniPlayerStore = create<AniPlayerStore>((set) => ({
  isOpen: false,
  episodes: [],
  titleName: '',
  currentEpisode: 1,
  quality: 'hls_720',
  openPlayer: ({ episodes, titleName, startEpisode }) =>
    set({
      isOpen: true,
      episodes,
      titleName,
      currentEpisode: startEpisode ?? episodes[0]?.ordinal ?? 1,
    }),
  closePlayer: () => set({ isOpen: false }),
  setEpisode: (ep) => set({ currentEpisode: ep }),
  setQuality: (q) => set({ quality: q }),
}))
