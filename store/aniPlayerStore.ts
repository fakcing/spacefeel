import { create } from 'zustand'
import { YaniVideo } from '@/types/yani'

interface AniPlayerStore {
  isOpen: boolean
  videos: YaniVideo[]
  titleName: string
  currentSeason: number
  currentDubbing: string
  currentEpisode: string
  openPlayer: (params: {
    videos: YaniVideo[]
    titleName: string
    startSeason?: number
    startEpisode?: string
  }) => void
  closePlayer: () => void
  setSeason: (season: number) => void
  setDubbing: (dub: string) => void
  setEpisode: (ep: string) => void
}

export const useAniPlayerStore = create<AniPlayerStore>((set, get) => ({
  isOpen: false,
  videos: [],
  titleName: '',
  currentSeason: 1,
  currentDubbing: '',
  currentEpisode: '1',

  openPlayer: ({ videos, titleName, startSeason, startEpisode }) => {
    const seasons = Array.from(new Set(videos.map((v) => v.season ?? 1))).sort((a, b) => a - b)
    const firstSeason = startSeason ?? seasons[0] ?? 1
    const seasonVideos = videos.filter((v) => (v.season ?? 1) === firstSeason)
    const dubbings = Array.from(new Set(seasonVideos.map((v) => v.data.dubbing)))
    const firstDub = dubbings[0] ?? ''
    const dubVideos = seasonVideos.filter((v) => v.data.dubbing === firstDub)
    const firstEp = startEpisode ?? dubVideos[0]?.number ?? '1'
    set({ isOpen: true, videos, titleName, currentSeason: firstSeason, currentDubbing: firstDub, currentEpisode: firstEp })
  },

  closePlayer: () => set({ isOpen: false }),

  setSeason: (season) => {
    const { videos, currentDubbing } = get()
    const seasonVideos = videos.filter((v) => (v.season ?? 1) === season)
    const dubbings = Array.from(new Set(seasonVideos.map((v) => v.data.dubbing)))
    const newDub = dubbings.includes(currentDubbing) ? currentDubbing : dubbings[0] ?? ''
    const dubVideos = seasonVideos.filter((v) => v.data.dubbing === newDub)
    const firstEp = dubVideos[0]?.number ?? '1'
    set({ currentSeason: season, currentDubbing: newDub, currentEpisode: firstEp })
  },

  setDubbing: (dub) => {
    const { videos, currentSeason } = get()
    const seasonVideos = videos.filter((v) => (v.season ?? 1) === currentSeason)
    const dubVideos = seasonVideos.filter((v) => v.data.dubbing === dub)
    const firstEp = dubVideos[0]?.number ?? '1'
    set({ currentDubbing: dub, currentEpisode: firstEp })
  },

  setEpisode: (ep) => set({ currentEpisode: ep }),
}))
