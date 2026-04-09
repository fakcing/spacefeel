'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Play, Plus, BookmarkCheck, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Movie, TVShow, WatchlistItem } from '@/types/tmdb'
import { getBackdrop, getPoster } from '@/lib/tmdbImages'
import Badge from '@/components/ui/Badge'
import Rating from '@/components/ui/Rating'
import { useSession } from 'next-auth/react'
import { useWatchlistStore } from '@/store/watchlistStore'
import { useAuthModalStore } from '@/store/authModalStore'
import { useMediaPlayerStore } from '@/store/mediaPlayerStore'
import type { WatchProgress } from '@/lib/watchProgress'

interface DetailHeroProps {
  item: Movie | TVShow
  mediaType: 'movie' | 'tv'
  progress?: WatchProgress | null
}

export default function DetailHero({ item, mediaType, progress }: DetailHeroProps) {
  const t = useTranslations('detail')
  const title = 'title' in item ? item.title : item.name
  const year = ('release_date' in item ? item.release_date : item.first_air_date)?.slice(0, 4) || ''
  const extra =
    'runtime' in item && item.runtime
      ? `${item.runtime} min`
      : 'number_of_seasons' in item && item.number_of_seasons
      ? `${item.number_of_seasons} Season${item.number_of_seasons !== 1 ? 's' : ''}${
          item.number_of_episodes ? ` · ${item.number_of_episodes} ep.` : ''
        }`
      : null

  const watchlistItem: WatchlistItem = {
    id: item.id,
    poster_path: item.poster_path,
    media_type: mediaType,
    vote_average: item.vote_average,
    release_date: ('release_date' in item ? item.release_date : item.first_air_date) || '',
  }

  const { toggleItem, isInWatchlist } = useWatchlistStore()
  const { open: openAuthModal } = useAuthModalStore()
  const { data: session } = useSession()
  const { openPlayer } = useMediaPlayerStore()
  const isBookmarked = isInWatchlist(item.id)

  const handleWatchlist = () => {
    if (!session) { openAuthModal(); return }
    toggleItem(watchlistItem, true)
  }

  const handlePlay = (fromStart = false) => {
    if (!session) { openAuthModal(); return }
    const season = (!fromStart && progress?.season) || 1
    const episode = (!fromStart && progress?.episode) || 1
    openPlayer({ mediaType, item, tmdbId: item.id, season, episode })
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tmdbId: item.id,
        mediaType,
        posterPath: item.poster_path,
        season: mediaType === 'tv' ? season : null,
        episode: mediaType === 'tv' ? episode : null,
      }),
    })
  }

  const backdrop = getBackdrop(item.backdrop_path)
  const poster = getPoster(item.poster_path, 'w500')

  return (
    <>
      <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden">
        {backdrop ? (
          <Image
            src={backdrop}
            alt={title || ''}
            fill
            className="object-cover"
            priority
            quality={85}
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-overlay)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 60%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 sm:-mt-28 relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-end pb-6 sm:pb-10">
        <div className="sm:hidden w-full flex justify-center">
          <div className="w-36 rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/10">
            <div className="relative aspect-[2/3]">
              {poster && (
                <Image src={poster} alt={title || ''} fill className="object-cover" priority sizes="144px" />
              )}
            </div>
          </div>
        </div>

        <div className="hidden sm:block flex-shrink-0 w-44 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">
          <div className="relative aspect-[2/3]">
            {poster && (
              <Image src={poster} alt={title || ''} fill className="object-cover" priority sizes="176px" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 pb-2 w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1 text-center sm:text-left" style={{ color: 'var(--color-text)' }}>
            {title}
          </h1>
          {item.tagline && (
            <p className="text-sm italic mb-3 text-center sm:text-left" style={{ color: 'var(--color-text-muted)' }}>{item.tagline}</p>
          )}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
            {item.genres?.map(g => (
              <Link key={g.id} href={`/${mediaType === 'movie' ? 'movies' : 'tv'}?genres=${g.id}`}>
                <Badge className="hover:border-[var(--color-border-strong)] cursor-pointer">{g.name}</Badge>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap mb-5">
            <Rating value={item.vote_average} count={item.vote_count} />
            {year && <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{year}</span>}
            {extra && <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{extra}</span>}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => handlePlay(false)}
              className="flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-3 sm:py-2.5 transition-all text-sm w-full sm:w-auto cursor-pointer hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}
            >
              <Play size={16} style={{ fill: 'var(--color-bg)' }} />
              {progress && mediaType === 'tv'
                ? `${t('continue')} S${progress.season}E${progress.episode}`
                : t('playNow')}
            </button>
            {progress && mediaType === 'tv' && (
              <button
                onClick={() => handlePlay(true)}
                className="flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-3 sm:py-2.5 text-sm transition-all w-full sm:w-auto cursor-pointer hover:opacity-80 active:scale-95"
                style={{ border: '1px solid var(--color-border-strong)', color: 'var(--color-text-muted)' }}
              >
                <RotateCcw size={14} />
                {t('playNow')}
              </button>
            )}
            <button
              onClick={handleWatchlist}
              className="flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-3 sm:py-2.5 text-sm transition-all w-full sm:w-auto cursor-pointer hover:opacity-80 active:scale-95"
              style={{
                backgroundColor: isBookmarked ? 'var(--color-overlay)' : 'transparent',
                border: '1px solid var(--color-border-strong)',
                color: 'var(--color-text)',
              }}
            >
              {isBookmarked ? (
                <><BookmarkCheck size={16} /> {t('inWatchlist')}</>
              ) : (
                <><Plus size={16} /> {t('watchlist')}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
