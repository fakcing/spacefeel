import { create } from 'zustand'
import { YaniVideo } from '@/types/yani'
import { AnimeSource } from '@/lib/animeSources'

interface AniPlayerStore {
  isOpen: boolean
  videos: YaniVideo[]
  titleName: string
  sources: AnimeSource[]
  sourcesLoading: boolean
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

function getYummyFirstEpisode(videos: YaniVideo[], season: number, dubbing?: string): { dub: string; ep: string } {
  const seasonVideos = videos.filter(v => (v.season ?? 1) === season)
  const dubbings = Array.from(new Set(seasonVideos.map(v => v.data.dubbing)))
  const dub = dubbing && dubbings.includes(dubbing) ? dubbing : (dubbings[0] ?? '')
  const dubVideos = seasonVideos
    .filter(v => v.data.dubbing === dub)
    .sort((a, b) => Number(a.number) - Number(b.number))
  return { dub, ep: dubVideos[0]?.number ?? '1' }
}

export const useAniPlayerStore = create<AniPlayerStore>((set, get) => ({
  isOpen: false,
  videos: [],
  titleName: '',
  sources: [],
  sourcesLoading: false,
  activeSource: 'yummy',
  currentSeason: 1,
  currentDubbing: '',
  currentEpisode: '1',

  openPlayer: ({ videos, titleName, shikimoriId, startSeason, startEpisode }) => {
    const season = startSeason ?? 1
    const { dub, ep } = getYummyFirstEpisode(videos, season)

    set({
      isOpen: true,
      videos,
      titleName,
      currentSeason: season,
      currentDubbing: dub,
      currentEpisode: startEpisode ?? ep,
      sources: [],
      sourcesLoading: true,
      activeSource: 'yummy',
    })

    import('@/lib/animeSources').then(({ getAllAnimeSources }) => {
      getAllAnimeSources(shikimoriId, videos)
        .then(sources => set({ sources, sourcesLoading: false }))
        .catch(() => set({ sourcesLoading: false }))
    })
  },

  closePlayer: () => set({ isOpen: false }),

  setSources: (sources) => set({ sources }),

  setActiveSource: (sourceId) => {
    const { sources, videos, currentSeason } = get()

    if (sourceId === 'yummy') {
      // Reset to first available episode in current dubbing
      const { dub, ep } = getYummyFirstEpisode(videos, currentSeason)
      set({ activeSource: 'yummy', currentDubbing: dub, currentEpisode: ep })
      return
    }

    const source = sources.find(s => s.id === sourceId)
    if (source && source.episodes.length > 0) {
      set({
        activeSource: sourceId,
        currentDubbing: source.translations[0] ?? '',
        currentEpisode: source.episodes[0]?.number ?? '1',
      })
    }
  },

  setSeason: (season) => {
    const { videos } = get()
    const { dub, ep } = getYummyFirstEpisode(videos, season)
    set({ currentSeason: season, currentDubbing: dub, currentEpisode: ep })
  },

  setDubbing: (dub) => {
    const { videos, currentSeason } = get()
    const seasonVideos = videos.filter(v => (v.season ?? 1) === currentSeason)
    const dubVideos = seasonVideos
      .filter(v => v.data.dubbing === dub)
      .sort((a, b) => Number(a.number) - Number(b.number))
    set({ currentDubbing: dub, currentEpisode: dubVideos[0]?.number ?? '1' })
  },

  setEpisode: (ep) => set({ currentEpisode: ep }),
}))
