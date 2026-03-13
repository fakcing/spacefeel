import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ratingSchema = z.object({
  tmdbId: z.number(),
  mediaType: z.enum(['movie', 'tv', 'anime']),
  score: z.number().min(1).max(10),
  review: z.string().max(1000).optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = ratingSchema.parse(await req.json())

    const rating = await prisma.rating.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: session.user.id,
          tmdbId: body.tmdbId,
          mediaType: body.mediaType,
        },
      },
      create: { userId: session.user.id, ...body },
      update: { score: body.score, review: body.review },
    })

    return NextResponse.json(rating)
  } catch {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const tmdbId = req.nextUrl.searchParams.get('tmdbId')
  const mediaType = req.nextUrl.searchParams.get('mediaType')
  const session = await auth()

  try {
    const ratings = await prisma.rating.findMany({
      where: {
        tmdbId: parseInt(tmdbId ?? '0'),
        mediaType: mediaType ?? 'movie',
      },
      include: {
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const avg = ratings.length
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : 0

    const myRatingId = session?.user?.id
      ? (ratings.find((r: { userId: string; id: string }) => r.userId === session.user!.id)?.id ?? null)
      : null

    return NextResponse.json({ ratings, average: avg, count: ratings.length, myRatingId })
  } catch {
    return NextResponse.json({ ratings: [], average: 0, count: 0, myRatingId: null })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tmdbId = parseInt(req.nextUrl.searchParams.get('tmdbId') ?? '0')
  const mediaType = req.nextUrl.searchParams.get('mediaType') ?? 'movie'

  await prisma.rating.deleteMany({
    where: { userId: session.user.id, tmdbId, mediaType },
  })

  return NextResponse.json({ ok: true })
}
