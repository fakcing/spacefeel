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
      `https://api.anilibria.tv/v3/title/search?search=${encodeURIComponent(q)}&limit=4&filter=id,names,posters,type`
    )
      .then((r) => r.json())
      .catch(() => ({ list: [] })),
  ])

  const aniResults = ((aniData.list ?? []) as Array<{
    id: number
    names: { ru: string; en: string }
    posters: { medium: { url: string } }
    type: { string: string }
  }>).map((t) => ({
    id: t.id,
    title: t.names.ru,
    poster_path: null,
    anilibria_poster: `https://anilibria.tv${t.posters.medium.url}`,
    media_type: 'anime',
    type: t.type.string,
  }))

  return NextResponse.json({
    results: [
      ...((tmdbData.results ?? []) as unknown[]).slice(0, 6),
      ...aniResults,
    ],
  })
}
