'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Movie } from '@/types/tmdb'
import { getBackdrop } from '@/lib/tmdbImages'

interface HeroBannerProps {
  movies: Movie[]
}

const INTERVAL = 6000

export default function HeroBanner({ movies }: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const t = useTranslations('hero')

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

  const movie = movies[current]
  if (!movie) return null

  return (
    <div className="relative w-full h-[75vh] overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.06 }}
            transition={{ duration: 7, ease: 'linear' }}
          >
            {getBackdrop(movie.backdrop_path) && (
              <Image
                src={getBackdrop(movie.backdrop_path)!}
                alt={movie.title}
                fill
                className="object-cover"
                priority
                quality={85}
                sizes="100vw"
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      <div className="absolute bottom-16 left-0 right-0 text-center px-4">
        <AnimatePresence mode="wait">
          <motion.div key={movie.id}>
            <motion.div
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ overflow: 'visible' }}
            >
              <h1
                className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4 drop-shadow-2xl"
                style={{ lineHeight: '1.15', paddingBottom: '0.1em', overflow: 'visible' }}
              >
                {movie.title}
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="max-w-2xl mx-auto text-white/70 text-sm leading-relaxed line-clamp-3 mb-8"
            >
              {movie.overview}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex items-center justify-center gap-4"
            >
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link
                  href={`/movies/${movie.id}`}
                  className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-full px-8 py-3 hover:bg-gray-800 dark:hover:bg-white/90 transition-colors"
                >
                  <Play size={18} className="fill-white dark:fill-black" />
                  {t('playNow')}
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link
                  href={`/movies/${movie.id}`}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full px-8 py-3 hover:bg-white/20 transition-colors"
                >
                  <Info size={18} />
                  {t('details')}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="relative overflow-hidden"
            aria-label={`Slide ${i + 1}`}
          >
            <div className={`h-0.5 rounded-full transition-all duration-300 bg-white/30 ${i === current ? 'w-10' : 'w-4'}`} />
            {i === current && (
              <motion.div
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
