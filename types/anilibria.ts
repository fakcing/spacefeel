export interface AniLibriaTitle {
  id: number
  alias: string
  name: {
    main: string
    english: string
    alternative: string[]
  }
  year: number
  season: {
    value: string
    description: string
  }
  type: {
    value: string
    description: string
  }
  poster: {
    src: string
    preview: string | null
    thumbnail: string | null
    optimized: { src: string; preview: string; thumbnail: string } | null
  }
  genres: {
    id: number
    name: string
    description: string
  }[]
  episodes_total: number | null
  average_duration_of_episode: number | null
  age_rating: {
    value: string
    label: string
    is_adult: boolean
  }
  is_ongoing: boolean
  description: string
  added_in_users_favorites: number
  fresh_at: string
  created_at: string
  updated_at: string
  episodes?: AniEpisode[]
}

export interface AniEpisode {
  id: number
  ordinal: number
  name: string | null
  duration: number
  opening: { start: number; end: number } | null
  ending: { start: number; end: number } | null
  preview: { src: string; thumbnail: string } | null
  hls_480: string | null
  hls_720: string | null
  hls_1080: string | null
}
