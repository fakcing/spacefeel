import { PlayerServer, PlayerResponse } from '@/types/player'
import { getImdbId } from '@/lib/tmdb'

/**
 * Player Aggregator
 *
 * Uses IMDB ID (fetched via TMDB) for services that require it.
 */

function buildEmbeds(
  tmdbId: number,
  imdbId: string | null,
  type: 'movie' | 'tv' | 'cartoon'
): { source: string; name: string; iframe: string; seasonKey?: string; episodeKey?: string }[] {
  const isTV = type === 'tv' || type === 'cartoon'
  const embeds: { source: string; name: string; iframe: string; seasonKey?: string; episodeKey?: string }[] = []

  // Alloha — primary, works with IMDB ID
  // Uses 's' and 'e' query params for season/episode
  if (imdbId) {
    embeds.push({
      source: 'Alloha',
      name: 'Alloha',
      iframe: `https://p.alloha.tv/?imdb=${imdbId}`,
      seasonKey: 's',
      episodeKey: 'e',
    })
  }

  // VoidBoost — works with IMDB ID
  if (imdbId) {
    embeds.push({
      source: 'VoidBoost',
      name: 'VoidBoost',
      iframe: isTV
        ? `https://voidboost.tv/embed/${imdbId}`
        : `https://voidboost.tv/embed/${imdbId}`,
    })
  }

  // Collaps — accepts TMDB ID
  embeds.push({
    source: 'Collaps',
    name: 'Collaps',
    iframe: `https://api.collaps.cc/v3/iframe/tmdb/${tmdbId}`,
  })

  // Bazon — works with IMDB ID
  if (imdbId) {
    embeds.push({
      source: 'Bazon',
      name: 'Bazon',
      iframe: isTV
        ? `https://bazon.cc/serial/${imdbId}`
        : `https://bazon.cc/film/${imdbId}/`,
    })
  }

  return embeds
}

/**
 * Get players for a movie/TV show.
 * Fetches IMDB ID first for services that require it.
 */
export async function getPlayers(
  tmdbId: number,
  type: 'movie' | 'tv' | 'cartoon'
): Promise<PlayerResponse> {
  const tmdbType = type === 'cartoon' ? 'tv' : type
  const imdbId = await getImdbId(tmdbId, tmdbType).catch(() => null)

  const embeds = buildEmbeds(tmdbId, imdbId, type)

  const servers: PlayerServer[] = embeds.map(e => ({
    name: e.name,
    iframe: e.iframe,
    source: e.source,
  }))

  return { servers, cached: false }
}
