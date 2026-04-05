import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  tmdbId: z.number(),
  mediaType: z.string(),
  status: z.enum(['planning', 'watching', 'completed', 'dropped']),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = schema.parse(await req.json())

    await prisma.watchlist.update({
      where: {
        userId_tmdbId_mediaType: {
          userId: session.user.id,
          tmdbId: body.tmdbId,
          mediaType: body.mediaType,
        },
      },
      data: { status: body.status },
    })

    return NextResponse.json({ updated: true })
  } catch {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}
