import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export interface WatchProgress {
  season: number
  episode: number
}

export async function getWatchProgress(
  tmdbId: number,
  mediaType: string
): Promise<WatchProgress | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const latest = await prisma.watchHistory.findFirst({
    where: { userId: session.user.id, tmdbId, mediaType },
    orderBy: { watchedAt: 'desc' },
    select: { season: true, episode: true },
  })

  if (!latest?.season || !latest?.episode) return null
  return { season: latest.season, episode: latest.episode }
}
