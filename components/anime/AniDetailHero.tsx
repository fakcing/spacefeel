'use client'

import Image from 'next/image'
import { Play, Plus, BookmarkCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useWatchlistStore } from '@/store/watchlistStore'
import { useAuthModalStore } from '@/store/authModalStore'
import { useAniPlayerStore } from '@/store/aniPlayerStore'
import { YaniAnime, YaniVideo } from '@/types/yani'
import { getPosterUrl } from '@/lib/yani'
import Badge from '@/components/ui/Badge'

interface Props {
  title: YaniAnime
  videos: YaniVideo[]
}

export default function AniDetailHero({ title, videos }: Props) {
  const t = useTranslations('detail')
  const { data: session } = useSession()
  const { toggleItem, isInWatchlist } = useWatchlistStore()
  const { open: openAuthModal } = useAuthModalStore()
  const { openPlayer } = useAniPlayerStore()

  const poster = getPosterUrl(title.poster.big || title.poster.medium)
  const backdrop = getPosterUrl(title.poster.huge || title.poster.fullsize || title.poster.big)
  const isBookmarked = isInWatchlist(title.anime_id)

  const handlePlay = () => {
    openPlayer({ videos, titleName: title.title, shikimoriId: title.anime_id })
  }

  const handleWatchlist = () => {
    if (!session) { openAuthModal(); return }
    toggleItem({
      id: title.anime_id,
      poster_path: poster,
      media_type: 'anime',
      vote_average: title.rating.average,
      release_date: String(title.year),
      slug: title.anime_url,
    }, true)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="relative w-full h-[40vh] sm:h-[55vh] overflow-hidden">
        <Image
          src={backdrop}
          alt={title.title}
          fill
          className="object-cover object-top scale-110 blur-sm"
          priority
          quality={70}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
      </div>

      {/* Info block */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row gap-5 sm:gap-8 items-start sm:items-end pb-6 sm:pb-8">
        {/* Mobile poster */}
        <div className="sm:hidden w-full flex justify-center">
          <div className="w-36 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
            <div className="relative aspect-[2/3]">
              <Image src={poster} alt={title.title} fill className="object-cover" priority sizes="144px" />
            </div>
          </div>
        </div>

        {/* Desktop poster */}
        <div className="hidden sm:block flex-shrink-0 w-40 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative aspect-[2/3]">
            <Image src={poster} alt={title.title} fill className="object-cover" priority sizes="160px" />
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full pb-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 text-center sm:text-left" style={{ color: 'var(--color-text)' }}>
            {title.title}
          </h1>

          {/* Genres */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
            {title.genres.slice(0, 5).map(g => (
              <Badge key={g.id}>{g.title}</Badge>
            ))}
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-center sm:justify-start flex-wrap gap-x-4 gap-y-1 mb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {title.year && <span>{title.year}</span>}
            {title.type?.name && <span>{title.type.name}</span>}
            {(title.episodes?.count > 0 || title.episodes?.aired > 0) && (
              <span>{title.episodes.count > 0 ? title.episodes.count : title.episodes.aired} {t('episodes')}</span>
            )}
            {title.rating.average > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                {title.rating.average.toFixed(1)}
              </span>
            )}
          </div>

          {/* Action buttons */}
          {videos.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handlePlay}
                className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-full px-6 py-3 sm:py-2.5 hover:bg-gray-800 dark:hover:bg-white/90 transition-colors text-sm w-full sm:w-auto cursor-pointer"
              >
                <Play size={16} className="fill-white dark:fill-black" />
                {t('playNow')}
              </button>
              <button
                onClick={handleWatchlist}
                className={`flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-3 sm:py-2.5 text-sm transition-colors border w-full sm:w-auto ${
                  isBookmarked
                    ? 'bg-black/15 dark:bg-white/15 border-black/30 dark:border-white/30 text-gray-900 dark:text-white'
                    : 'border-black/20 dark:border-white/20 text-gray-900 dark:text-white hover:bg-black/10 dark:hover:bg-white/10'
                }`}
                style={isBookmarked ? undefined : { borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                {isBookmarked ? (
                  <><BookmarkCheck size={16} /> {t('inWatchlist')}</>
                ) : (
                  <><Plus size={16} /> {t('watchlist')}</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
