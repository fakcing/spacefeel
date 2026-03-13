'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useWatchlistStore } from '@/store/watchlistStore'
import { WatchlistItem } from '@/types/tmdb'
import MediaCard from '@/components/cards/MediaCard'
import { Movie, TVShow } from '@/types/tmdb'

interface EnrichedItem extends WatchlistItem {
  title: string
}

export default function WatchlistPage() {
  const { items } = useWatchlistStore()
  const t = useTranslations('watchlistPage')
  const locale = useLocale()
  const [enriched, setEnriched] = useState<EnrichedItem[]>([])

  useEffect(() => {
    if (!items.length) { setEnriched([]); return }
    Promise.all(
      items.map(async (item) => {
        const data = await fetch(
          `/api/media-detail?id=${item.id}&type=${item.media_type}&locale=${locale}`
        ).then(r => r.json())
        return { ...item, title: data.title || '' }
      })
    ).then(setEnriched)
  }, [items, locale])

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark size={28} />
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{t('title')}</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <Bookmark size={96} className="text-[var(--text-muted)] opacity-20 mb-6" />
          </motion.div>
          <h2 className="text-xl font-semibold text-[var(--text-muted)] mb-2">{t('empty')}</h2>
          <p className="text-sm text-[var(--text-muted)] mb-8 opacity-60">
            Start adding movies and shows you want to watch
          </p>
          <Link
            href="/movies"
            className="bg-white text-black font-semibold rounded-full px-8 py-3 hover:bg-white/90 transition-colors"
          >
            {t('browse')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {enriched.map((item) => {
            if (item.media_type === 'anime') {
              return (
                <a key={item.id} href={item.slug ? `/anime/${item.slug}` : '/anime'} className="group relative block w-full">
                  <div className="relative aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden bg-white/5">
                    {item.poster_path && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.poster_path} alt={item.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-semibold line-clamp-2">{item.title}</p>
                    </div>
                  </div>
                </a>
              )
            }
            const mediaItem = {
              id: item.id,
              ...(item.media_type === 'movie'
                ? { title: item.title, original_title: item.title, release_date: item.release_date }
                : { name: item.title, original_name: item.title, first_air_date: item.release_date }),
              overview: '',
              poster_path: item.poster_path,
              backdrop_path: null,
              vote_average: item.vote_average,
              vote_count: 0,
              genre_ids: [],
            } as Movie | TVShow
            return <MediaCard key={item.id} item={mediaItem} mediaType={item.media_type as 'movie' | 'tv'} />
          })}
        </div>
      )}
    </div>
  )
}
