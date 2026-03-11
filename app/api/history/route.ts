import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({})

  const body = await req.json()

  await prisma.watchHistory.create({
    data: {
      userId: session.user.id,
      tmdbId: body.tmdbId,
      mediaType: body.mediaType,
      posterPath: body.posterPath,
      season: body.season,
      episode: body.episode,
    },
  })

  return NextResponse.json({ recorded: true })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const history = await prisma.watchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { watchedAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(history)
}
