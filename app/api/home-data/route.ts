import { NextRequest, NextResponse } from 'next/server'
import { fetchTrending, fetchPopular, fetchTopRated } from '@/lib/tmdb'
import { fetchYaniCatalog } from '@/lib/yani'
import { Movie, TVShow } from '@/types/tmdb'
import { YaniAnime } from '@/types/yani'

interface HomeDataResponse {
  movies?: {
    trending: Movie[]
    popular: Movie[]
    topRated: Movie[]
  }
  tv?: {
    trending: TVShow[]
    popular: TVShow[]
  }
  anime?: YaniAnime[]
}

/**
 * API Proxy Route for aggregating data from multiple sources
 * 
 * Benefits:
 * - Single request from client instead of multiple
 * - Server-side caching reduces external API calls
 * - Can combine TMDB + YummyAnime data in one response
 * - Reduces client-side complexity
 * 
 * Usage:
 * fetch('/api/home-data')
 *   .then(r => r.json())
 *   .then(data => console.log(data))
 */

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const section = searchParams.get('section') || 'all'
  
  try {
    const response: HomeDataResponse = {}

    // Fetch based on requested section
    if (section === 'all' || section === 'movies') {
      const [trending, popular, topRated] = await Promise.all([
        fetchTrending('movie'),
        fetchPopular('movie'),
        fetchTopRated('movie'),
      ])
      response.movies = {
        trending: trending.results.slice(0, 10) as Movie[],
        popular: popular.results.slice(0, 10) as Movie[],
        topRated: topRated.results.slice(0, 10) as Movie[],
      }
    }

    if (section === 'all' || section === 'tv') {
      const [trending, popular] = await Promise.all([
        fetchTrending('tv'),
        fetchPopular('tv'),
      ])
      response.tv = {
        trending: trending.results.slice(0, 10) as TVShow[],
        popular: popular.results.slice(0, 10) as TVShow[],
      }
    }

    if (section === 'all' || section === 'anime') {
      const anime = await fetchYaniCatalog(1, 20)
      response.anime = anime.items.slice(0, 10) as YaniAnime[]
    }

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: Date.now(),
    }, {
      // Cache the response for 5 minutes
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })

  } catch (error) {
    console.error('Error in /api/home-data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data',
    }, { status: 500 })
  }
}
