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
  const poster = getPoster(item.poster_path, 'w342')
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
        <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.03] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          {poster && !imgError ? (
            <Image
              src={poster}
              fill
              className="object-cover transition-opacity duration-500"
              alt={title || 'Media'}
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
              onError={() => setImgError(true)}
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1' }}
            />
          ) : (
            <div className="w-full h-full bg-white/[0.08] flex items-center justify-center">
              <Film size={32} className="text-white/20" />
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
          <div className="absolute bottom-0 left-0 right-0 p-2 z-20">
            <div className="inline-flex items-center bg-black/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-white mb-1">
              {item.vote_average > 0 ? item.vote_average.toFixed(1) : 'N/A'}
            </div>
            <p
              className="text-sm font-semibold text-white truncate leading-tight"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)' }}
            >{title}</p>
            <p
              className="text-xs text-white/60"
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
