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

/**
 * Optimized MediaCard with:
 * - Priority loading for above-fold content
 * - Proper srcset sizes for responsive images
 * - Blur placeholder for instant visual feedback
 * - Lazy loading for below-fold content
 */
export default function MediaCard({ item, mediaType, priority = false }: MediaCardProps) {
  const title = 'title' in item ? item.title : item.name
  const year = ('release_date' in item ? item.release_date : item.first_air_date)?.slice(0, 4) || ''
  // Use smaller image for non-priority cards
  const poster = getPoster(item.poster_path, priority ? 'w342' : 'w185')
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
      <div
        className="group cursor-pointer"
        onMouseEnter={() => router.prefetch(href)}
      >
        <div className="relative w-full aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-overlay)' }}>
          {poster && !imgError ? (
            <Image
              src={poster}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
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

          {/* Always-visible bottom gradient */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.2) 55%, transparent 75%)',
            }}
          />

          {/* Rating + title + year — inside image at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-2.5 z-20">
            <div className="inline-flex items-center bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white mb-1">
              ★ {item.vote_average > 0 ? item.vote_average.toFixed(1) : 'N/A'}
            </div>
            <p
              className="text-white text-xs font-semibold leading-tight line-clamp-2"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)' }}
            >{title}</p>
            <p
              className="text-white/60 text-[10px] mt-0.5"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
            >{year}</p>
          </div>

          {/* Bookmark button — top right */}
          <BookmarkButton item={watchlistItem} />
        </div>
      </div>
    </Link>
  )
}
