import { PlayerServer, PlayerResponse } from '@/types/player'
import { getImdbId } from '@/lib/tmdb'

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

  // {season} and {episode} placeholders are replaced client-side in UniversalPlayer
  const servers: PlayerServer[] = [
    {
      name: '2Embed',
      source: '2Embed',
      iframe: isTV
        ? `https://www.2embed.cc/embedtv/${imdbId}&s={season}&e={episode}`
        : `https://www.2embed.cc/embed/${imdbId}`,
    },
  ]

  return { servers, cached: false }
}
