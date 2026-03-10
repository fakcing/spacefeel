import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getTmdbLanguage } from '@/lib/tmdbLanguage'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  const type = req.nextUrl.searchParams.get('type')
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value ?? 'en'
  const language = getTmdbLanguage(locale)

  const res = await fetch(
    `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=${language}`
  )
  const data = await res.json()
  return NextResponse.json({
    title: data.title || data.name,
    poster_path: data.poster_path,
  })
}
