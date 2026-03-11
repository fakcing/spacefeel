/**
 * AnimeVost API Service
 * 
 * Based on: https://github.com/Semolik/AnimeVostPlayer
 * API: https://api.animevost.org
 */

import { AnimeEpisode, AnimeSource } from '@/lib/animeSources'

const ANIMEVOST_BASE = 'https://api.animevost.org'

export interface AnimeVostAnime {
  id: number
  title: string
  altTitle: string
  description: string
  poster: string
  shikimori_id?: number
  episodes: AnimeVostEpisode[]
}

export interface AnimeVostEpisode {
  episode: number
  title: string
  url: string
  sdUrl?: string
  hdUrl?: string
}

/**
 * Get anime list
 */
export async function getAnimeList(): Promise<AnimeVostAnime[]> {
  try {
    const response = await fetch(`${ANIMEVOST_BASE}/anime/list`)
    
    if (!response.ok) {
      return []
    }

    return await response.json() as AnimeVostAnime[]
  } catch (error) {
    console.error('AnimeVost list error:', error)
    return []
  }
}

/**
 * Search anime by Shikimori ID
 */
export async function searchByShikimori(shikimoriId: number): Promise<AnimeVostAnime | null> {
  try {
    const list = await getAnimeList()
    
    const found = list.find(anime => anime.shikimori_id === shikimoriId)
    
    return found || null
  } catch (error) {
    console.error('AnimeVost search error:', error)
    return null
  }
}

/**
 * Get anime by ID
 */
export async function getAnimeById(id: number): Promise<AnimeVostAnime | null> {
  try {
    const response = await fetch(`${ANIMEVOST_BASE}/anime/${id}`)
    
    if (!response.ok) {
      return null
    }

    return await response.json() as AnimeVostAnime
  } catch (error) {
    console.error('AnimeVost fetch error:', error)
    return null
  }
}

/**
 * Get episodes for anime
 */
export async function getEpisodes(animeId: number): Promise<AnimeEpisode[]> {
  try {
    const response = await fetch(`${ANIMEVOST_BASE}/anime/${animeId}/episodes`)
    
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    
    if (!Array.isArray(data)) {
      return []
    }

    return data.map((ep: AnimeVostEpisode) => ({
      number: String(ep.episode),
      title: ep.title || `Episode ${ep.episode}`,
      hlsUrl: ep.hdUrl || ep.sdUrl || ep.url,
      quality: ep.hdUrl ? 'HD' as const : 'SD' as const,
    }))
  } catch (error) {
    console.error('AnimeVost episodes error:', error)
    return []
  }
}

/**
 * Build AnimeVost source
 */
export async function buildAnimeVostSource(shikimoriId: number): Promise<AnimeSource | null> {
  const anime = await searchByShikimori(shikimoriId)
  
  if (!anime) {
    return null
  }

  const episodes = await getEpisodes(anime.id)

  return {
    id: 'vost',
    name: 'AnimeVost',
    type: 'vost',
    available: episodes.length > 0,
    episodes,
    translations: ['AnimeVost'],
  }
}
