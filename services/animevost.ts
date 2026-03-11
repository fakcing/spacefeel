/**
 * AnimeVost API Service
 *
 * Inspired by the Semolik/AnimeVostPlayer integration approach.
 * API host: https://api.animevost.org
 */

import type { AnimeEpisode, AnimeSource } from '@/lib/animeSources'

const ANIMEVOST_BASE = 'https://api.animevost.org'

export interface AnimeVostVoice {
  id?: number | string
  title?: string
  name?: string
}

export interface AnimeVostEpisodeApi {
  id?: number | string
  episode?: number | string
  number?: number | string
  title?: string
  name?: string
  url?: string
  hls?: string
  m3u8?: string
  src?: string
  stream_url?: string
  file?: string
  sdUrl?: string
  hdUrl?: string
  fullhdUrl?: string
  quality?: string
  dubbing?: string
  voice?: string
  translator?: string
  voices?: AnimeVostVoice[]
}

export interface AnimeVostAnime {
  id: number
  title?: string
  name?: string
  altTitle?: string
  alias?: string
  description?: string
  poster?: string
  image?: string
  shikimori_id?: number
  shikimori?: number
  episodes?: AnimeVostEpisodeApi[]
  voices?: AnimeVostVoice[]
}

function normalizeUrl(url?: string): string | undefined {
  if (!url) {
    return undefined
  }

  if (url.startsWith('//')) {
    return `https:${url}`
  }

  if (url.startsWith('/')) {
    return `${ANIMEVOST_BASE}${url}`
  }

  return url
}

function detectQuality(url?: string): 'SD' | 'HD' {
  const value = (url ?? '').toLowerCase()
  return value.includes('1080') || value.includes('720') || value.includes('hd') ? 'HD' : 'SD'
}

function selectBestStream(episode: AnimeVostEpisodeApi): string | undefined {
  return (
    normalizeUrl(episode.fullhdUrl) ??
    normalizeUrl(episode.hdUrl) ??
    normalizeUrl(episode.m3u8) ??
    normalizeUrl(episode.hls) ??
    normalizeUrl(episode.stream_url) ??
    normalizeUrl(episode.src) ??
    normalizeUrl(episode.file) ??
    normalizeUrl(episode.sdUrl) ??
    normalizeUrl(episode.url)
  )
}

function extractVoiceLabels(episode: AnimeVostEpisodeApi): string[] {
  const set = new Set<string>()

  if (episode.dubbing) set.add(episode.dubbing)
  if (episode.voice) set.add(episode.voice)
  if (episode.translator) set.add(episode.translator)

  episode.voices?.forEach((voice) => {
    const label = voice.title || voice.name
    if (label) {
      set.add(label)
    }
  })

  return Array.from(set)
}

function mapEpisodeToPlayerEpisode(episode: AnimeVostEpisodeApi, fallbackIndex: number): AnimeEpisode | null {
  const number = String(episode.episode ?? episode.number ?? fallbackIndex + 1)
  const streamUrl = selectBestStream(episode)

  if (!streamUrl) {
    return null
  }

  return {
    number,
    title: episode.title || episode.name || `Серия ${number}`,
    hlsUrl: streamUrl,
    quality: detectQuality(streamUrl),
  }
}

export async function getAnimeList(): Promise<AnimeVostAnime[]> {
  try {
    const response = await fetch(`${ANIMEVOST_BASE}/anime/list`, {
      next: { revalidate: 60 * 60 },
    })

    if (!response.ok) {
      return []
    }

    const data = (await response.json()) as unknown
    return Array.isArray(data) ? (data as AnimeVostAnime[]) : []
  } catch (error) {
    console.error('AnimeVost list error:', error)
    return []
  }
}

export async function searchByShikimori(shikimoriId: number): Promise<AnimeVostAnime | null> {
  try {
    const list = await getAnimeList()

    const found = list.find((anime) => anime.shikimori_id === shikimoriId || anime.shikimori === shikimoriId)

    return found ?? null
  } catch (error) {
    console.error('AnimeVost search error:', error)
    return null
  }
}

export async function getAnimeById(id: number): Promise<AnimeVostAnime | null> {
  try {
    const response = await fetch(`${ANIMEVOST_BASE}/anime/${id}`, {
      next: { revalidate: 60 * 60 },
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as AnimeVostAnime
  } catch (error) {
    console.error('AnimeVost fetch error:', error)
    return null
  }
}

export async function getEpisodes(animeId: number): Promise<AnimeEpisode[]> {
  try {
    const response = await fetch(`${ANIMEVOST_BASE}/anime/${animeId}/episodes`, {
      next: { revalidate: 60 * 30 },
    })

    if (!response.ok) {
      return []
    }

    const data = (await response.json()) as unknown

    if (!Array.isArray(data)) {
      return []
    }

    return data
      .map((episode, index) => mapEpisodeToPlayerEpisode(episode as AnimeVostEpisodeApi, index))
      .filter((episode): episode is AnimeEpisode => Boolean(episode))
      .sort((a, b) => Number(a.number) - Number(b.number))
  } catch (error) {
    console.error('AnimeVost episodes error:', error)
    return []
  }
}

export async function getVoiceLabels(animeId: number): Promise<string[]> {
  try {
    const response = await fetch(`${ANIMEVOST_BASE}/anime/${animeId}/episodes`, {
      next: { revalidate: 60 * 30 },
    })

    if (!response.ok) {
      return []
    }

    const data = (await response.json()) as unknown
    if (!Array.isArray(data)) {
      return []
    }

    const set = new Set<string>()

    data.forEach((item) => {
      extractVoiceLabels(item as AnimeVostEpisodeApi).forEach((label) => set.add(label))
    })

    return Array.from(set)
  } catch (error) {
    console.error('AnimeVost voices error:', error)
    return []
  }
}

export async function buildAnimeVostSource(shikimoriId: number): Promise<AnimeSource | null> {
  const anime = await searchByShikimori(shikimoriId)

  if (!anime) {
    return null
  }

  const [episodes, voiceLabels] = await Promise.all([getEpisodes(anime.id), getVoiceLabels(anime.id)])

  return {
    id: 'vost',
    name: 'AnimeVost',
    type: 'vost',
    available: episodes.length > 0,
    episodes,
    translations: voiceLabels.length > 0 ? voiceLabels : ['AnimeVost'],
  }
}
