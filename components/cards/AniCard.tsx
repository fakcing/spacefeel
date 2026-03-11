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
  const poster = getPosterUrl(item.poster.optimized?.src || item.poster.src)
  const title = item.name.main || item.name.english
  const href = `/anime/${item.alias}`

  return (
    <Link
      href={href}
      onMouseEnter={() => router.prefetch(href)}
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
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.2) 55%, transparent 75%)',
          }}
        />

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-20">
          <div className="inline-flex items-center bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white mb-1">
            ♥ {(item.added_in_users_favorites / 1000).toFixed(1)}K
          </div>
          <p
            className="text-white text-xs font-semibold leading-tight line-clamp-2"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)' }}
          >{title}</p>
          <p
            className="text-white/60 text-[10px] mt-0.5"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
          >
            {item.year} • {item.type?.value}
          </p>
        </div>
      </div>
    </Link>
  )
}
