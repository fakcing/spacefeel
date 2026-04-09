'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Info, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Movie } from '@/types/tmdb'
import { getBackdrop } from '@/lib/tmdbImages'
import { useMediaPlayerStore } from '@/store/mediaPlayerStore'
import { useAuthModalStore } from '@/store/authModalStore'

interface HeroBannerProps {
  movies: Movie[]
}

const INTERVAL = 7000

export default function HeroBanner({ movies }: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const t = useTranslations('hero')
  const { data: session } = useSession()
  const { openPlayer } = useMediaPlayerStore()
  const { open: openAuthModal } = useAuthModalStore()

  const movie = movies[current]

  const handlePlay = () => {
    if (!session) { openAuthModal(); return }
    openPlayer({ mediaType: 'movie', item: movie, tmdbId: movie.id, season: 1, episode: 1 })
  }

  const startTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
    setProgress(0)
    const startTime = Date.now()
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100))
    }, 50)
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % movies.length)
    }, INTERVAL)
  }

  useEffect(() => {
    startTimers()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movies.length])

  useEffect(() => {
    startTimers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  if (!movie) return null

  const year = movie.release_date?.slice(0, 4)

  return (
    <div className="relative w-full h-[80vh] min-h-[520px] overflow-hidden">
      {/* Backdrop */}
      <AnimatePresence mode="sync">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 8, ease: 'linear' }}
          >
            {(() => {
              const bd = getBackdrop(movie.backdrop_path)
              return bd ? (
                <Image
                  src={bd}
                  alt={movie.title}
                  fill
                  className="object-cover object-center"
                  priority
                  quality={90}
                  sizes="100vw"
                />
              ) : null
            })()}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--color-bg) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 45%, transparent 70%)' }} />

      {/* Content — bottom left */}
      <div className="absolute bottom-0 left-0 right-0 pb-14 px-6 md:px-12 lg:px-16 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div key={movie.id}>

            {/* Metadata row */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 mb-3"
            >
              {movie.vote_average > 0 && (
                <span className="flex items-center gap-1 text-amber-400 text-sm font-semibold">
                  <Star size={13} className="fill-amber-400" />
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              {year && (
                <span className="text-white/55 text-sm">{year}</span>
              )}
              {movie.vote_average > 0 && year && (
                <span className="w-1 h-1 rounded-full bg-white/25 flex-shrink-0" />
              )}
              {movie.original_language && (
                <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md text-white/50" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  {movie.original_language}
                </span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 leading-none"
              style={{ fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.03em', textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}
            >
              {movie.title}
            </motion.h1>

            {/* Overview */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-white/60 text-sm leading-relaxed line-clamp-2 mb-7 max-w-xl"
            >
              {movie.overview}
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePlay}
                className="flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}
              >
                <Play size={15} fill="currentColor" />
                {t('playNow')}
              </motion.button>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  href={`/movies/${movie.id}`}
                  className="flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-medium transition-colors hover:bg-white/15"
                  style={{ backgroundColor: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)', color: 'white' }}
                >
                  <Info size={15} />
                  {t('details')}
                </Link>
              </motion.div>
            </motion.div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className="relative overflow-hidden"
          >
            <div className={`h-0.5 rounded-full transition-all duration-300 ${i === current ? 'w-10 bg-white/40' : 'w-4 bg-white/20'}`} />
            {i === current && (
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                style={{ width: `${progress}%` }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
