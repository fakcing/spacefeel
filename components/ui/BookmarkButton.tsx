'use client'

import { Bookmark, BookmarkCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useWatchlistStore } from '@/store/watchlistStore'
import { useAuthModalStore } from '@/store/authModalStore'
import { useSettingsStore } from '@/store/settingsStore'
import { WatchlistItem } from '@/types/tmdb'

interface BookmarkButtonProps {
  item: WatchlistItem
}

export default function BookmarkButton({ item }: BookmarkButtonProps) {
  const { toggleItem, isInWatchlist } = useWatchlistStore()
  const { open } = useAuthModalStore()
  const { isLoggedIn } = useSettingsStore()
  const isBookmarked = isInWatchlist(item.id)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) {
      open()
      return
    }
    toggleItem(item)
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.75 }}
      className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-sm rounded-full p-1.5 transition-opacity"
      aria-label={isBookmarked ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <motion.div
        animate={{ scale: isBookmarked ? [1, 1.25, 1] : 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
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
