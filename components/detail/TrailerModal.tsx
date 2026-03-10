'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, X } from 'lucide-react'
import Image from 'next/image'
import { Video } from '@/types/tmdb'

interface TrailerModalProps {
  video: Video
}

export default function TrailerModal({ video }: TrailerModalProps) {
  const [open, setOpen] = useState(false)
  const thumb = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-xl overflow-hidden group w-full max-w-sm"
        aria-label="Play trailer"
      >
        <div className="aspect-video relative">
          <Image src={thumb} alt={video.name} fill className="object-cover" sizes="384px" />
        </div>
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
            <div className="relative bg-white/20 backdrop-blur rounded-full p-4">
              <Play size={24} fill="white" className="text-white" />
            </div>
          </div>
        </div>
        <p className="absolute bottom-2 left-3 text-xs text-white/80 font-medium truncate pr-3">{video.name}</p>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
                className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
