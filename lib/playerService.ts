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

  // 2embed uses &s=&e= directly appended (not ?s=&e=)
  // Use {season}/{episode} placeholders — replaced in UniversalPlayer
  const server: PlayerServer = {
    name: '2Embed',
    source: '2Embed',
    iframe: isTV
      ? `https://www.2embed.cc/embedtv/${imdbId}&s={season}&e={episode}`
      : `https://www.2embed.cc/embed/${imdbId}`,
  }

  return { servers: [server], cached: false }
}
