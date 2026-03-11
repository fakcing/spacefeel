/**
 * AniLibria API Service
 *
 * Official API reference:
 * https://anilibria.top/api/docs/v1
 */

import type { AnimeEpisode, AnimeSource } from '@/lib/animeSources'

const ANILIBRIA_BASE = 'https://anilibria.top/api/v1'

type Nullable<T> = T | null | undefined

export interface AnilibriaPlayerEpisodeMap {
  [episode: string]:
    | string
    | {
        episode?: number | string
        name?: string
        title?: string
        uuid?: string
        src?: string
        hls?: string
        playlist?: string
        fhd?: string
        hd?: string
        sd?: string
        qualities?: Record<string, string>
      }
}

export interface AnilibriaTranslation {
  id?: number
  name?: string
  type?: 'sub' | 'dub' | string
  author?: string
}

export interface AnilibriaPlayer {
  host?: string
  alternative_player?: string
  list?: string | AnilibriaPlayerEpisodeMap
  episodes?: AnilibriaPlayerEpisodeMap
}

export interface AnilibriaEpisode {
  episode?: number
  name?: string
  title?: string
  hls?: string
  url?: string
  src?: string
  playlist?: string
  quality?: string
  qualities?: Record<string, string>
}

export interface AnilibriaRelease {
  id: number
  code?: string
  names?: {
    ru?: string
    en?: string
    alternative?: string
  }
  name?: string
  alt_names?: string[]
  description?: string
  poster?: string
  shikimori_id?: number
  player?: AnilibriaPlayer
  episodes?: AnilibriaEpisode[]
  translations?: AnilibriaTranslation[]
  team?: {
    voice?: string[]
  }
}

function normalizeUrl(url?: string): string | undefined {
  if (!url) {
    return undefined
  }

  if (url.startsWith('//')) {
    return `https:${url}`
  }

  if (url.startsWith('/')) {
    return `https://anilibria.top${url}`
  }

  return url
}

function qualityRank(label: string): number {
  if (label.includes('1080') || label.includes('fhd')) return 3
  if (label.includes('720') || label.includes('hd')) return 2
  if (label.includes('480') || label.includes('sd')) return 1
  return 0
}

function detectQualityFromUrl(url?: string): 'SD' | 'HD' | undefined {
  if (!url) {
    return undefined
  }

  const lower = url.toLowerCase()
  return lower.includes('1080') || lower.includes('720') || lower.includes('fhd') || lower.includes('hd')
    ? 'HD'
    : 'SD'
}

function chooseBestStream(input?: Nullable<Record<string, string>>): string | undefined {
  if (!input) {
    return undefined
  }

  return Object.entries(input)
    .sort((a, b) => qualityRank(b[0].toLowerCase()) - qualityRank(a[0].toLowerCase()))
    .map(([, value]) => normalizeUrl(value))
    .find(Boolean)
}

function parsePlayerList(playerList?: string | AnilibriaPlayerEpisodeMap): AnilibriaPlayerEpisodeMap {
  if (!playerList) {
    return {}
  }

  if (typeof playerList === 'string') {
    try {
      const parsed = JSON.parse(playerList) as unknown
      if (parsed && typeof parsed === 'object') {
        return parsed as AnilibriaPlayerEpisodeMap
      }
    } catch (error) {
      console.error('AniLibria: failed to parse player list', error)
    }

    return {}
  }

  return playerList
}

function extractEpisodeNumber(key: string, fallbackIndex: number, value?: { episode?: number | string }): string {
  if (value?.episode !== undefined && value.episode !== null) {
    return String(value.episode)
  }

  const numericKey = Number(key)
  if (!Number.isNaN(numericKey)) {
    return String(numericKey)
  }

  return String(fallbackIndex + 1)
}

export async function searchByShikimori(shikimoriId: number): Promise<AnilibriaRelease | null> {
  try {
    const response = await fetch(`${ANILIBRIA_BASE}/anime?shikimori_id=${shikimoriId}`, {
      next: { revalidate: 60 * 60 },
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as unknown
    const release = Array.isArray(data) ? data[0] : data

    return release && typeof release === 'object' ? (release as AnilibriaRelease) : null
  } catch (error) {
    console.error('AniLibria search error:', error)
    return null
  }
}

export async function getReleaseById(id: number): Promise<AnilibriaRelease | null> {
  try {
    const response = await fetch(`${ANILIBRIA_BASE}/anime/${id}`, {
      next: { revalidate: 60 * 60 },
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as AnilibriaRelease
  } catch (error) {
    console.error('AniLibria fetch error:', error)
    return null
  }
}

export function parseEpisodesFromPlayer(playerList?: string | AnilibriaPlayerEpisodeMap): AnimeEpisode[] {
  const parsed = parsePlayerList(playerList)

  return Object.entries(parsed)
    .map(([key, rawValue], index): AnimeEpisode | null => {
      if (typeof rawValue === 'string') {
        const streamUrl = normalizeUrl(rawValue)
        if (!streamUrl) {
          return null
        }

        return {
          number: extractEpisodeNumber(key, index),
          title: `Серия ${extractEpisodeNumber(key, index)}`,
          hlsUrl: streamUrl,
          quality: detectQualityFromUrl(streamUrl) ?? 'HD',
        }
      }

      const episodeNumber = extractEpisodeNumber(key, index, rawValue)
      const streamUrl =
        normalizeUrl(rawValue.hls) ??
        normalizeUrl(rawValue.playlist) ??
        normalizeUrl(rawValue.src) ??
        normalizeUrl(rawValue.fhd) ??
        normalizeUrl(rawValue.hd) ??
        normalizeUrl(rawValue.sd) ??
        chooseBestStream(rawValue.qualities)

      if (!streamUrl) {
        return null
      }

      return {
        number: episodeNumber,
        title: rawValue.title || rawValue.name || `Серия ${episodeNumber}`,
        hlsUrl: streamUrl,
        quality:
          detectQualityFromUrl(streamUrl) ??
          (rawValue.fhd || rawValue.hd ? 'HD' : 'SD'),
      }
    })
    .filter((episode): episode is AnimeEpisode => Boolean(episode))
    .sort((a, b) => Number(a.number) - Number(b.number))
}

export function getTranslations(release: AnilibriaRelease): string[] {
  const set = new Set<string>()

  release.translations?.forEach((translation) => {
    if (translation.name) {
      set.add(translation.name)
    }
  })

  release.team?.voice?.forEach((voice) => {
    if (voice) {
      set.add(voice)
    }
  })

  if (set.size === 0) {
    set.add('AniLibria')
  }

  return Array.from(set)
}

export function buildAnilibriaSource(release: AnilibriaRelease): AnimeSource {
  const episodesMap = new Map<string, AnimeEpisode>()

  parseEpisodesFromPlayer(release.player?.episodes).forEach((episode) => {
    episodesMap.set(episode.number, episode)
  })

  parseEpisodesFromPlayer(release.player?.list).forEach((episode) => {
    if (!episodesMap.has(episode.number)) {
      episodesMap.set(episode.number, episode)
    }
  })

  release.episodes?.forEach((episode, index) => {
    const episodeNumber = String(episode.episode ?? index + 1)

    if (episodesMap.has(episodeNumber)) {
      return
    }

    const streamUrl =
      normalizeUrl(episode.hls) ??
      normalizeUrl(episode.playlist) ??
      normalizeUrl(episode.src) ??
      normalizeUrl(episode.url) ??
      chooseBestStream(episode.qualities)

    if (!streamUrl) {
      return
    }

    episodesMap.set(episodeNumber, {
      number: episodeNumber,
      title: episode.title || episode.name || `Серия ${episodeNumber}`,
      hlsUrl: streamUrl,
      quality:
        detectQualityFromUrl(streamUrl) ??
        (episode.quality?.toLowerCase().includes('hd') ? 'HD' : 'SD'),
    })
  })

  const episodes = Array.from(episodesMap.values()).sort((a, b) => Number(a.number) - Number(b.number))

  return {
    id: 'libria',
    name: 'AniLibria',
    type: 'libria',
    available: episodes.length > 0,
    episodes,
    translations: getTranslations(release),
  }
}
