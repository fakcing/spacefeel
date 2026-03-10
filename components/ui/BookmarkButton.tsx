'use client'

import { Bookmark, BookmarkCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useWatchlistStore } from '@/store/watchlistStore'
import { WatchlistItem } from '@/types/tmdb'

interface BookmarkButtonProps {
  item: WatchlistItem
}

export default function BookmarkButton({ item }: BookmarkButtonProps) {
  const { toggleItem, isInWatchlist } = useWatchlistStore()
  const isBookmarked = isInWatchlist(item.id)

  return (
    <motion.button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleItem(item)
      }}
      whileTap={{ scale: 0.75 }}
      className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-sm rounded-full p-1.5 transition-opacity"
      aria-label={isBookmarked ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <motion.div
        animate={{ scale: isBookmarked ? [1, 1.3, 1] : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {isBookmarked ? (
          <BookmarkCheck size={16} className="text-white fill-white" />
        ) : (
          <Bookmark size={16} className="text-white/70" />
        )}
      </motion.div>
    </motion.button>
  )
}
