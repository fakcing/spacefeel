'use client'

import Image from 'next/image'
import { Play, Plus, BookmarkCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Movie, TVShow, WatchlistItem } from '@/types/tmdb'
import { getBackdrop, getPoster } from '@/lib/tmdbImages'
import Badge from '@/components/ui/Badge'
import Rating from '@/components/ui/Rating'
import { useSession } from 'next-auth/react'
import { useWatchlistStore } from '@/store/watchlistStore'
import { useAuthModalStore } from '@/store/authModalStore'
import { useMediaPlayerStore } from '@/store/mediaPlayerStore'

interface DetailHeroProps {
  item: Movie | TVShow
  mediaType: 'movie' | 'tv'
}

export default function DetailHero({ item, mediaType }: DetailHeroProps) {
  const t = useTranslations('detail')
  const title = 'title' in item ? item.title : item.name
  const year = ('release_date' in item ? item.release_date : item.first_air_date)?.slice(0, 4) || ''
  const extra =
    'runtime' in item && item.runtime
      ? `${item.runtime} min`
      : 'number_of_seasons' in item && item.number_of_seasons
      ? `${item.number_of_seasons} Season${item.number_of_seasons !== 1 ? 's' : ''}${
          item.number_of_episodes ? ` \u00b7 ${item.number_of_episodes} Episodes` : ''
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

  const handlePlay = () => {
    if (!session) { openAuthModal(); return }
    openPlayer({
      mediaType,
      item,
      tmdbId: item.id,
      season: 1,
      episode: 1,
    })
  }

  const backdrop = getBackdrop(item.backdrop_path)
  const poster = getPoster(item.poster_path, 'w342')

  return (
    <>
      {/* Backdrop */}
      <div className="relative w-full h-[50vh] sm:h-[65vh] overflow-hidden">
        {backdrop && (
          <Image
            src={backdrop}
            alt={title || ''}
            fill
            className="object-cover"
            priority
            quality={85}
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      </div>

      {/* Info block */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-20 sm:-mt-24 relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-end pb-6 sm:pb-8">
        {/* Mobile poster - shown only on mobile */}
        <div className="sm:hidden w-full flex justify-center">
          <div className="w-40 rounded-xl overflow-hidden shadow-2xl">
            <div className="relative aspect-[2/3]">
              {poster && (
                <Image
                  src={poster}
                  alt={title || ''}
                  fill
                  className="object-cover"
                  priority
                  sizes="160px"
                />
              )}
            </div>
          </div>
        </div>

        {/* Desktop poster - hidden on mobile */}
        <div className="hidden sm:block flex-shrink-0 w-40 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative aspect-[2/3]">
            {poster && (
              <Image
                src={poster}
                alt={title || ''}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 40vw, 160px"
              />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 pb-2 w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1 text-[var(--text-primary)] text-center sm:text-left">
            {title}
          </h1>
          {item.tagline && (
            <p className="text-[var(--text-muted)] italic text-sm mb-3 text-center sm:text-left">{item.tagline}</p>
          )}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
            {item.genres?.map((g) => (
              <Badge key={g.id}>{g.name}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap mb-4">
            <Rating value={item.vote_average} count={item.vote_count} />
            {year && <span className="text-[var(--text-muted)] text-sm">{year}</span>}
            {extra && <span className="text-[var(--text-muted)] text-sm">{extra}</span>}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handlePlay}
              className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full px-6 py-3 sm:py-2.5 hover:bg-black/80 dark:hover:bg-white/90 transition-colors text-sm w-full sm:w-auto cursor-pointer"
            >
              <Play size={16} className="fill-white dark:fill-black" />
              {t('playNow')}
            </button>
            <button
              onClick={handleWatchlist}
              className={`flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-3 sm:py-2.5 text-sm transition-colors border w-full sm:w-auto ${
                isBookmarked
                  ? 'bg-black/15 dark:bg-white/15 border-black/30 dark:border-white/30 text-gray-900 dark:text-white'
                  : 'bg-transparent border-black/20 dark:border-white/20 text-gray-900 dark:text-white hover:bg-black/10 dark:hover:bg-white/10'
              }`}
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
