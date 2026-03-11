/**
 * Multi-Source Anime Player Service
 * 
 * Aggregates video sources from:
 * - Yani TV (Alloha)
 * - AniLibria API
 * - AnimeVost API
 */

import { YaniVideo } from '@/types/yani'

export interface AnimeSource {
  id: string
  name: string
  type: 'yummy' | 'libria' | 'vost'
  available: boolean
  episodes: AnimeEpisode[]
  translations: string[]
}

export interface AnimeEpisode {
  number: string
  title?: string
  iframeUrl?: string
  hlsUrl?: string
  quality?: 'SD' | 'HD'
}

const ANILIBRIA_BASE = 'https://api.anilibria.top/api/v1'
const ANIMEVOST_BASE = 'https://animevost.org'

/**
 * Get Yani TV videos (already loaded from page)
 */
export function getYaniSources(videos: YaniVideo[]): AnimeSource {
  const translations = Array.from(new Set(videos.map(v => v.data.dubbing)))
  
  const episodes: AnimeEpisode[] = videos.map(v => ({
    number: v.number,
    iframeUrl: v.iframe_url.startsWith('//') ? `https:${v.iframe_url}` : v.iframe_url,
    quality: 'HD',
  }))

  return {
    id: 'yummy',
    name: 'Yummy (Alloha)',
    type: 'yummy',
    available: videos.length > 0,
    episodes,
    translations,
  }
}

/**
 * Search AniLibria by Shikimori ID
 */
export async function getAniLibriaSources(shikimoriId: number): Promise<AnimeSource | null> {
  try {
    // Search by Shikimori ID
    const searchRes = await fetch(`${ANILIBRIA_BASE}/anime?shikimori_id=${shikimoriId}`)
    
    if (!searchRes.ok) {
      return null
    }

    const searchData = await searchRes.json()
    const animeId = searchData.id || searchData[0]?.id
    
    if (!animeId) {
      return null
    }

    // Get episodes/player data
    const playerRes = await fetch(`${ANILIBRIA_BASE}/player/${animeId}`)
    
    if (!playerRes.ok) {
      return null
    }

    const playerData = await playerRes.json()
    
    const episodes: AnimeEpisode[] = (playerData.episodes || []).map((ep: unknown, idx: number) => ({
      number: String(idx + 1),
      title: (ep as { title?: string }).title || `Episode ${idx + 1}`,
      hlsUrl: (ep as { hls?: string; url?: string }).hls || (ep as { url?: string }).url,
      quality: (ep as { quality?: string }).quality === 'fhd' || (ep as { quality?: string }).quality === '1080' ? 'HD' as const : 'SD' as const,
    }))

    return {
      id: 'libria',
      name: 'AniLibria',
      type: 'libria',
      available: episodes.length > 0,
      episodes,
      translations: ['AniLibria', 'AniLibria [SUB]'],
    }
  } catch (error) {
    console.error('AniLibria fetch error:', error)
    return null
  }
}

/**
 * Search AnimeVost by Shikimori ID
 */
export async function getAnimeVostSources(shikimoriId: number): Promise<AnimeSource | null> {
  try {
    // Search AnimeVost
    const searchRes = await fetch(`${ANIMEVOST_BASE}/api/search?query=${shikimoriId}&type=shikimori`)
    
    if (!searchRes.ok) {
      return null
    }

    const searchData = await searchRes.json()
    const animeId = searchData.id || searchData[0]?.id
    
    if (!animeId) {
      return null
    }

    // Get episodes
    const episodesRes = await fetch(`${ANIMEVOST_BASE}/api/episodes/${animeId}`)
    
    if (!episodesRes.ok) {
      return null
    }

    const episodesData = await episodesRes.json()
    
    const episodes: AnimeEpisode[] = (episodesData.episodes || []).map((ep: unknown) => ({
      number: String((ep as { episode?: number }).episode),
      title: (ep as { title?: string }).title || `Episode ${(ep as { episode?: number }).episode}`,
      hlsUrl: (ep as { hdUrl?: string; sdUrl?: string }).hdUrl || (ep as { sdUrl?: string }).sdUrl,
      quality: (ep as { hdUrl?: string }).hdUrl ? 'HD' as const : 'SD' as const,
    }))

    return {
      id: 'vost',
      name: 'AnimeVost',
      type: 'vost',
      available: episodes.length > 0,
      episodes,
      translations: ['AnimeVost'],
    }
  } catch (error) {
    console.error('AnimeVost fetch error:', error)
    return null
  }
}

/**
 * Get all available sources for an anime
 */
export async function getAllAnimeSources(
  shikimoriId: number,
  yaniVideos: YaniVideo[]
): Promise<AnimeSource[]> {
  const sources: AnimeSource[] = []

  // 1. Yani TV (already loaded)
  const yaniSource = getYaniSources(yaniVideos)
  if (yaniSource.available) {
    sources.push(yaniSource)
  }

  // 2. AniLibria (parallel fetch)
  const libriaPromise = getAniLibriaSources(shikimoriId)
  
  // 3. AnimeVost (parallel fetch)
  const vostPromise = getAnimeVostSources(shikimoriId)

  const [libria, vost] = await Promise.all([libriaPromise, vostPromise])

  if (libria?.available) {
    sources.push(libria)
  }

  if (vost?.available) {
    sources.push(vost)
  }

  return sources
}
