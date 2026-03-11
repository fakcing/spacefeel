import { cache } from 'react'
import { AniLibriaTitle } from '@/types/anilibria'

const BASE = 'https://anilibria.top/api/v1'
const IMG_BASE = 'https://anilibria.top'

async function aniFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    next: { revalidate: 1800 },
  })
  if (!res.ok) throw new Error(`AniLibria error: ${res.status}`)
  return res.json()
}

export const getPosterUrl = (path: string) => `${IMG_BASE}${path}`

interface CatalogResponse {
  data: AniLibriaTitle[]
  meta: {
    total: number
    count: number
    per_page: number
    current_page: number
  }
}

// Recent updates — sorted by updated_at
export const fetchAniUpdates = cache(async (limit = 20, page = 1) => {
  const data = await aniFetch<CatalogResponse>(
    `/anime/catalog/releases?limit=${limit}&page=${page}&order=updated_at&sort=desc`
  )
  return data.data
})

// Popular — sorted by favorites count
export const fetchAniPopular = cache(async (limit = 20, page = 1) => {
  const data = await aniFetch<CatalogResponse>(
    `/anime/catalog/releases?limit=${limit}&page=${page}&order=added_in_users_favorites&sort=desc`
  )
  return data.data
})

// Search by name
export const searchAnilibria = cache(async (query: string, limit = 10) => {
  const data = await aniFetch<CatalogResponse>(
    `/anime/catalog/releases?search=${encodeURIComponent(query)}&limit=${limit}`
  )
  return data.data
})

// Single title by alias (slug), includes episodes with HLS
export const fetchAniTitle = cache(async (alias: string) => {
  return aniFetch<AniLibriaTitle>(`/anime/releases/${alias}`)
})
