// Anime Player Types

export type AnimeServer = 'yummy' | 'libria' | 'vost'

export interface AnimeTranslation {
  id: number
  name: string
  type: 'sub' | 'dub'
  language?: string
}

export interface AnimeEpisode {
  episode: number
  title?: string
  url?: string
  hlsUrl?: string
  quality?: 'SD' | 'HD'
}

export interface AnimeServerData {
  server: AnimeServer
  name: string
  iframe?: string
  hlsUrl?: string
  translations: AnimeTranslation[]
  episodes: AnimeEpisode[]
  available: boolean
}

export interface AnimePlayerState {
  activeServer: AnimeServer
  activeTranslation: number | null
  activeEpisode: number
  isPlaying: boolean
  isLoading: boolean
  error: string | null
}

export interface HLSConfig {
  autoStartLoad?: boolean
  startPosition?: number
  debug?: boolean
}
