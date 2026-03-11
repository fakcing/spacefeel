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

const ANILIBRIA_BASE = 'https://anilibria.top/api/v1'
const ANIMEVOST_BASE = 'https://api.animevost.org'

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
 * API: https://anilibria.top/api/docs/v1
 */
export async function getAniLibriaSources(shikimoriId: number): Promise<AnimeSource | null> {
  try {
    console.log('Fetching AniLibria for shikimoriId:', shikimoriId)
    
    // Search by Shikimori ID
    const searchRes = await fetch(`${ANILIBRIA_BASE}/anime?shikimori_id=${shikimoriId}`)
    
    if (!searchRes.ok) {
      console.log('AniLibria search failed:', searchRes.status)
      return null
    }

    const searchData = await searchRes.json()
    console.log('AniLibria search result:', searchData)
    
    const anime = Array.isArray(searchData) ? searchData[0] : searchData
    const animeId = anime?.id
    
    if (!animeId) {
      return null
    }

    // Get episodes from player
    const episodes: AnimeEpisode[] = []
    if (anime.player && anime.player.list) {
      try {
        const playerList = JSON.parse(anime.player.list)
        if (Array.isArray(playerList)) {
          episodes.push(...playerList.map((ep: unknown, idx: number) => ({
            number: String(idx + 1),
            title: (ep as { title?: string }).title || `Episode ${idx + 1}`,
            hlsUrl: (ep as { url?: string; hls?: string }).url || (ep as { url?: string; hls?: string }).hls,
            quality: 'HD' as const,
          })))
        }
      } catch (e) {
        console.error('Failed to parse AniLibria player list:', e)
      }
    }

    if (episodes.length === 0) {
      return null
    }

    console.log('AniLibria episodes:', episodes.length)

    return {
      id: 'libria',
      name: 'AniLibria',
      type: 'libria',
      available: episodes.length > 0,
      episodes,
      translations: ['AniLibria'],
    }
  } catch (error) {
    console.error('AniLibria fetch error:', error)
    return null
  }
}

/**
 * Search AnimeVost by Shikimori ID
 * API: https://github.com/Semolik/AnimeVostPlayer
 */
export async function getAnimeVostSources(shikimoriId: number): Promise<AnimeSource | null> {
  try {
    console.log('Fetching AnimeVost for shikimoriId:', shikimoriId)
    
    // AnimeVost uses internal IDs, not Shikimori
    // We need to search by title or use a mapping
    // For now, we'll try to fetch using the shikimori ID as a reference
    
    // First, try to get anime list and find by shikimori
    const searchRes = await fetch(`${ANIMEVOST_BASE}/anime/list`)
    
    if (!searchRes.ok) {
      console.log('AnimeVost list fetch failed:', searchRes.status)
      return null
    }

    const animeList = await searchRes.json()
    
    // Find anime by shikimori_id in metadata
    const foundAnime = Array.isArray(animeList) 
      ? animeList.find((a: unknown) => (a as { shikimori?: number }).shikimori === shikimoriId)
      : null
    
    const animeId = (foundAnime as { id?: number })?.id
    
    if (!animeId) {
      console.log('AnimeVost: No match for shikimoriId', shikimoriId)
      return null
    }

    // Get episodes
    const episodesRes = await fetch(`${ANIMEVOST_BASE}/anime/${animeId}/episodes`)
    
    if (!episodesRes.ok) {
      return null
    }

    const episodesData = await episodesRes.json()
    
    const episodes: AnimeEpisode[] = Array.isArray(episodesData) 
      ? episodesData.map((ep: unknown) => ({
          number: String((ep as { episode?: number }).episode || 1),
          title: (ep as { title?: string }).title || `Episode ${(ep as { episode?: number }).episode || 1}`,
          hlsUrl: (ep as { url?: string; hls?: string }).url || (ep as { url?: string; hls?: string }).hls,
          quality: 'HD' as const,
        }))
      : []

    if (episodes.length === 0) {
      return null
    }

    console.log('AnimeVost episodes:', episodes.length)

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
