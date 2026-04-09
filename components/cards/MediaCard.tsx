'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Film } from 'lucide-react'
import { Movie, TVShow, WatchlistItem } from '@/types/tmdb'
import { getPoster } from '@/lib/tmdbImages'
import { BLUR_DATA_URL } from '@/lib/blurhash'

const BookmarkButton = dynamic(() => import('@/components/ui/BookmarkButton'), { ssr: false })

interface MediaCardProps {
  item: Movie | TVShow
  mediaType: 'movie' | 'tv'
  priority?: boolean
}

export default function MediaCard({ item, mediaType, priority = false }: MediaCardProps) {
  const title = 'title' in item ? item.title : item.name
  const year = ('release_date' in item ? item.release_date : item.first_air_date)?.slice(0, 4) || ''
  const poster = getPoster(item.poster_path, priority ? 'w500' : 'w342')
  const [imgError, setImgError] = useState(false)
  const router = useRouter()

  const watchlistItem: WatchlistItem = {
    id: item.id,
    poster_path: item.poster_path,
    media_type: mediaType,
    vote_average: item.vote_average,
    release_date: ('release_date' in item ? item.release_date : item.first_air_date) || '',
  }

  const href = mediaType === 'movie' ? `/movies/${item.id}` : `/tv/${item.id}`

  return (
    <Link href={href}>
      <div className="group cursor-pointer" onMouseEnter={() => router.prefetch(href)}>
        <div
          className="relative w-full aspect-[2/3] rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]"
          style={{ backgroundColor: 'var(--color-overlay)' }}
        >
          {poster && !imgError ? (
            <Image
              src={poster}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              alt={title || 'Media'}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
              onError={() => setImgError(true)}
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              decoding={priority ? 'sync' : 'async'}
              fetchPriority={priority ? 'high' : 'auto'}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-overlay)' }}>
              <Film size={24} style={{ color: 'var(--color-text-subtle)' }} />
            </div>
          )}

          {/* Gradient — heavier at bottom only */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.38) 38%, transparent 62%)' }}
          />

          {/* Hover border ring */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.16)' }}
          />

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-2.5 z-20">
            {item.vote_average > 0 && (
              <div className="inline-flex items-center gap-1 mb-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-amber-400"
                style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
                ★ {item.vote_average.toFixed(1)}
              </div>
            )}
            <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
              {title}
            </p>
            {year && (
              <p className="text-white/50 text-[10px] mt-0.5" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                {year}
              </p>
            )}
          </div>

          <BookmarkButton item={watchlistItem} />
        </div>
      </div>
    </Link>
  )
}
