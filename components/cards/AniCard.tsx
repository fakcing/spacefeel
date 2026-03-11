'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { YaniAnime } from '@/types/yani'
import { getPosterUrl } from '@/lib/yani'
import { BLUR_DATA_URL } from '@/lib/blurhash'

interface Props {
  item: YaniAnime
}

export default function AniCard({ item }: Props) {
  const router = useRouter()
  const poster = getPosterUrl(item.poster.medium || item.poster.big)
  const href = `/anime/${item.anime_url}`

  return (
    <Link
      href={href}
      onMouseEnter={() => router.prefetch(href)}
      className="group relative block w-full"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.03]">
        <Image
          src={poster}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-110"
          alt={item.title}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          loading="lazy"
        />

        {/* Animated gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.2) 55%, transparent 75%)',
          }}
        />

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-2.5 z-20 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          <div className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-sm rounded-md px-1.5 md:px-2 py-0.5 text-[8px] md:text-[10px] font-bold text-white mb-1.5 shadow-lg">
            <span>★</span> {item.rating.average.toFixed(1)}
          </div>
          <p
            className="text-white text-xs font-bold leading-tight line-clamp-2 drop-shadow-lg"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >{item.title}</p>
          <p
            className="text-white/80 text-[8px] md:text-[10px] mt-0.5 font-medium"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
          >
            {item.year} • {item.type?.name}
          </p>
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
      </div>
    </Link>
  )
}
