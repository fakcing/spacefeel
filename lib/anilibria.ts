import { cache } from 'react'
import { AniLibriaTitle } from '@/types/anilibria'

const BASE = 'https://api.anilibria.tv/v3'
const IMG_BASE = 'https://anilibria.tv'

async function aniFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    next: { revalidate: 1800 },
  })
  if (!res.ok) throw new Error(`AniLibria error: ${res.status}`)
  return res.json()
}

export const getPosterUrl = (path: string) => `${IMG_BASE}${path}`
export const getStreamUrl = (host: string, path: string) => `https://${host}${path}`

export const fetchAniUpdates = cache(async (limit = 20, page = 0) => {
  const data = await aniFetch<{ list: AniLibriaTitle[] }>(
    `/title/updates?limit=${limit}&page=${page}&filter=id,names,posters,season,type,genres,description,status,in_favorites`
  )
  return data.list
})

export const fetchAniPopular = cache(async (limit = 20, page = 0) => {
  const data = await aniFetch<{ list: AniLibriaTitle[] }>(
    `/title/list?limit=${limit}&page=${page}&order_by=in_favorites&sort_direction=1&filter=id,names,posters,season,type,genres,description,status,in_favorites`
  )
  return data.list
})

export const searchAnilibria = cache(async (query: string, limit = 10) => {
  const data = await aniFetch<{ list: AniLibriaTitle[] }>(
    `/title/search?search=${encodeURIComponent(query)}&limit=${limit}&filter=id,names,posters,season,type,genres,description,status`
  )
  return data.list
})

export const fetchAniTitle = cache(async (id: number) => {
  return aniFetch<AniLibriaTitle>(`/title?id=${id}`)
})

export const fetchAniSchedule = cache(async () => {
  const data = await aniFetch<{ day: number; list: AniLibriaTitle[] }[]>(
    `/title/schedule?filter=id,names,posters,player`
  )
  return data
})
