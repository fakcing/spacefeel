'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Video } from '@/types/tmdb'

interface TrailerPlayerProps {
  video: Video
  onClose: () => void
}

export default function TrailerPlayer({ video, onClose }: TrailerPlayerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl aspect-video"
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            src={`https://www.youtube.com/embed/${video.key}?autoplay=1`}
            title={video.name}
            allow="autoplay; fullscreen"
            className="w-full h-full rounded-xl"
            allowFullScreen
          />
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
