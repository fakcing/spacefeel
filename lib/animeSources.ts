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

  const episodes: AnimeEpisode[] = videos
    .filter(v => v.iframe_url && v.iframe_url.length > 0)
    .map(v => ({
      number: v.number,
      iframeUrl: v.iframe_url.startsWith('//') ? `https:${v.iframe_url}` : v.iframe_url,
      quality: 'HD' as const,
    }))

  return {
    id: 'yummy',
    name: 'YummyAnime',
    type: 'yummy',
    available: episodes.length > 0,
    episodes,
    translations,
  }
}

/**
 * Search AniLibria by Shikimori ID
 */
export async function getAniLibriaSources(shikimoriId: number): Promise<AnimeSource | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)

    const searchRes = await fetch(`${ANILIBRIA_BASE}/anime?shikimori_id=${shikimoriId}`, {
      signal: controller.signal,
    }).finally(() => clearTimeout(timer))

    if (!searchRes.ok) return null

    const searchData = await searchRes.json()
    const anime = Array.isArray(searchData) ? searchData[0] : searchData
    if (!anime?.id) return null

    const episodes: AnimeEpisode[] = []

    if (anime.player?.list) {
      try {
        const playerList = typeof anime.player.list === 'string'
          ? JSON.parse(anime.player.list)
          : anime.player.list

        if (Array.isArray(playerList)) {
          episodes.push(
            ...playerList.map((ep: Record<string, unknown>, idx: number) => ({
              number: String(idx + 1),
              title: ep.title ? String(ep.title) : `Серия ${idx + 1}`,
              hlsUrl: ep.url ? String(ep.url) : ep.hls ? String(ep.hls) : undefined,
              quality: 'HD' as const,
            }))
          )
        }
      } catch {
        // Ignore parse error
      }
    }

    if (episodes.length === 0) return null

    return {
      id: 'libria',
      name: 'AniLibria',
      type: 'libria',
      available: true,
      episodes,
      translations: ['AniLibria'],
    }
  } catch {
    return null
  }
}

/**
 * Search AnimeVost by Shikimori ID
 */
export async function getAnimeVostSources(shikimoriId: number): Promise<AnimeSource | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)

    const searchRes = await fetch(`${ANIMEVOST_BASE}/anime/list`, {
      signal: controller.signal,
    }).finally(() => clearTimeout(timer))

    if (!searchRes.ok) return null

    const animeList = await searchRes.json()

    const foundAnime = Array.isArray(animeList)
      ? animeList.find((a: Record<string, unknown>) => Number(a.shikimori) === shikimoriId)
      : null

    const animeId = foundAnime ? Number(foundAnime.id) : null
    if (!animeId) return null

    const episodesRes = await fetch(`${ANIMEVOST_BASE}/anime/${animeId}/episodes`)
    if (!episodesRes.ok) return null

    const episodesData = await episodesRes.json()

    const episodes: AnimeEpisode[] = Array.isArray(episodesData)
      ? episodesData
          .map((ep: Record<string, unknown>) => ({
            number: String(ep.episode ?? ep.num ?? 1),
            title: ep.title ? String(ep.title) : undefined,
            hlsUrl: ep.url ? String(ep.url) : ep.hls ? String(ep.hls) : undefined,
            quality: 'HD' as const,
          }))
          .filter(ep => Boolean(ep.hlsUrl))
      : []

    if (episodes.length === 0) return null

    return {
      id: 'vost',
      name: 'AnimeVost',
      type: 'vost',
      available: true,
      episodes,
      translations: ['AnimeVost'],
    }
  } catch {
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
  if (yaniSource.available) sources.push(yaniSource)

  // 2 & 3. AniLibria + AnimeVost in parallel
  const [libria, vost] = await Promise.all([
    getAniLibriaSources(shikimoriId),
    getAnimeVostSources(shikimoriId),
  ])

  if (libria?.available) sources.push(libria)
  if (vost?.available) sources.push(vost)

  return sources
}
