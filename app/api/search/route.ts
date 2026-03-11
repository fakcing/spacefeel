import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getTmdbLanguage } from '@/lib/tmdbLanguage'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value ?? 'en'
  const language = getTmdbLanguage(locale)

  const [tmdbData, aniData] = await Promise.all([
    fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=${language}`
    ).then((r) => r.json()),
    fetch(
      `https://anilibria.top/api/v1/anime/catalog/releases?search=${encodeURIComponent(q)}&limit=4`
    )
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
  ])

  const aniResults = ((aniData.data ?? []) as Array<{
    id: number
    alias: string
    name: { main: string; english: string }
    poster: { optimized: { src: string } | null; src: string }
    type: { value: string }
    year: number
  }>).map((t) => ({
    id: t.id,
    title: t.name.main,
    poster_path: null,
    anilibria_poster: `https://anilibria.top${t.poster.optimized?.src || t.poster.src}`,
    media_type: 'anime',
    alias: t.alias,
    year: String(t.year ?? ''),
    source: 'anilibria',
  }))

  return NextResponse.json({
    results: [
      ...((tmdbData.results ?? []) as unknown[]).slice(0, 6),
      ...aniResults,
    ],
  })
}
