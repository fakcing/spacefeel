/**
 * AniLibria API Service
 * 
 * Uses official AniLibria API v1
 * Documentation: https://anilibria.top/api/docs/v1
 */

import { AnimeTranslation, AnimeEpisode } from '@/types/animePlayer'

const ANILIBRIA_BASE = 'https://anilibria.top/api/v1'

interface AnilibriaTitle {
  id: number
  name: string
  description?: string
  poster?: string
  episodes?: AnilibriaEpisode[]
}

interface AnilibriaEpisode {
  episode: number
  title?: string
  url?: string
  hls?: string
  quality?: string
}

/**
 * Search anime by Shikimori ID
 */
export async function searchAniLibriaByShikimori(shikimoriId: number): Promise<AnilibriaTitle | null> {
  try {
    const response = await fetch(
      `${ANILIBRIA_BASE}/anime?shikimori_id=${shikimoriId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('AniLibria search error:', error)
    return null
  }
}

/**
 * Get anime by ID
 */
export async function getAniLibriaAnime(animeId: number): Promise<AnilibriaTitle | null> {
  try {
    const response = await fetch(
      `${ANILIBRIA_BASE}/anime/${animeId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('AniLibria fetch error:', error)
    return null
  }
}

/**
 * Get AniLibria translations
 */
export function getAniLibriaTranslations(): AnimeTranslation[] {
  return [
    { id: 1, name: 'AniLibria', type: 'dub', language: 'ru' },
    { id: 2, name: 'AniLibria [SUB]', type: 'sub', language: 'ru' },
  ]
}

/**
 * Get AniLibria episodes
 */
export function getAniLibriaEpisodes(episodes: AnilibriaEpisode[]): AnimeEpisode[] {
  if (!episodes || episodes.length === 0) {
    return [{ episode: 1, title: 'Episode 1', quality: 'HD' as const }]
  }

  return episodes.map((ep) => ({
    episode: ep.episode,
    title: ep.title || `Episode ${ep.episode}`,
    hlsUrl: ep.hls || ep.url,
    quality: ep.quality === 'fhd' || ep.quality === '1080' ? 'HD' as const : 'SD' as const,
  }))
}

/**
 * Get AniLibria player URL
 */
export function getAniLibriaPlayerUrl(animeId: number, episode?: number): string {
  if (episode) {
    return `${ANILIBRIA_BASE}/player/${animeId}?episode=${episode}`
  }
  return `${ANILIBRIA_BASE}/player/${animeId}`
}
