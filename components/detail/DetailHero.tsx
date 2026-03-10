import Image from 'next/image'
import { Movie, TVShow, WatchlistItem } from '@/types/tmdb'
import { getBackdrop, getPoster } from '@/lib/tmdb'
import Badge from '@/components/ui/Badge'
import Rating from '@/components/ui/Rating'
import BookmarkButton from '@/components/ui/BookmarkButton'

interface DetailHeroProps {
  item: Movie | TVShow
  mediaType: 'movie' | 'tv'
}

export default function DetailHero({ item, mediaType }: DetailHeroProps) {
  const title = 'title' in item ? item.title : item.name
  const year = ('release_date' in item ? item.release_date : item.first_air_date)?.slice(0, 4) || ''
  const extra =
    'runtime' in item && item.runtime
      ? `${item.runtime} min`
      : 'number_of_seasons' in item && item.number_of_seasons
      ? `${item.number_of_seasons} Season${item.number_of_seasons !== 1 ? 's' : ''}${
          item.number_of_episodes ? ` · ${item.number_of_episodes} Episodes` : ''
        }`
      : null

  const watchlistItem: WatchlistItem = {
    id: item.id,
    title: title || '',
    poster_path: item.poster_path,
    media_type: mediaType,
    vote_average: item.vote_average,
    release_date: ('release_date' in item ? item.release_date : item.first_air_date) || '',
  }

  return (
    <>
      {/* Backdrop */}
      <div className="relative w-full h-[65vh] overflow-hidden">
        <Image
          src={getBackdrop(item.backdrop_path)}
          alt={title || ''}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      </div>

      {/* Info block */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-24 relative z-10 flex gap-8 items-end pb-8">
        <div className="hidden sm:block flex-shrink-0 w-40 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative aspect-[2/3]">
            <Image
              src={getPoster(item.poster_path)}
              alt={title || ''}
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0 pb-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1 text-[var(--text-primary)]">
            {title}
          </h1>
          {item.tagline && (
            <p className="text-[var(--text-muted)] italic text-sm mb-3">{item.tagline}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {item.genres?.map((g) => (
              <Badge key={g.id}>{g.name}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Rating value={item.vote_average} count={item.vote_count} />
            {year && <span className="text-[var(--text-muted)] text-sm">{year}</span>}
            {extra && <span className="text-[var(--text-muted)] text-sm">{extra}</span>}
            <div className="relative w-8 h-8">
              <BookmarkButton item={watchlistItem} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
