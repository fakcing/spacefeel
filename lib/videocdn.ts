'use client'

import {
  VideoCDNMovieResponse,
  VideoCDNSeriesResponse,
  VideoCDNAnimeResponse,
  VideoCDNQuality,
} from '@/types/videocdn'

const VIDEOCDN_BASE = 'https://videocdn.tv/api'

interface FetchVideoCDNOptions {
  type: 'movie' | 'tv' | 'anime'
  tmdbId?: number
  shikimoriId?: number
  season?: number
  episode?: number
}

/**
 * Fetch from VideoCDN API (client-side)
 */
export async function fetchVideoCDN({
  type,
  tmdbId,
  shikimoriId,
  season = 1,
  episode = 1,
}: FetchVideoCDNOptions): Promise<VideoCDNQuality[] | null> {
  try {
    let endpoint = ''
    const params = new URLSearchParams()

    if (type === 'anime') {
      if (!shikimoriId) return null
      endpoint = '/anime'
      params.append('shikimori_id', String(shikimoriId))
      params.append('season', String(season))
      params.append('episode', String(episode))
    } else {
      // movie or tv
      if (!tmdbId) return null
      endpoint = type === 'movie' ? '/movie' : '/tv'
      params.append('tmdb_id', String(tmdbId))
      if (type === 'tv') {
        params.append('season', String(season))
        params.append('episode', String(episode))
      }
    }

    const url = `${VIDEOCDN_BASE}${endpoint}?${params.toString()}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      console.error(`VideoCDN error: ${res.status}`)
      return null
    }

    const data = await res.json() as VideoCDNMovieResponse | VideoCDNSeriesResponse | VideoCDNAnimeResponse

    if (!data.success || !data.data) {
      return null
    }

    // Extract qualities based on type
    if (type === 'anime' && 'episodes' in data.data) {
      const animeData = data.data as VideoCDNAnimeResponse['data']
      const ep = animeData.episodes.find(e => e.episode === episode)
      return ep?.qualities || null
    } else if (type === 'tv' && 'seasons' in data.data) {
      const tvData = data.data as VideoCDNSeriesResponse['data']
      const seasonData = tvData.seasons.find(s => s.season === season)
      const ep = seasonData?.episodes.find(e => e.episode === episode)
      return ep?.qualities || null
    } else if ('qualities' in data.data) {
      const movieData = data.data as VideoCDNMovieResponse['data']
      return movieData.qualities || null
    }

    return null
  } catch (error) {
    console.error('VideoCDN fetch error:', error)
    return null
  }
}

/**
 * Get translations from VideoCDN
 */
export async function fetchVideoCDNTranslations(options: FetchVideoCDNOptions): Promise<{ id: number; title: string; type: 'sub' | 'dub' }[] | null> {
  try {
    let endpoint = ''
    const params = new URLSearchParams()

    if (options.type === 'anime') {
      if (!options.shikimoriId) return null
      endpoint = '/anime'
      params.append('shikimori_id', String(options.shikimoriId))
    } else {
      if (!options.tmdbId) return null
      endpoint = options.type === 'movie' ? '/movie' : '/tv'
      params.append('tmdb_id', String(options.tmdbId))
    }

    const url = `${VIDEOCDN_BASE}${endpoint}?${params.toString()}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!res.ok) return null

    const data = await res.json() as VideoCDNMovieResponse | VideoCDNSeriesResponse | VideoCDNAnimeResponse

    if (!data.success || !data.data || !data.data.translations) {
      return null
    }

    return data.data.translations.map(t => ({
      id: t.id,
      title: t.title,
      type: t.type,
    }))
  } catch (error) {
    console.error('VideoCDN translations error:', error)
    return null
  }
}

/**
 * Build iframe URL from quality
 */
export function buildVideoCDNUrl(quality: VideoCDNQuality): string {
  if (quality.url.startsWith('//')) {
    return `https:${quality.url}`
  }
  if (!quality.url.startsWith('http://') && !quality.url.startsWith('https://')) {
    return `https://${quality.url}`
  }
  return quality.url
}
