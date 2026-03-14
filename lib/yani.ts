import { cache } from 'react'
import { YaniAnime, YaniVideo } from '@/types/yani'

const BASE = 'https://api.yani.tv'

function getHeaders() {
  return { 'X-Application': process.env.YANI_TV_TOKEN! }
}

async function yaniFetch<T>(endpoint: string, revalidate = 600): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: getHeaders(),
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`YaniTV ${res.status}: ${endpoint}`)
  const data = await res.json()
  return data.response
}

export const getPosterUrl = (path: string): string =>
  path.startsWith('//') ? `https:${path}` : path

// Search by title
export const searchYani = cache(async (query: string, limit = 5): Promise<YaniAnime[]> => {
  const res = await fetch(
    `${BASE}/anime?q=${encodeURIComponent(query)}&limit=${limit}`,
    { headers: getHeaders(), next: { revalidate: 300 } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.response ?? []
})

// Catalog with pagination and optional filters (offset-based)
export const fetchYaniCatalog = cache(async (
  page = 1,
  limit = 20,
  year = '',
  type = '',
  sort = '',
  q = '',
  season = '',
  genre = '',
) => {
  const offset = (page - 1) * limit
  const params = new URLSearchParams({ limit: String(limit + 1), offset: String(offset) })
  if (year) params.set('year', year)
  if (type) params.set('type', type)
  if (sort) params.set('sort', sort)
  if (q) params.set('q', q)
  if (season) params.set('season', season)
  if (genre) params.set('genre', genre)
  const res = await fetch(
    `${BASE}/anime?${params.toString()}`,
    { headers: getHeaders(), next: { revalidate: 1800 } }
  )
  if (!res.ok) return { items: [] as YaniAnime[], hasMore: false }
  const data = await res.json()
  const all = (data.response ?? []) as YaniAnime[]
  return { items: all.slice(0, limit), hasMore: all.length > limit }
})


// Single anime by URL slug
export const fetchYaniTitle = cache(async (animeUrl: string): Promise<YaniAnime> => {
  return yaniFetch<YaniAnime>(`/anime/${animeUrl}`)
})

// All videos (episodes) for an anime — grouped by dubbing on the client
export const fetchYaniVideos = cache(async (animeId: number): Promise<YaniVideo[]> => {
  return yaniFetch<YaniVideo[]>(`/anime/${animeId}/videos`)
})
