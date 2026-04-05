import { cache } from 'react'
import { cookies } from 'next/headers'
import { Movie, TVShow, Credits, Video, TMDBResponse, PersonDetail, PersonCredits } from '@/types/tmdb'
import { getTmdbLanguage } from './tmdbLanguage'

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

export { IMG_BASE, getPoster, getBackdrop } from './tmdbImages'

/**
 * Advanced TMDB fetch with caching strategy
 * - Uses React cache() for request deduplication
 * - Next.js data cache with revalidation
 * - Cache tags for on-demand revalidation
 */
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value ?? 'en'
  const language = getTmdbLanguage(locale)

  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set('api_key', API_KEY || '')
  url.searchParams.set('language', language)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  
  const res = await fetch(url.toString(), { 
    next: { 
      revalidate: 600, // Revalidate every 10 minutes
      tags: ['tmdb', `tmdb-${locale}`, `tmdb-${endpoint.split('?')[0]}`]
    } 
  })
  
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

// Cached fetch functions with specific tags for on-demand revalidation
export const fetchTrending = cache(async (type: 'movie' | 'tv' | 'all' = 'all', page = 1): Promise<TMDBResponse<Movie | TVShow>> => {
  return tmdbFetch<TMDBResponse<Movie | TVShow>>(`/trending/${type}/week`, { page: String(page) })
})

export const fetchPopular = cache(async (type: 'movie' | 'tv', page = 1): Promise<TMDBResponse<Movie | TVShow>> => {
  return tmdbFetch<TMDBResponse<Movie | TVShow>>(`/${type}/popular`, { page: String(page) })
})

export const fetchTopRated = cache(async (type: 'movie' | 'tv', page = 1): Promise<TMDBResponse<Movie | TVShow>> => {
  return tmdbFetch<TMDBResponse<Movie | TVShow>>(`/${type}/top_rated`, { page: String(page) })
})

export const fetchUpcoming = cache(async (page = 1): Promise<TMDBResponse<Movie>> => {
  return tmdbFetch<TMDBResponse<Movie>>('/movie/upcoming', { page: String(page) })
})

export const fetchNowPlaying = cache(async (page = 1): Promise<TMDBResponse<Movie>> => {
  return tmdbFetch<TMDBResponse<Movie>>('/movie/now_playing', { page: String(page) })
})

export const fetchAiringToday = cache(async (page = 1): Promise<TMDBResponse<TVShow>> => {
  return tmdbFetch<TMDBResponse<TVShow>>('/tv/airing_today', { page: String(page) })
})

export const fetchOnTheAir = cache(async (page = 1): Promise<TMDBResponse<TVShow>> => {
  return tmdbFetch<TMDBResponse<TVShow>>('/tv/on_the_air', { page: String(page) })
})

export const fetchMovieDetail = cache(async (id: number): Promise<Movie> => {
  return tmdbFetch<Movie>(`/movie/${id}`)
})

export const fetchTVDetail = cache(async (id: number): Promise<TVShow> => {
  return tmdbFetch<TVShow>(`/tv/${id}`)
})

export const fetchCredits = cache(async (type: 'movie' | 'tv', id: number): Promise<Credits> => {
  return tmdbFetch<Credits>(`/${type}/${id}/credits`)
})

export const fetchVideos = cache(async (type: 'movie' | 'tv', id: number): Promise<{ results: Video[] }> => {
  return tmdbFetch<{ results: Video[] }>(`/${type}/${id}/videos`)
})

export const fetchSimilar = cache(async (type: 'movie' | 'tv', id: number): Promise<TMDBResponse<Movie | TVShow>> => {
  return tmdbFetch<TMDBResponse<Movie | TVShow>>(`/${type}/${id}/similar`)
})

export const fetchDiscover = cache(async (type: 'movie' | 'tv', params: Record<string, string> = {}): Promise<TMDBResponse<Movie | TVShow>> => {
  return tmdbFetch<TMDBResponse<Movie | TVShow>>(`/discover/${type}`, params)
})

export const fetchSearch = cache(async (query: string, page = 1): Promise<TMDBResponse<(Movie | TVShow) & { media_type?: string }>> => {
  return tmdbFetch<TMDBResponse<(Movie | TVShow) & { media_type?: string }>>('/search/multi', {
    query,
    page: String(page),
  })
})

export const fetchSearchMovies = cache(async (query: string, page = 1): Promise<TMDBResponse<Movie>> => {
  return tmdbFetch<TMDBResponse<Movie>>('/search/movie', {
    query,
    page: String(page),
  })
})

export const fetchSearchTV = cache(async (query: string, page = 1): Promise<TMDBResponse<TVShow>> => {
  return tmdbFetch<TMDBResponse<TVShow>>('/search/tv', {
    query,
    page: String(page),
  })
})

export const fetchCartoons = cache(async (category = 'trending', page = 1): Promise<TMDBResponse<TVShow>> => {
  const base: Record<string, string> = {
    with_genres: '16,10751',
    with_original_language: 'en',
    page: String(page),
  }
  switch (category) {
    case 'trending':
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'popularity.desc' })
    case 'popular':
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'popularity.desc' })
    case 'top_rated':
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'vote_average.desc', 'vote_count.gte': '100' })
    case 'family':
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'vote_average.desc' })
    case 'new':
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'first_air_date.desc' })
    case 'classics':
      return tmdbFetch('/discover/tv', { ...base, 'first_air_date.lte': '2000-01-01', sort_by: 'vote_average.desc' })
    default:
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'popularity.desc' })
  }
})

export const fetchPersonDetail = cache(async (id: number): Promise<PersonDetail> => {
  return tmdbFetch<PersonDetail>(`/person/${id}`)
})

export const fetchPersonCredits = cache(async (id: number): Promise<PersonCredits> => {
  return tmdbFetch<PersonCredits>(`/person/${id}/combined_credits`)
})

/**
 * Revalidate specific cache tags
 * Call this from API route or on-demand revalidation
 */
export async function revalidateTMDBData(endpoint?: string) {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('tmdb')
  if (endpoint) {
    revalidateTag(`tmdb-${endpoint}`)
  }
}

/**
 * Get external IDs (IMDB, TVDB, etc.) for a movie or TV show
 */
export async function getExternalIds(tmdbId: number, type: 'movie' | 'tv'): Promise<{
  imdb_id?: string | null
  tvdb_id?: number | null
  wikidata_id?: string | null
  facebook_id?: string | null
  instagram_id?: string | null
  twitter_id?: string | null
} | null> {
  try {
    const data = await tmdbFetch<{
      id: number
      imdb_id?: string | null
      tvdb_id?: number | null
      wikidata_id?: string | null
      facebook_id?: string | null
      instagram_id?: string | null
      twitter_id?: string | null
    }>(`/${type}/${tmdbId}/external_ids`)
    
    return data
  } catch (error) {
    console.error('Error fetching external IDs:', error)
    return null
  }
}

/**
 * Get IMDB ID specifically
 */
export async function getImdbId(tmdbId: number, type: 'movie' | 'tv'): Promise<string | null> {
  const externalIds = await getExternalIds(tmdbId, type)
  return externalIds?.imdb_id || null
}
