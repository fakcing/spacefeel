/**
 * AnimeVost Service
 * 
 * Custom implementation based on Semolik/AnimeVostPlayer logic
 * Gets JSON with episode list and direct HLS (.m3u8) links
 */

import { AnimeTranslation, AnimeEpisode } from '@/types/animePlayer'

const ANIMEVOST_BASE = 'https://animevost.org'

interface AnimeVostEpisode {
  episode: number
  title: string
  sdUrl?: string
  hdUrl?: string
}

/**
 * Get AnimeVost episode data
 * Uses JSON endpoint to get HLS links
 */
export async function getAnimeVostEpisodes(animeId: number): Promise<{
  translations: AnimeTranslation[]
  episodes: AnimeEpisode[]
} | null> {
  try {
    // Fetch episode JSON from AnimeVost
    const response = await fetch(`${ANIMEVOST_BASE}/api/episodes/${animeId}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return {
      translations: [
        { id: 1, name: 'AnimeVost', type: 'dub', language: 'ru' },
        { id: 2, name: 'AnimeVost [SD]', type: 'dub', language: 'ru' },
      ],
      episodes: data.episodes?.map((ep: AnimeVostEpisode) => ({
        episode: ep.episode,
        title: ep.title,
        hlsUrl: ep.hdUrl || ep.sdUrl,
        quality: ep.hdUrl ? 'HD' : 'SD',
      })) || []
    }
  } catch (error) {
    console.error('AnimeVost fetch error:', error)
    return null
  }
}

/**
 * Get HLS URL for specific episode and quality
 */
export function getAnimeVostHlsUrl(animeId: number, episode: number, quality: 'SD' | 'HD' = 'HD'): string | null {
  // This would typically come from the API response
  // Placeholder implementation
  return `${ANIMEVOST_BASE}/hls/${animeId}/ep${episode}/${quality === 'HD' ? 'hd' : 'sd'}/playlist.m3u8`
}

/**
 * Parse AnimeVost JSON response
 */
export function parseAnimeVostJson(jsonString: string): AnimeEpisode[] {
  try {
    const data = JSON.parse(jsonString)
    return data.map((item: any) => ({
      episode: item.episode,
      title: item.title,
      hlsUrl: item.url || item.hls,
      quality: item.quality === 'hd' ? 'HD' : 'SD',
    }))
  } catch {
    return []
  }
}
