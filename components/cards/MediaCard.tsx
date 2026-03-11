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
        className="group cursor-pointer overflow-visible"
        onMouseEnter={() => router.prefetch(href)}
      >
        <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:shadow-2xl shadow-lg">
          {poster && !imgError ? (
            <Image
              src={poster}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-110"
              alt={title || 'Media'}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
              onError={() => setImgError(true)}
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              decoding={priority ? 'sync' : 'async'}
              fetchPriority={priority ? 'high' : 'auto'}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1' }}
            />
          ) : (
            <div className="w-full h-full bg-white/[0.08] flex items-center justify-center">
              <Film size={24} className="text-white/20" />
            </div>
          )}

          {/* Animated gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.2) 55%, transparent 75%)',
            }}
          />

          {/* Rating + title + year — inside image at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-2.5 z-20 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-sm rounded-full px-2 md:px-2.5 py-1 text-[10px] md:text-xs font-bold text-white mb-1.5 shadow-lg">
              <span>★</span>
              {item.vote_average > 0 ? item.vote_average.toFixed(1) : 'N/A'}
            </div>
            <p
              className="text-xs md:text-sm font-bold text-white truncate leading-tight drop-shadow-lg"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
            >{title}</p>
            <p
              className="text-[10px] md:text-xs text-white/80 mt-0.5 font-medium"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
            >{year}</p>
          </div>

          {/* Hover shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 2s infinite',
              }}
            />
          </div>

          {/* Bookmark button — top right */}
          <BookmarkButton item={watchlistItem} />
        </div>
      </div>
    </Link>
  )
}
