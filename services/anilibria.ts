/**
 * AniLibria API Service
 * 
 * Official API: https://anilibria.top/api/docs/v1
 */

import { AnimeEpisode, AnimeSource } from '@/lib/animeSources'

const ANILIBRIA_BASE = 'https://anilibria.top/api/v1'

export interface AnilibriaRelease {
  id: number
  name: string
  alt_names: string[]
  description: string
  poster: string
  shikimori_id: number
  episodes: AnilibriaEpisode[]
  player: {
    list: string
    host?: string
  }
  translations?: AnilibriaTranslation[]
}

export interface AnilibriaEpisode {
  episode: number
  title: string
  url?: string
  hls?: string
  quality?: string
}

export interface AnilibriaTranslation {
  id: number
  name: string
  type: 'sub' | 'dub'
}

/**
 * Search anime by Shikimori ID
 */
export async function searchByShikimori(shikimoriId: number): Promise<AnilibriaRelease | null> {
  try {
    const response = await fetch(`${ANILIBRIA_BASE}/anime?shikimori_id=${shikimoriId}`)
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const release = Array.isArray(data) ? data[0] : data
    
    return release as AnilibriaRelease
  } catch (error) {
    console.error('AniLibria search error:', error)
    return null
  }
}

/**
 * Get release by ID
 */
export async function getReleaseById(id: number): Promise<AnilibriaRelease | null> {
  try {
    const response = await fetch(`${ANILIBRIA_BASE}/anime/${id}`)
    
    if (!response.ok) {
      return null
    }

    return await response.json() as AnilibriaRelease
  } catch (error) {
    console.error('AniLibria fetch error:', error)
    return null
  }
}

/**
 * Parse episodes from player list
 */
export function parseEpisodesFromPlayer(playerList: string): AnimeEpisode[] {
  try {
    const list = JSON.parse(playerList)
    
    if (!Array.isArray(list)) {
      return []
    }

    return list.map((ep: AnilibriaEpisode, idx: number) => ({
      number: String(ep.episode || idx + 1),
      title: ep.title || `Episode ${ep.episode || idx + 1}`,
      hlsUrl: ep.hls || ep.url,
      quality: ep.quality === 'fhd' || ep.quality === '1080' ? 'HD' as const : 'SD' as const,
    }))
  } catch {
    return []
  }
}

/**
 * Get available translations
 */
export function getTranslations(release: AnilibriaRelease): string[] {
  const translations: string[] = []
  
  if (release.translations && release.translations.length > 0) {
    release.translations.forEach(t => {
      translations.push(t.name)
    })
  } else {
    translations.push('AniLibria')
  }
  
  return translations
}

/**
 * Build AniLibria source
 */
export function buildAnilibriaSource(release: AnilibriaRelease): AnimeSource {
  const episodes: AnimeEpisode[] = []
  
  // Parse from player list
  if (release.player?.list) {
    const parsed = parseEpisodesFromPlayer(release.player.list)
    episodes.push(...parsed)
  }
  
  // Or use episodes array
  if (release.episodes && release.episodes.length > 0) {
    release.episodes.forEach(ep => {
      if (!episodes.find(e => e.number === String(ep.episode))) {
        episodes.push({
          number: String(ep.episode),
          title: ep.title,
          hlsUrl: ep.hls || ep.url,
          quality: ep.quality === 'fhd' ? 'HD' as const : 'SD' as const,
        })
      }
    })
  }

  return {
    id: 'libria',
    name: 'AniLibria',
    type: 'libria',
    available: episodes.length > 0,
    episodes,
    translations: getTranslations(release),
  }
}
