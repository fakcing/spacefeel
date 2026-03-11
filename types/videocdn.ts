export interface VideoCDNTranslation {
  id: number
  title: string
  language: string
  type: 'sub' | 'dub'
}

export interface VideoCDNQuality {
  quality: string
  url: string
}

export interface VideoCDNMovieResponse {
  success: boolean
  data: {
    id: number
    title: string
    year: number
    poster: string
    translations: VideoCDNTranslation[]
    qualities: VideoCDNQuality[]
  }
}

export interface VideoCDNSeriesResponse {
  success: boolean
  data: {
    id: number
    title: string
    year: number
    poster: string
    translations: VideoCDNTranslation[]
    seasons: {
      season: number
      episodes: {
        episode: number
        title: string
        qualities: VideoCDNQuality[]
      }[]
    }[]
  }
}

export interface VideoCDNAnimeResponse {
  success: boolean
  data: {
    id: number
    title: string
    shikimori_id: number
    poster: string
    translations: VideoCDNTranslation[]
    episodes: {
      episode: number
      title: string
      qualities: VideoCDNQuality[]
    }[]
  }
}
