'use client'

import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Movie, TVShow, WatchlistItem } from '@/types/tmdb'
import { getPoster } from '@/lib/tmdb'

const BookmarkButton = dynamic(() => import('@/components/ui/BookmarkButton'), { ssr: false })

interface MediaCardProps {
  item: Movie | TVShow
  mediaType: 'movie' | 'tv'
}

export default function MediaCard({ item, mediaType }: MediaCardProps) {
  const title = 'title' in item ? item.title : item.name
  const year = ('release_date' in item ? item.release_date : item.first_air_date)?.slice(0, 4) || ''
  const poster = getPoster(item.poster_path)

  const watchlistItem: WatchlistItem = {
    id: item.id,
    title: title || '',
    poster_path: item.poster_path,
    media_type: mediaType,
    vote_average: item.vote_average,
    release_date: ('release_date' in item ? item.release_date : item.first_air_date) || '',
  }

  return (
    <Link href={`/${mediaType}/${item.id}`}>
      <div className="group cursor-pointer">
        <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.03] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <Image
            src={poster}
            alt={title || 'Media'}
            fill
            className="object-cover"
            sizes="180px"
          />

          {/* Always-visible bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Rating pill — bottom left, above title */}
          <div className="absolute bottom-10 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold text-white">
            {item.vote_average > 0 ? item.vote_average.toFixed(1) : 'N/A'}
          </div>

          {/* Title + year — inside image at bottom */}
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-sm font-semibold text-white truncate leading-tight">{title}</p>
            <p className="text-xs text-white/60 mt-0.5">{year}</p>
          </div>

          {/* Bookmark button — top right */}
          <BookmarkButton item={watchlistItem} />
        </div>
      </div>
    </Link>
  )
}
