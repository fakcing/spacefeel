import { NextRequest, NextResponse } from 'next/server'
import { getImdbId } from '@/lib/tmdb'
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

    // Get IMDB ID from TMDB
    const imdbId = await getImdbId(tmdbId, type === 'cartoon' ? 'tv' : type)
    
    if (!imdbId) {
      return NextResponse.json(
        { error: 'Could not find IMDB ID for this title' },
        { status: 404 }
      )
    }

    // Get players from aggregator
    const result = await getPlayers(tmdbId, type, imdbId)

    if (result.servers.length === 0) {
      return NextResponse.json(
        { 
          servers: [],
          message: 'No video sources found. Try again later or check back when more sources are added.',
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
