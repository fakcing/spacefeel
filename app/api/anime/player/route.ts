import { NextRequest, NextResponse } from 'next/server'
import { YaniVideo } from '@/types/yani'

interface YaniVideoResponse {
  response: YaniVideo[]
}

// GET /api/anime/player?animeId={id}&episode={number}&dubbing={name}&season={num}
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const animeId = searchParams.get('animeId')
  const episode = searchParams.get('episode')
  const dubbing = searchParams.get('dubbing')
  const season = searchParams.get('season')

  if (!animeId || !episode) {
    return NextResponse.json(
      { error: 'animeId and episode are required' },
      { status: 400 }
    )
  }

  try {
    // Fetch from Yani TV API - get the player URL
    const url = `https://api.yani.tv/anime/${animeId}/videos`
    const res = await fetch(url, {
      headers: {
        'X-Application': process.env.YANI_TV_TOKEN || '',
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from Yani TV' },
        { status: res.status }
      )
    }

    const data = (await res.json()) as YaniVideoResponse
    const videos = data.response || []

    // Find the matching video
    const video = videos.find((v) => {
      const matchEpisode = v.number === episode
      const matchDubbing = !dubbing || v.data.dubbing === dubbing
      const matchSeason = !season || (v.season ?? 1) === parseInt(season)
      return matchEpisode && matchDubbing && matchSeason
    })

    if (!video || !video.iframe_url) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Return the player URL - client will load it
    const playerUrl = video.iframe_url.startsWith('//')
      ? `https:${video.iframe_url}`
      : video.iframe_url

    return NextResponse.json({
      playerUrl,
      videoId: video.video_id,
      dubbing: video.data.dubbing,
      season: video.season ?? 1,
    })
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
