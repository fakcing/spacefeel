import { create } from 'zustand'
import { YaniVideo } from '@/types/yani'

interface AniPlayerStore {
  isOpen: boolean
  videos: YaniVideo[]
  titleName: string
  currentDubbing: string
  currentEpisode: string
  openPlayer: (params: {
    videos: YaniVideo[]
    titleName: string
    startEpisode?: string
  }) => void
  closePlayer: () => void
  setDubbing: (dub: string) => void
  setEpisode: (ep: string) => void
}

export const useAniPlayerStore = create<AniPlayerStore>((set, get) => ({
  isOpen: false,
  videos: [],
  titleName: '',
  currentDubbing: '',
  currentEpisode: '1',

  openPlayer: ({ videos, titleName, startEpisode }) => {
    const dubbings = Array.from(new Set(videos.map((v) => v.data.dubbing)))
    const firstDub = dubbings[0] ?? ''
    const dubVideos = videos.filter((v) => v.data.dubbing === firstDub)
    const firstEp = startEpisode ?? dubVideos[0]?.number ?? '1'
    set({ isOpen: true, videos, titleName, currentDubbing: firstDub, currentEpisode: firstEp })
  },

  closePlayer: () => set({ isOpen: false }),

  setDubbing: (dub) => {
    const { videos } = get()
    const dubVideos = videos.filter((v) => v.data.dubbing === dub)
    const firstEp = dubVideos[0]?.number ?? '1'
    set({ currentDubbing: dub, currentEpisode: firstEp })
  },

  setEpisode: (ep) => set({ currentEpisode: ep }),
}))
