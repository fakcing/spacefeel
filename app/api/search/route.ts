import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getTmdbLanguage } from '@/lib/tmdbLanguage'

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const YANI_BASE = 'https://api.yani.tv'

type TmdbItem = { genre_ids?: number[]; popularity?: number; poster_path?: string | null }

async function tmdbSearch(endpoint: string, q: string, page: number, language: string) {
  const url = `https://api.themoviedb.org/3/search/${endpoint}?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&page=${page}&language=${language}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) return { results: [], total_pages: 1 }
  return res.json()
}

function sortByPopularity(items: TmdbItem[]) {
  return items.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
}

function filterAndSort(items: TmdbItem[]) {
  return sortByPopularity(items.filter(m => !(m.genre_ids ?? []).includes(16)))
}

async function yaniSearch(q: string, limit: number) {
  const res = await fetch(
    `${YANI_BASE}/anime?q=${encodeURIComponent(q)}&limit=${limit}`,
    { headers: { 'X-Application': process.env.YANI_TV_TOKEN! }, next: { revalidate: 300 } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.response ?? []
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = (searchParams.get('q') || '').trim()
  const type = searchParams.get('type') || 'all'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)

  const cookieStore = cookies()
  const locale = searchParams.get('locale') || cookieStore.get('locale')?.value || 'en'
  const language = getTmdbLanguage(locale)

  if (q.length < 2) {
    return NextResponse.json({ movies: [], tvShows: [], anime: [], moviePages: 1, tvPages: 1 })
  }

  if (type === 'all') {
    const [movieRes, tvRes, anime] = await Promise.all([
      tmdbSearch('movie', q, 1, language).catch(() => ({ results: [], total_pages: 1 })),
      tmdbSearch('tv', q, 1, language).catch(() => ({ results: [], total_pages: 1 })),
      yaniSearch(q, 8).catch(() => []),
    ])
    return NextResponse.json({
      movies: filterAndSort(movieRes.results ?? []).slice(0, 6),
      tvShows: filterAndSort(tvRes.results ?? []).slice(0, 6),
      anime,
      moviePages: 1,
      tvPages: 1,
    })
  }

  if (type === 'movie') {
    const movieRes = await tmdbSearch('movie', q, page, language).catch(() => ({ results: [], total_pages: 1 }))
    return NextResponse.json({
      movies: filterAndSort(movieRes.results ?? []),
      tvShows: [],
      anime: [],
      moviePages: movieRes.total_pages ?? 1,
      tvPages: 1,
    })
  }

  if (type === 'tv') {
    const tvRes = await tmdbSearch('tv', q, page, language).catch(() => ({ results: [], total_pages: 1 }))
    return NextResponse.json({
      movies: [],
      tvShows: filterAndSort(tvRes.results ?? []),
      anime: [],
      moviePages: 1,
      tvPages: tvRes.total_pages ?? 1,
    })
  }

  if (type === 'anime') {
    const anime = await yaniSearch(q, 40).catch(() => [])
    return NextResponse.json({ movies: [], tvShows: [], anime, moviePages: 1, tvPages: 1 })
  }

  return NextResponse.json({ movies: [], tvShows: [], anime: [], moviePages: 1, tvPages: 1 })
}
