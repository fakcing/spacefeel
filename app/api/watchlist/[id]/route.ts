import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // params.id = tmdbId:mediaType
  const [tmdbId, mediaType] = params.id.split(':')

  await prisma.watchlist.deleteMany({
    where: {
      userId: session.user.id,
      tmdbId: parseInt(tmdbId),
      mediaType,
    },
  })

  return NextResponse.json({ deleted: true })
}
