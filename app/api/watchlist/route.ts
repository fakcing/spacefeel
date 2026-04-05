import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const itemSchema = z.object({
  tmdbId: z.number(),
  mediaType: z.enum(['movie', 'tv', 'anime']),
  posterPath: z.string().nullable().optional(),
  voteAverage: z.number().optional(),
  releaseDate: z.string().optional(),
  status: z.enum(['planning', 'watching', 'completed', 'dropped']).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await prisma.watchlist.findMany({
    where: { userId: session.user.id },
    orderBy: { addedAt: 'desc' },
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = itemSchema.parse(await req.json())

    const item = await prisma.watchlist.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: session.user.id,
          tmdbId: body.tmdbId,
          mediaType: body.mediaType,
        },
      },
      create: { userId: session.user.id, ...body },
      update: {},
    })

    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}
