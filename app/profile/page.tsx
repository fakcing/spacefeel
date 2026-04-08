import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { User, Bookmark, Star, Clock, Film } from 'lucide-react'
import { getPoster } from '@/lib/tmdbImages'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const t = await getTranslations('profile')

  const [watchlistItems, ratingsCount, historyItems, userRecord] = await Promise.all([
    prisma.watchlist.findMany({
      where: { userId: session.user.id },
      select: { status: true },
    }),
    prisma.rating.count({ where: { userId: session.user.id } }),
    prisma.watchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { watchedAt: 'desc' },
      take: 8,
      select: { tmdbId: true, mediaType: true, posterPath: true, season: true, episode: true, watchedAt: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true },
    }),
  ])

  const statusCounts = {
    planning:  watchlistItems.filter(i => (i.status ?? 'planning') === 'planning').length,
    watching:  watchlistItems.filter(i => i.status === 'watching').length,
    completed: watchlistItems.filter(i => i.status === 'completed').length,
    dropped:   watchlistItems.filter(i => i.status === 'dropped').length,
  }

  const memberSince = userRecord?.createdAt
    ? new Intl.DateTimeFormat('default', { year: 'numeric', month: 'long' }).format(userRecord.createdAt)
    : null

  const statusColors: Record<string, string> = {
    planning:  'var(--color-text-muted)',
    watching:  '#3b82f6',
    completed: '#22c55e',
    dropped:   '#ef4444',
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="pt-10 mb-10">
        {/* Avatar + Info */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
            {session.user.image ? (
              <Image src={session.user.image} width={80} height={80} className="object-cover" alt="" />
            ) : (
              <User size={32} style={{ color: 'var(--color-text-muted)' }} />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
              {session.user.name || t('account')}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{session.user.email}</p>
            {memberSince && (
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-subtle)' }}>
                {t('memberSince')} {memberSince}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-8">
          {[
            { icon: <Bookmark size={18} />, value: watchlistItems.length, label: t('watchlistCount') },
            { icon: <Star size={18} />,     value: ratingsCount,          label: t('ratingsCount') },
            { icon: <Clock size={18} />,    value: historyItems.length,   label: t('historyCount') },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl p-4 flex flex-col items-center gap-1.5"
              style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-text-subtle)' }}>{stat.icon}</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{stat.value}</span>
              <span className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Watchlist status breakdown */}
        {watchlistItems.length > 0 && (
          <div className="mb-8 rounded-2xl p-5"
            style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-subtle)' }}>
              {t('byStatus')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.entries(statusCounts) as [string, number][]).map(([status, count]) => (
                <div key={status} className="text-center">
                  <span className="text-xl font-bold" style={{ color: statusColors[status] }}>{count}</span>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {t(`status${status.charAt(0).toUpperCase() + status.slice(1)}` as 'statusPlanning')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent history */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-subtle)' }}>
            {t('recentHistory')}
          </p>
          {historyItems.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
              <Film size={32} className="mx-auto mb-2 opacity-20" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('noHistory')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
              {historyItems.map((item, i) => {
                const href = item.mediaType === 'movie' ? `/movies/${item.tmdbId}` : `/tv/${item.tmdbId}`
                const poster = item.posterPath ? getPoster(item.posterPath, 'w185') : null
                return (
                  <Link key={i} href={href} className="group">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden"
                      style={{ backgroundColor: 'var(--color-overlay)' }}>
                      {poster ? (
                        <Image
                          src={poster}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          alt=""
                          sizes="120px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={16} style={{ color: 'var(--color-text-subtle)' }} />
                        </div>
                      )}
                      {item.season && item.episode && (
                        <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[9px] text-white font-semibold bg-black/60 text-center">
                          S{item.season}E{item.episode}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
