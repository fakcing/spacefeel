import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value ?? 'en'
  revalidateTag(`tmdb-${locale}`)
  return NextResponse.json({ revalidated: true })
}
