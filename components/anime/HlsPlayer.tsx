'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface HlsPlayerProps {
  src: string
  playerKey: number
  onLoad?: () => void
  onError?: () => void
  onPause?: () => void
  onPlay?: () => void
}

function isMp4(url: string): boolean {
  return /\.mp4(\?|$)/i.test(url)
}

export default function HlsPlayer({ src, playerKey, onLoad, onError, onPause, onPlay }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    // Direct MP4 — use native video element
    if (isMp4(src)) {
      video.src = src
      video.load()
      const handleLoaded = () => { onLoad?.(); video.play().catch(() => {}) }
      video.addEventListener('loadedmetadata', handleLoaded)
      video.addEventListener('error', () => onError?.())
      return () => {
        video.removeEventListener('loadedmetadata', handleLoaded)
        video.src = ''
      }
    }

    // HLS stream
    let hls: Hls | null = null

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: false })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        onLoad?.()
        video.play().catch(() => {})
      })
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) onError?.()
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari)
      video.src = src
      video.load()
      const handleLoaded = () => { onLoad?.(); video.play().catch(() => {}) }
      video.addEventListener('loadedmetadata', handleLoaded)
      video.addEventListener('error', () => onError?.())
      return () => {
        video.removeEventListener('loadedmetadata', handleLoaded)
      }
    } else {
      onError?.()
    }

    return () => { hls?.destroy() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, playerKey])

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-contain bg-black"
      controls
      onPause={onPause}
      onPlay={onPlay}
      playsInline
    />
  )
}
