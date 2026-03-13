import { PlayerServer, PlayerResponse } from '@/types/player'

/**
 * Player Aggregator
 *
 * Generates direct embed URLs from known Russian video services.
 * Uses TMDB ID — no API tokens required.
 */

function generateEmbedUrls(
  tmdbId: number,
  type: 'movie' | 'tv' | 'cartoon'
): { source: string; name: string; iframe: string }[] {
  const isTV = type === 'tv' || type === 'cartoon'

  return [
    {
      source: 'VoidBoost',
      name: 'VoidBoost',
      iframe: `https://voidboost.net/embed/${tmdbId}`,
    },
    {
      source: 'Collaps',
      name: 'Collaps',
      iframe: `https://api.collaps.org/embed/${isTV ? 'tv' : 'movie'}/${tmdbId}`,
    },
    {
      source: 'VDBaz',
      name: 'VDBaz',
      iframe: `https://vdbaz.to/embed/${isTV ? 'tv' : 'movie'}/${tmdbId}`,
    },
  ]
}

/**
 * Get players for a movie/TV show.
 * Returns all embed sources — client handles fallback between servers.
 */
export async function getPlayers(
  tmdbId: number,
  type: 'movie' | 'tv' | 'cartoon'
): Promise<PlayerResponse> {
  const embeds = generateEmbedUrls(tmdbId, type)

  const servers: PlayerServer[] = embeds.map(e => ({
    name: e.name,
    iframe: e.iframe,
    source: e.source,
  }))

  return { servers, cached: false }
}
