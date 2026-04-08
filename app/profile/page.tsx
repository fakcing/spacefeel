import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { User, Bookmark, Star, Clock, Film, Settings, ChevronRight } from 'lucide-react'
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
      take: 12,
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
    <div className="min-h-screen">
      {/* Profile header */}
      <div className="relative pt-20 pb-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, var(--color-overlay) 0%, transparent 100%)',
        }} />
        <div className="relative px-4 md:px-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
              {session.user.image ? (
                <Image src={session.user.image} width={96} height={96} className="object-cover" alt="" />
              ) : (
                <User size={36} style={{ color: 'var(--color-text-muted)' }} />
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.05em' }}>
                {session.user.name || t('account')}
              </h1>
              <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{session.user.email}</p>
              {memberSince && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-subtle)' }}>
                  {t('memberSince')} {memberSince}
                </p>
              )}
            </div>
            {/* Settings link */}
            <Link href="/settings" className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
            >
              <Settings size={15} />
              <span className="hidden sm:inline">{t('settings') || 'Settings'}</span>
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: <Bookmark size={18} />, value: watchlistItems.length, label: t('watchlistCount'), href: '/watchlist' },
              { icon: <Star size={18} />,     value: ratingsCount,          label: t('ratingsCount'),  href: undefined },
              { icon: <Clock size={18} />,    value: historyItems.length,   label: t('historyCount'),  href: '/history' },
            ].map((stat, i) => (
              stat.href ? (
                <Link key={i} href={stat.href} className="group rounded-2xl p-4 flex flex-col items-center gap-1.5 transition-colors"
                  style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={undefined}
                >
                  <span style={{ color: 'var(--color-text-subtle)' }}>{stat.icon}</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{stat.value}</span>
                  <span className="text-xs text-center flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    {stat.label}
                    <ChevronRight size={10} className="opacity-50" />
                  </span>
                </Link>
              ) : (
                <div key={i} className="rounded-2xl p-4 flex flex-col items-center gap-1.5"
                  style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-subtle)' }}>{stat.icon}</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{stat.value}</span>
                  <span className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-4xl mx-auto pb-24 space-y-8">
        {/* Watchlist status breakdown */}
        {watchlistItems.length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-subtle)' }}>
              {t('byStatus')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.entries(statusCounts) as [string, number][]).map(([status, count]) => (
                <div key={status} className="rounded-2xl p-4 flex flex-col items-center gap-1"
                  style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
                  <span className="text-2xl font-bold" style={{ color: statusColors[status] }}>{count}</span>
                  <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                    {t(`status${status.charAt(0).toUpperCase() + status.slice(1)}` as 'statusPlanning')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent watch history */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>
              {t('recentHistory')}
            </p>
            {historyItems.length > 0 && (
              <Link href="/history" className="text-sm transition-colors flex items-center gap-1"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={undefined}
              >
                {t('viewAll') || 'View all'} <ChevronRight size={14} />
              </Link>
            )}
          </div>
          {historyItems.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
              <Film size={32} className="mx-auto mb-2 opacity-20" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('noHistory')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {historyItems.map((item, i) => {
                const href = item.mediaType === 'movie' ? `/movies/${item.tmdbId}` : `/tv/${item.tmdbId}`
                const poster = item.posterPath ? getPoster(item.posterPath, 'w185') : null
                return (
                  <Link key={i} href={href} className="group">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden"
                      style={{ backgroundColor: 'var(--color-overlay)' }}>
                      {poster ? (
                        <Image
                          src={poster}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          alt=""
                          sizes="120px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={16} style={{ color: 'var(--color-text-subtle)' }} />
                        </div>
                      )}
                      {item.season && item.episode && (
                        <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-[9px] text-white font-semibold bg-gradient-to-t from-black/80 to-transparent text-center">
                          S{item.season}E{item.episode}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
