/**
 * Anime Player Aggregator Service
 * 
 * Orchestrates all anime sources (Yummy, AniLibria, AnimeVost)
 * Provides unified interface for frontend
 */

import { getYummyAnimeData, getYummyIframe } from '@/services/anime/yummyAnime'
import { getAnimeVostEpisodes, getAnimeVostHlsUrl } from '@/services/anime/animeVost'
import { AnimeServer, AnimeServerData, AnimeTranslation, AnimeEpisode } from '@/types/animePlayer'

// Inline anilibria functions
function getAniLibriaPlayerUrl(animeId: number, episode?: number): string {
  if (episode) {
    return `https://anilibria.top/api/v1/player/${animeId}?episode=${episode}`
  }
  return `https://anilibria.top/api/v1/player/${animeId}`
}

function getAniLibriaEpisodesFromList(episodes: unknown[]): AnimeEpisode[] {
  if (!episodes || episodes.length === 0) {
    return [{ episode: 1, title: 'Episode 1', quality: 'HD' as const }]
  }

  return episodes.map((ep: unknown) => ({
    episode: (ep as { episode?: number }).episode || 1,
    title: (ep as { title?: string }).title || `Episode ${(ep as { episode?: number }).episode || 1}`,
    hlsUrl: (ep as { hls?: string; url?: string }).hls || (ep as { url?: string }).url,
    quality: (ep as { quality?: string }).quality === 'fhd' || (ep as { quality?: string }).quality === '1080' ? 'HD' as const : 'SD' as const,
  }))
}

// Inline translation function for AniLibria
function getAniLibriaTranslations(): AnimeTranslation[] {
  return [
    { id: 1, name: 'AniLibria', type: 'dub', language: 'ru' },
    { id: 2, name: 'AniLibria [SUB]', type: 'sub', language: 'ru' },
  ]
}

// Inline anilibria search function
async function searchAniLibriaByShikimoriLocal(shikimoriId: number): Promise<{ id: number; episodes?: unknown[] } | null> {
  try {
    const response = await fetch(
      `https://anilibria.top/api/v1/anime?shikimori_id=${shikimoriId}`,
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
 * Get all available servers for an anime
 */
export async function getAnimeServers(shikimoriId: number): Promise<AnimeServerData[]> {
  const servers: AnimeServerData[] = []

  // Fetch from all sources in parallel
  const [yummyData, libriaData, vostData] = await Promise.all([
    getYummyAnimeData(shikimoriId),
    searchAniLibriaByShikimoriLocal(shikimoriId),
    getAnimeVostEpisodes(shikimoriId),
  ])

  // Yummy Anime (Primary)
  if (yummyData) {
    servers.push({
      server: 'yummy',
      name: 'Yummy (Main)',
      iframe: yummyData.iframe,
      translations: yummyData.translations,
      episodes: yummyData.episodes,
      available: true,
    })
  } else {
    servers.push({
      server: 'yummy',
      name: 'Yummy (Main)',
      translations: [],
      episodes: [],
      available: false,
    })
  }

  // AniLibria (Quality)
  if (libriaData) {
    servers.push({
      server: 'libria',
      name: 'AniLibria (HQ)',
      iframe: getAniLibriaPlayerUrl(libriaData.id),
      translations: getAniLibriaTranslations(),
      episodes: getAniLibriaEpisodesFromList(libriaData.episodes || []),
      available: true,
    })
  } else {
    servers.push({
      server: 'libria',
      name: 'AniLibria (HQ)',
      translations: [],
      episodes: [],
      available: false,
    })
  }

  // AnimeVost (Fast)
  if (vostData) {
    servers.push({
      server: 'vost',
      name: 'AnimeVost (Fast)',
      translations: vostData.translations,
      episodes: vostData.episodes,
      available: true,
    })
  } else {
    servers.push({
      server: 'vost',
      name: 'AnimeVost (Fast)',
      translations: [],
      episodes: [],
      available: false,
    })
  }

  return servers
}

/**
 * Get HLS URL for AnimeVost server
 */
export function getVostHlsUrl(
  shikimoriId: number,
  episode: number,
  quality: 'SD' | 'HD' = 'HD'
): string | null {
  return getAnimeVostHlsUrl(shikimoriId, episode, quality)
}

/**
 * Get iframe URL for selected server
 */
export function getServerIframe(
  server: AnimeServer,
  shikimoriId: number,
  episode?: number
): string | null {
  switch (server) {
    case 'yummy':
      return getYummyIframe(shikimoriId, episode)
    case 'libria':
      return getAniLibriaPlayerUrl(shikimoriId, episode)
    case 'vost':
      return null // Vost uses HLS directly
    default:
      return null
  }
}

/**
 * Get available translations for a server
 */
export function getServerTranslations(
  server: AnimeServer,
  serverData?: AnimeServerData
): AnimeTranslation[] {
  if (!serverData) return []
  return serverData.translations
}

/**
 * Get available episodes for a server
 */
export function getServerEpisodes(
  server: AnimeServer,
  serverData?: AnimeServerData
): AnimeEpisode[] {
  if (!serverData) return []
  return serverData.episodes
}

/**
 * Clear anime player cache
 */
export async function clearAnimeCache(shikimoriId: number): Promise<void> {
  // Implementation if using database cache
  console.log('Clearing cache for:', shikimoriId)
}
