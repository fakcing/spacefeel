'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Film } from 'lucide-react'
import { YaniAnime } from '@/types/yani'
import { WatchlistItem } from '@/types/tmdb'
import { getPosterUrl } from '@/lib/yani'
import { BLUR_DATA_URL } from '@/lib/blurhash'

const BookmarkButton = dynamic(() => import('@/components/ui/BookmarkButton'), { ssr: false })

interface Props {
  item: YaniAnime
}

export default function AniCard({ item }: Props) {
  const router = useRouter()
  const poster = getPosterUrl(item.poster.big || item.poster.medium)
  const [imgError, setImgError] = useState(false)
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
      <div
        className="relative aspect-[2/3] rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]"
        style={{ backgroundColor: 'var(--color-overlay)' }}
      >
        {poster && !imgError ? (
          <Image
            src={poster}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            alt={item.title}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-overlay)' }}>
            <Film size={24} style={{ color: 'var(--color-text-subtle)' }} />
          </div>
        )}

        <BookmarkButton item={watchlistItem} />

        {/* Gradient */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.38) 38%, transparent 62%)' }}
        />

        {/* Hover border ring */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.16)' }}
        />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-2.5 z-20">
          {item.rating.average > 0 && (
            <div className="inline-flex items-center gap-1 mb-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-amber-400"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
              ★ {item.rating.average.toFixed(1)}
            </div>
          )}
          <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
            {item.title}
          </p>
          <p className="text-white/50 text-[10px] mt-0.5" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            {item.year}{item.type?.name ? ` · ${item.type.name}` : ''}
          </p>
        </div>
      </div>
    </Link>
  )
}
