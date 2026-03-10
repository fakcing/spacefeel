import { cache } from 'react'
import { cookies } from 'next/headers'
import { Movie, TVShow, Credits, Video, TMDBResponse } from '@/types/tmdb'
import { getTmdbLanguage } from './tmdbLanguage'

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

export { IMG_BASE, getPoster, getBackdrop } from './tmdbImages'

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value ?? 'en'
  const language = getTmdbLanguage(locale)

  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set('api_key', API_KEY || '')
  url.searchParams.set('language', language)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { next: { revalidate: 3600, tags: [`tmdb-${locale}`] } })
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

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
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value ?? 'en'

  const data = await tmdbFetch<Movie>(`/movie/${id}`)

  if ((!data.overview || data.overview.trim() === '') && locale !== 'en') {
    const fallback = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`
    ).then(r => r.json())
    return {
      ...data,
      overview: fallback.overview || data.overview,
      title: data.title || fallback.title,
    }
  }

  return data
})

export const fetchTVDetail = cache(async (id: number): Promise<TVShow> => {
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value ?? 'en'

  const data = await tmdbFetch<TVShow>(`/tv/${id}`)

  if ((!data.overview || data.overview.trim() === '') && locale !== 'en') {
    const fallback = await fetch(
      `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=en-US`
    ).then(r => r.json())
    return {
      ...data,
      overview: fallback.overview || data.overview,
      name: data.name || fallback.name,
    }
  }

  return data
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

// Anime: always enforces animation genre + anime keyword
export const fetchAnime = cache(async (category = 'trending', page = 1): Promise<TMDBResponse<TVShow>> => {
  const base: Record<string, string> = {
    with_genres: '16',
    with_keywords: '210024',
    page: String(page),
  }
  switch (category) {
    case 'trending':
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'popularity.desc' })
    case 'popular':
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'popularity.desc' })
    case 'top_rated':
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'vote_average.desc', 'vote_count.gte': '200' })
    case 'upcoming':
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'first_air_date.desc' })
    case 'airing':
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'popularity.desc', status: '0' })
    case 'discover':
    default:
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'popularity.desc' })
  }
})

// Cartoons: always enforces animation + family genre + English origin
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
    case 'discover':
    default:
      return tmdbFetch('/discover/tv', { ...base, sort_by: 'popularity.desc' })
  }
})
