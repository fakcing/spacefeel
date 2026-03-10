'use client'

import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Film } from 'lucide-react'
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
          {poster ? (
            <Image src={poster} fill className="object-cover" alt={title || 'Media'} sizes="180px" />
          ) : (
            <div className="w-full h-full bg-white/[0.08] flex items-center justify-center">
              <Film size={32} className="text-white/20" />
            </div>
          )}

          {/* Always-visible bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Rating + title + year — inside image at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="inline-flex items-center bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-white mb-1">
              {item.vote_average > 0 ? item.vote_average.toFixed(1) : 'N/A'}
            </div>
            <p className="text-sm font-semibold text-white truncate leading-tight">{title}</p>
            <p className="text-xs text-white/60">{year}</p>
          </div>

          {/* Bookmark button — top right */}
          <BookmarkButton item={watchlistItem} />
        </div>
      </div>
    </Link>
  )
}
