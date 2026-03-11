'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AniLibriaTitle } from '@/types/anilibria'
import { getPosterUrl } from '@/lib/anilibria'
import { BLUR_DATA_URL } from '@/lib/blurhash'

interface Props {
  item: AniLibriaTitle
}

export default function AniCard({ item }: Props) {
  const router = useRouter()
  const poster = getPosterUrl(item.posters.medium.url)
  const title = item.names.ru || item.names.en

  return (
    <Link
      href={`/anime/${item.id}`}
      onMouseEnter={() => router.prefetch(`/anime/${item.id}`)}
      className="group relative block w-full"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
        <Image
          src={poster}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          alt={title}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="(max-width: 640px) 33vw, 16vw"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Favorites count */}
        <div className="absolute bottom-10 left-2 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-xs font-semibold text-white">
          ♥ {(item.in_favorites / 1000).toFixed(1)}K
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-white text-xs font-medium leading-tight line-clamp-2">{title}</p>
          <p className="text-white/50 text-[10px] mt-0.5">
            {item.season?.year} • {item.type?.string}
          </p>
        </div>
      </div>
    </Link>
  )
}
