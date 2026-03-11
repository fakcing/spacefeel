'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { AlertTriangle, RefreshCw, ExternalLink, Shield } from 'lucide-react'

interface MirrorPlayerProps {
  videoId: number
  episode: string
  dubbing: string
  season?: number
  mirrors?: string[]
  onError?: () => void
}

const DEFAULT_MIRRORS = [
  'alloha.yani.tv',
  'yakino.pro',
  'alloha.tv',
  'kodik.cc',
  'videocdn.tv'
]

const STORAGE_KEY = 'spacefeel_preferred_mirror'

export default function MirrorPlayer({
  videoId,
  episode,
  dubbing,
  mirrors = DEFAULT_MIRRORS,
  onError
}: MirrorPlayerProps) {
  // Get preferred mirror from localStorage
  const getPreferredMirrorIndex = () => {
    if (typeof window === 'undefined') return 0
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const index = mirrors.findIndex(m => m === saved)
      if (index !== -1) return index
    }
    return 0
  }

  const [currentMirrorIndex, setCurrentMirrorIndex] = useState(getPreferredMirrorIndex)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Build player URL
  const playerUrl = useMemo(() => {
    const mirror = mirrors[currentMirrorIndex]
    // Construct URL based on mirror type
    if (mirror.includes('kodik') || mirror.includes('videocdn')) {
      return `https://${mirror}/player?video_id=${videoId}&episode=${episode}&dubbing=${encodeURIComponent(dubbing)}`
    }
    // Default for alloha/yakino
    return `https://${mirror}/player/${videoId}?episode=${episode}&dubbing=${encodeURIComponent(dubbing)}`
  }, [mirrors, currentMirrorIndex, videoId, episode, dubbing])

  // Save preferred mirror to localStorage
  const savePreferredMirror = useCallback((index: number) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, mirrors[index])
  }, [mirrors])

  // Handle iframe load success
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    // Save this working mirror
    savePreferredMirror(currentMirrorIndex)
  }, [currentMirrorIndex, savePreferredMirror])

  // Handle iframe load error
  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  // Auto-timeout detection (5 seconds)
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)

    const timeout = setTimeout(() => {
      if (isLoading) {
        setHasError(true)
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [playerUrl, isLoading])

  // Switch to next mirror
  const switchMirror = useCallback(() => {
    const nextIndex = (currentMirrorIndex + 1) % mirrors.length
    setCurrentMirrorIndex(nextIndex)
    savePreferredMirror(nextIndex)
    setIsLoading(true)
    setHasError(false)
  }, [currentMirrorIndex, mirrors.length, savePreferredMirror])

  // Manual retry
  const retry = useCallback(() => {
    setIsLoading(true)
    setHasError(false)
  }, [])

  const currentMirror = mirrors[currentMirrorIndex]
  const hasMultipleMirrors = mirrors.length > 1

  return (
    <div className="relative w-full h-full">
      {/* Iframe */}
      <iframe
        key={playerUrl}
        src={playerUrl}
        className="w-full h-full"
        onLoad={handleLoad}
        onError={handleError}
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        frameBorder="0"
        title="Video Player"
      />

      {/* Loading overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <RefreshCw className="w-10 h-10 text-white/40 animate-spin mb-3" />
          <p className="text-white/60 text-sm">Загрузка сервера...</p>
          <p className="text-white/40 text-xs mt-1">{currentMirror}</p>
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-6 text-center">
          <div className="flex items-center gap-2 text-yellow-400 mb-3">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <p className="text-white/80 font-medium mb-1">
            Сервер недоступен
          </p>
          <p className="text-white/40 text-sm mb-4 max-w-md">
            Похоже, этот сервер заблокирован в вашем регионе. 
            Попробуйте сменить сервер или включить VPN.
          </p>

          {/* Server switch button */}
          {hasMultipleMirrors && (
            <button
              onClick={switchMirror}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl mb-3"
            >
              <RefreshCw size={16} />
              Сменить сервер ({currentMirrorIndex + 1}/{mirrors.length})
            </button>
          )}

          {/* Retry button */}
          <button
            onClick={retry}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
          >
            Попробовать снова
          </button>

          {/* Current server info */}
          <div className="mt-4 flex items-center gap-2 text-white/30 text-xs">
            <Shield size={12} />
            <span>Текущий: {currentMirror}</span>
          </div>

          {/* VPN hint */}
          <div className="mt-3 flex items-center gap-1.5 text-white/20 text-xs">
            <ExternalLink size={10} />
            <span>VPN помогает в 95% случаев</span>
          </div>
        </div>
      )}

      {/* Server indicator (top-right corner) */}
      {hasMultipleMirrors && !hasError && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={switchMirror}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white/80 text-xs hover:bg-black/80 transition-colors"
            title="Сменить сервер"
          >
            <RefreshCw size={12} />
            <span>{currentMirror}</span>
          </button>
        </div>
      )}
    </div>
  )
}
