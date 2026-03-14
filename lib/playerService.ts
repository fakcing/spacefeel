import { PlayerServer, PlayerResponse } from '@/types/player'
import { getImdbId } from '@/lib/tmdb'

/**
 * Player Aggregator
 *
 * Uses Kinobox — a public Russian streaming aggregator that works with IMDB ID.
 */
export async function getPlayers(
  tmdbId: number,
  type: 'movie' | 'tv' | 'cartoon'
): Promise<PlayerResponse> {
  const tmdbType = type === 'cartoon' ? 'tv' : type
  const imdbId = await getImdbId(tmdbId, tmdbType).catch(() => null)

  if (!imdbId) {
    return { servers: [], cached: false }
  }

  const server: PlayerServer = {
    name: 'Kinobox',
    source: 'Kinobox',
    iframe: `https://kinobox.cc/video/main?imdb=${imdbId}`,
  }

  return { servers: [server], cached: false }
}
