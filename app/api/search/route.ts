import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getTmdbLanguage } from '@/lib/tmdbLanguage'

const YANI_HEADERS = { 'X-Application': process.env.YANI_TV_TOKEN! }

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value ?? 'en'
  const language = getTmdbLanguage(locale)

  const [tmdbData, yaniData] = await Promise.all([
    fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=${language}`
    ).then((r) => r.json()),
    fetch(
      `https://api.yani.tv/anime?q=${encodeURIComponent(q)}&limit=5`,
      { headers: YANI_HEADERS }
    )
      .then((r) => r.json())
      .catch(() => ({ response: [] })),
  ])

  const aniResults = ((yaniData.response ?? []) as Array<{
    anime_id: number
    anime_url: string
    title: string
    poster: { medium: string; big: string }
    type: { name: string }
    year: number
  }>).map((t) => {
    const posterPath = t.poster.medium || t.poster.big
    const posterUrl = posterPath.startsWith('//') ? `https:${posterPath}` : posterPath
    return {
      id: t.anime_id,
      title: t.title,
      poster_path: null,
      anilibria_poster: posterUrl,
      media_type: 'anime',
      alias: t.anime_url,
      year: String(t.year ?? ''),
      source: 'yani',
    }
  })

  // Exclude animation (genre 16) and persons from TMDB — anime comes from yani.tv
  const tmdbFiltered = ((tmdbData.results ?? []) as Array<{
    media_type: string
    genre_ids?: number[]
  }>)
    .filter((item) =>
      item.media_type !== 'person' &&
      !(item.genre_ids ?? []).includes(16)
    )
    .slice(0, 6)

  return NextResponse.json({
    results: [...tmdbFiltered, ...aniResults],
  })
}
