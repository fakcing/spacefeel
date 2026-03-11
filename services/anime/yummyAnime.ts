/**
 * Yummy Anime Service
 * 
 * Primary source for anime streaming
 * Returns iframe URLs with multiple translations
 */

import { AnimeTranslation, AnimeEpisode } from '@/types/animePlayer'

const YUMMY_BASE = 'https://yummyanime.net'

/**
 * Get anime data from Yummy Anime
 */
export async function getYummyAnimeData(shikimoriId: number): Promise<{
  translations: AnimeTranslation[]
  episodes: AnimeEpisode[]
  iframe: string
} | null> {
  try {
    // Fetch from Yummy Anime API/endpoint
    // This is a placeholder - replace with actual endpoint
    const response = await fetch(`${YUMMY_BASE}/api/anime/${shikimoriId}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return {
      iframe: data.iframe_url || `${YUMMY_BASE}/embed/${shikimoriId}`,
      translations: data.translations?.map((t: any) => ({
        id: t.id,
        name: t.name,
        type: t.type as 'sub' | 'dub',
        language: t.language,
      })) || [{ id: 1, name: 'Yummy', type: 'sub' as const }],
      episodes: data.episodes?.map((e: any) => ({
        episode: e.number,
        title: e.title,
        url: e.url,
      })) || [{ episode: 1, title: 'Episode 1' }],
    }
  } catch (error) {
    console.error('Yummy Anime fetch error:', error)
    return null
  }
}

/**
 * Get Yummy Anime iframe URL
 */
export function getYummyIframe(shikimoriId: number, episode?: number): string {
  const url = `${YUMMY_BASE}/embed/${shikimoriId}`
  if (episode) {
    return `${url}?episode=${episode}`
  }
  return url
}
