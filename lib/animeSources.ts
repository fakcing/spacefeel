/**
 * Multi-Source Anime Player Service
 *
 * Aggregates video sources from:
 * - Yani TV (Alloha)
 * - AniLibria API (anilibria.top/api/v1)
 * - AnimeVost API (api.animetop.info/v1)
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
const ANIMETOP_BASE = 'https://api.animetop.info/v1'

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms)
}

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
 * Search AniLibria by title name.
 * API: GET /app/search/releases?query={name}  → pick first result alias
 *      GET /anime/releases/{alias}?include=episodes
 */
export async function getAniLibriaSources(titleName: string): Promise<AnimeSource | null> {
  try {
    const searchRes = await fetch(
      `${ANILIBRIA_BASE}/app/search/releases?query=${encodeURIComponent(titleName)}`,
      { signal: withTimeout(8000) }
    )
    if (!searchRes.ok) return null

    const results = await searchRes.json()
    const first = Array.isArray(results) ? results[0] : null
    if (!first?.alias) return null

    const releaseRes = await fetch(
      `${ANILIBRIA_BASE}/anime/releases/${first.alias}?include=episodes`,
      { signal: withTimeout(8000) }
    )
    if (!releaseRes.ok) return null

    const release = await releaseRes.json()
    const rawEpisodes: Record<string, unknown>[] = Array.isArray(release.episodes)
      ? release.episodes
      : []

    const episodes: AnimeEpisode[] = rawEpisodes
      .map((ep): AnimeEpisode | null => {
        const hlsUrl =
          (ep.hls_1080 as string | undefined) ??
          (ep.hls_720 as string | undefined) ??
          (ep.hls_480 as string | undefined)
        if (!hlsUrl) return null
        const number = String(ep.ordinal ?? ep.sort_order ?? 1)
        return {
          number,
          title: (ep.name as string | undefined) ?? `Серия ${number}`,
          hlsUrl,
          quality: ep.hls_1080 ? 'HD' : 'SD',
        }
      })
      .filter((e): e is AnimeEpisode => e !== null)
      .sort((a, b) => Number(a.number) - Number(b.number))

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
 * Search AnimeVost (animetop.info) by title name.
 * API: POST /search  name={title}  → pick first result id
 *      POST /playlist id={id}      → array of {name, hd, std}
 */
export async function getAnimeVostSources(titleName: string): Promise<AnimeSource | null> {
  try {
    const searchRes = await fetch(`${ANIMETOP_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `name=${encodeURIComponent(titleName)}`,
      signal: withTimeout(8000),
    })
    if (!searchRes.ok) return null

    const searchData = await searchRes.json()
    const items: Record<string, unknown>[] = Array.isArray(searchData?.data)
      ? searchData.data
      : []
    if (items.length === 0) return null

    const animeId = items[0].id as number | string
    if (!animeId) return null

    const playlistRes = await fetch(`${ANIMETOP_BASE}/playlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `id=${animeId}`,
      signal: withTimeout(8000),
    })
    if (!playlistRes.ok) return null

    const playlist: Record<string, unknown>[] = await playlistRes.json()
    if (!Array.isArray(playlist) || playlist.length === 0) return null

    const episodes: AnimeEpisode[] = playlist.map((ep, idx): AnimeEpisode => {
      const name = (ep.name as string | undefined) ?? ''
      const numMatch = name.match(/(\d+(?:\.\d+)?)/)
      const number = numMatch ? numMatch[1] : String(idx + 1)
      const hlsUrl =
        (ep.hd as string | undefined) ??
        (ep.std as string | undefined)
      return {
        number,
        title: name || `Серия ${number}`,
        hlsUrl,
        quality: ep.hd ? 'HD' : 'SD',
      }
    })

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
  yaniVideos: YaniVideo[],
  titleName: string,
): Promise<AnimeSource[]> {
  const sources: AnimeSource[] = []

  // 1. Yani TV (already loaded)
  const yaniSource = getYaniSources(yaniVideos)
  if (yaniSource.available) sources.push(yaniSource)

  // 2 & 3. AniLibria + AnimeVost in parallel (both search by title name)
  const [libria, vost] = await Promise.all([
    getAniLibriaSources(titleName),
    getAnimeVostSources(titleName),
  ])

  if (libria?.available) sources.push(libria)
  if (vost?.available) sources.push(vost)

  return sources
}
