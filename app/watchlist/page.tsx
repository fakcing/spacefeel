'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'
import { useWatchlistStore } from '@/store/watchlistStore'
import MediaCard from '@/components/cards/MediaCard'
import { Movie, TVShow } from '@/types/tmdb'

export default function WatchlistPage() {
  const { items } = useWatchlistStore()

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark size={28} />
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">My Watchlist</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <Bookmark size={96} className="text-[var(--text-muted)] opacity-20 mb-6" />
          </motion.div>
          <h2 className="text-xl font-semibold text-[var(--text-muted)] mb-2">Your watchlist is empty</h2>
          <p className="text-sm text-[var(--text-muted)] mb-8 opacity-60">
            Start adding movies and shows you want to watch
          </p>
          <Link
            href="/movies"
            className="bg-white text-black font-semibold rounded-full px-8 py-3 hover:bg-white/90 transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => {
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
            return <MediaCard key={item.id} item={mediaItem} mediaType={item.media_type} />
          })}
        </div>
      )}
    </div>
  )
}
