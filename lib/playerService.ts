import { PlayerServer, PlayerResponse } from '@/types/player'
import { getImdbId } from '@/lib/tmdb'

/**
 * Player Aggregator
 *
 * Uses public embed services that work without API keys or domain whitelisting.
 * Note: Russian CDN services (Kodik, Alloha) require API token registration.
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

  const isTV = type === 'tv' || type === 'cartoon'

  const servers: PlayerServer[] = [
    {
      name: 'VidSrc',
      source: 'VidSrc',
      iframe: isTV
        ? `https://vidsrc.to/embed/tv/${imdbId}`
        : `https://vidsrc.to/embed/movie/${imdbId}`,
      seasonKey: 'season',
      episodeKey: 'episode',
    },
    {
      name: '2Embed',
      source: '2Embed',
      iframe: isTV
        ? `https://www.2embed.cc/embedtv/${imdbId}`
        : `https://www.2embed.cc/embed/${imdbId}`,
      seasonKey: 's',
      episodeKey: 'e',
    },
  ]

  return { servers, cached: false }
}
