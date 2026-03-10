import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getTmdbLanguage } from '@/lib/tmdbLanguage'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value ?? 'en'
  const language = getTmdbLanguage(locale)

  const res = await fetch(
    `https://api.themoviedb.org/3/search/multi?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(q ?? '')}&language=${language}`
  )
  const data = await res.json()
  return NextResponse.json(data)
}
