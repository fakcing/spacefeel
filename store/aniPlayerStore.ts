import { create } from 'zustand'
import { YaniVideo } from '@/types/yani'
import { AnimeSource } from '@/lib/animeSources'

interface AniPlayerStore {
  isOpen: boolean
  videos: YaniVideo[]
  titleName: string
  sources: AnimeSource[]
  activeSource: string
  currentSeason: number
  currentDubbing: string
  currentEpisode: string
  openPlayer: (params: {
    videos: YaniVideo[]
    titleName: string
    shikimoriId: number
    startSeason?: number
    startEpisode?: string
  }) => void
  closePlayer: () => void
  setSources: (sources: AnimeSource[]) => void
  setActiveSource: (sourceId: string) => void
  setSeason: (season: number) => void
  setDubbing: (dub: string) => void
  setEpisode: (ep: string) => void
}

export const useAniPlayerStore = create<AniPlayerStore>((set, get) => ({
  isOpen: false,
  videos: [],
  titleName: '',
  sources: [],
  activeSource: 'yummy',
  currentSeason: 1,
  currentDubbing: '',
  currentEpisode: '1',

  openPlayer: ({ videos, titleName, shikimoriId, startSeason, startEpisode }) => {
    const dubbings = Array.from(new Set(videos.map((v) => v.data.dubbing)))
    const firstDub = dubbings[0] ?? ''
    const dubVideos = videos.filter((v) => v.data.dubbing === firstDub)
    const firstEp = startEpisode ?? dubVideos[0]?.number ?? '1'
    
    set({ 
      isOpen: true, 
      videos, 
      titleName, 
      currentSeason: startSeason || 1,
      currentDubbing: firstDub, 
      currentEpisode: firstEp,
      sources: [],
      activeSource: 'yummy',
    })

    // Fetch additional sources in background
    import('@/lib/animeSources').then(({ getAllAnimeSources }) => {
      getAllAnimeSources(shikimoriId, videos).then((sources) => {
        set({ sources })
      })
    })
  },

  closePlayer: () => set({ isOpen: false }),

  setSources: (sources) => set({ sources }),

  setActiveSource: (sourceId) => {
    const { sources } = get()
    const source = sources.find(s => s.id === sourceId)
    if (source && source.episodes.length > 0) {
      set({ 
        activeSource: sourceId,
        currentDubbing: source.translations[0] || '',
        currentEpisode: source.episodes[0]?.number || '1',
      })
    }
  },

  setSeason: (season) => {
    const { videos } = get()
    const seasonVideos = videos.filter((v) => (v.season ?? 1) === season)
    const dubbings = Array.from(new Set(seasonVideos.map((v) => v.data.dubbing)))
    const newDub = dubbings[0] ?? ''
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
