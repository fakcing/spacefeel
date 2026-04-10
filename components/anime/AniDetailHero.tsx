'use client'

import Image from 'next/image'
import { Play, Plus, BookmarkCheck, Star } from 'lucide-react'
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
    if (!session) { openAuthModal(); return }
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
      <div className="relative w-full h-[45vh] sm:h-[58vh] overflow-hidden">
        <Image
          src={backdrop}
          alt={title.title}
          fill
          className="object-cover object-top"
          priority
          quality={80}
          sizes="100vw"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--color-bg) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.25) 0%, transparent 60%)' }} />
      </div>

      {/* Info block */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 sm:-mt-28 relative z-10 flex flex-col sm:flex-row gap-5 sm:gap-8 items-start sm:items-end pb-6 sm:pb-10">

        {/* Mobile poster */}
        <div className="sm:hidden w-full flex justify-center">
          <div className="w-36 rounded-xl overflow-hidden flex-shrink-0" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="relative aspect-[2/3]">
              <Image src={poster} alt={title.title} fill className="object-cover" priority sizes="144px" />
            </div>
          </div>
        </div>

        {/* Desktop poster */}
        <div className="hidden sm:block flex-shrink-0 w-44 rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="relative aspect-[2/3]">
            <Image src={poster} alt={title.title} fill className="object-cover" priority sizes="176px" />
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full pb-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 text-center sm:text-left" style={{ color: 'var(--color-text)' }}>
            {title.title}
          </h1>

          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
            {title.genres.slice(0, 5).map(g => (
              <Badge key={g.id}>{g.title}</Badge>
            ))}
          </div>

          <div className="flex items-center justify-center sm:justify-start flex-wrap gap-x-4 gap-y-1 mb-5 text-sm">
            {title.rating.average > 0 && (
              <span className="flex items-center gap-1 font-semibold text-amber-400">
                <Star size={13} className="fill-amber-400" />
                {title.rating.average.toFixed(1)}
              </span>
            )}
            {title.year && <span style={{ color: 'var(--color-text-muted)' }}>{title.year}</span>}
            {title.type?.name && <span style={{ color: 'var(--color-text-muted)' }}>{title.type.name}</span>}
            {(title.episodes?.count > 0 || title.episodes?.aired > 0) && (
              <span style={{ color: 'var(--color-text-muted)' }}>
                {title.episodes.count > 0 ? title.episodes.count : title.episodes.aired} {t('episodes')}
              </span>
            )}
          </div>

          {videos.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handlePlay}
                className="flex items-center justify-center gap-2 font-semibold rounded-xl px-6 py-3 sm:py-2.5 text-sm transition-all w-full sm:w-auto cursor-pointer hover:opacity-90 active:scale-95"
                style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}
              >
                <Play size={15} fill="currentColor" />
                {t('playNow')}
              </button>
              <button
                onClick={handleWatchlist}
                className="flex items-center justify-center gap-2 font-semibold rounded-xl px-6 py-3 sm:py-2.5 text-sm transition-all w-full sm:w-auto cursor-pointer hover:opacity-80 active:scale-95"
                style={{
                  backgroundColor: isBookmarked ? 'var(--color-overlay)' : 'transparent',
                  border: '1px solid var(--color-border-strong)',
                  color: 'var(--color-text)',
                }}
              >
                {isBookmarked
                  ? <><BookmarkCheck size={16} /> {t('inWatchlist')}</>
                  : <><Plus size={16} /> {t('watchlist')}</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
