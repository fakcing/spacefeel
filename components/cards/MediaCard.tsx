import Link from 'next/link'
import Image from 'next/image'
import { Movie, TVShow, WatchlistItem } from '@/types/tmdb'
import { getPoster } from '@/lib/tmdb'
import BookmarkButton from '@/components/ui/BookmarkButton'

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
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.03] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <Image
            src={poster}
            alt={title || 'Media'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
          <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold text-white">
            {item.vote_average > 0 ? item.vote_average.toFixed(1) : 'N/A'}
          </div>
          <BookmarkButton item={watchlistItem} />
        </div>
        <div className="mt-2 px-0.5">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{year}</p>
        </div>
      </div>
    </Link>
  )
}
