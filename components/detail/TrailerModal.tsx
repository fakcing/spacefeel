'use client'

import { useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Play } from 'lucide-react'
import { Video } from '@/types/tmdb'

const TrailerPlayer = dynamic(() => import('./TrailerPlayer'), { ssr: false })

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
          <Image src={thumb} alt={video.name} fill className="object-cover" sizes="384px" loading="lazy" />
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

      {open && <TrailerPlayer video={video} onClose={() => setOpen(false)} />}
    </>
  )
}
