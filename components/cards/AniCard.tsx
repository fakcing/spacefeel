'use client'

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { YaniAnime } from '@/types/yani'
import { WatchlistItem } from '@/types/tmdb'
import { getPosterUrl } from '@/lib/yani'
import { BLUR_DATA_URL } from '@/lib/blurhash'
import { useTranslations } from 'next-intl'

const BookmarkButton = dynamic(() => import('@/components/ui/BookmarkButton'), { ssr: false })

interface Props {
  item: YaniAnime
}

export default function AniCard({ item }: Props) {
  const t = useTranslations('player')
  const router = useRouter()
  const poster = getPosterUrl(item.poster.big || item.poster.medium)
  const href = `/anime/${item.anime_url}`

  const watchlistItem: WatchlistItem = {
    id: item.anime_id,
    poster_path: item.poster.medium || item.poster.big || null,
    media_type: 'anime',
    vote_average: item.rating.average,
    release_date: item.year.toString(),
    slug: item.anime_url,
  }

  return (
    <Link
      href={href}
      onMouseEnter={() => router.prefetch(href)}
      className="group relative block w-full"
    >
      <div className="relative aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-overlay)' }}>
        <Image
          src={poster}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          alt={item.title}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          loading="lazy"
        />

        {/* Bookmark button — top right */}
        <BookmarkButton item={watchlistItem} />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.2) 55%, transparent 75%)',
          }}
        />

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-2.5 z-20">
          <div className="inline-flex items-center bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white mb-1">
            ★ {item.rating.average.toFixed(1)}
          </div>
          <p
            className="text-white text-xs font-semibold leading-tight line-clamp-2"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)' }}
          >{item.title}</p>
          <p
            className="text-white/60 text-[10px] mt-0.5"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
          >
            {item.year} • {item.type?.name}
          </p>
          {item.translates && item.translates.length > 0 && (
            <p
              className="text-white/35 text-[10px] mt-0.5 truncate"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
            >
              {t('dubbing')}: {item.translates.slice(0, 2).map(tr => tr.title).filter(Boolean).join(', ')}
              {item.translates.length > 2 ? ` +${item.translates.length - 2}` : ''}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
