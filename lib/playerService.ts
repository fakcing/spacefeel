import { PlayerServer, PlayerResponse } from '@/types/player'
import { getImdbId } from '@/lib/tmdb'

/**
 * Player Aggregator
 *
 * Uses IMDB ID (fetched via TMDB) for services that require it.
 * VoidBoost and Bazon require IMDB IDs, not TMDB IDs.
 */

function buildEmbeds(
  tmdbId: number,
  imdbId: string | null,
  type: 'movie' | 'tv' | 'cartoon'
): { source: string; name: string; iframe: string }[] {
  const isTV = type === 'tv' || type === 'cartoon'
  const embeds: { source: string; name: string; iframe: string }[] = []

  // VoidBoost — works with IMDB ID
  if (imdbId) {
    embeds.push({
      source: 'VoidBoost',
      name: 'VoidBoost',
      iframe: isTV
        ? `https://voidboost.net/embed/${imdbId}?season=1&episode=1`
        : `https://voidboost.net/embed/${imdbId}`,
    })
  }

  // Collaps — accepts TMDB ID
  embeds.push({
    source: 'Collaps',
    name: 'Collaps',
    iframe: isTV
      ? `https://api.collaps.cc/v3/iframe/tmdb/${tmdbId}?season=1&episode=1`
      : `https://api.collaps.cc/v3/iframe/tmdb/${tmdbId}`,
  })

  // Bazon — works with IMDB ID
  if (imdbId) {
    embeds.push({
      source: 'Bazon',
      name: 'Bazon',
      iframe: isTV
        ? `https://bazon.cc/serial/${imdbId}/1/1/`
        : `https://bazon.cc/film/${imdbId}/`,
    })
  }

  // VDBaz fallback — accepts TMDB ID
  embeds.push({
    source: 'VDBaz',
    name: 'VDBaz',
    iframe: `https://vdbaz.net/embed/${isTV ? 'tv' : 'movie'}/${tmdbId}`,
  })

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
