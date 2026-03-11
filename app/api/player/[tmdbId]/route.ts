import { NextRequest, NextResponse } from 'next/server'
import { getPlayers } from '@/lib/playerService'

export async function GET(
  request: NextRequest,
  { params }: { params: { tmdbId: string } }
) {
  try {
    const tmdbId = parseInt(params.tmdbId)
    if (isNaN(tmdbId)) {
      return NextResponse.json(
        { error: 'Invalid TMDB ID' },
        { status: 400 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as 'movie' | 'tv' | 'cartoon' | null

    if (!type || !['movie', 'tv', 'cartoon'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "movie", "tv", or "cartoon"' },
        { status: 400 }
      )
    }

    // Get players from aggregator (no IMDB ID needed)
    const result = await getPlayers(tmdbId, type)

    if (result.servers.length === 0) {
      return NextResponse.json(
        { 
          servers: [],
          message: 'No video sources available for this title.',
          cached: false,
        },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Player API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
