export interface Movie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  genres?: Genre[]
  runtime?: number
  tagline?: string
  status?: string
  original_language?: string
  budget?: number
}

export interface TVShow {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  genres?: Genre[]
  number_of_seasons?: number
  number_of_episodes?: number
  tagline?: string
  status?: string
  original_language?: string
  budget?: number
}

export interface Genre {
  id: number
  name: string
}

export interface Person {
  id: number
  name: string
  character?: string
  profile_path: string | null
  known_for_department: string
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export interface Credits {
  cast: Person[]
  crew: Person[]
}

export interface TMDBResponse<T> {
  results: T[]
  page: number
  total_pages: number
  total_results: number
}

export interface WatchlistItem {
  id: number
  title: string
  poster_path: string | null
  media_type: 'movie' | 'tv'
  vote_average: number
  release_date: string
}

export type MediaItem = Movie | TVShow
