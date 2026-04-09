'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { MediaItem } from '@/types/tmdb'
import MediaCard from '@/components/cards/MediaCard'

interface CarouselSectionProps {
  title: string
  subtitle?: string
  items: MediaItem[]
  mediaType: 'movie' | 'tv'
  viewAllHref?: string
}

export default function CarouselSection({ title, subtitle, items, mediaType, viewAllHref }: CarouselSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const filteredItems = items.filter(item => item.poster_path)
  const totalCards = filteredItems.length
  const visibleCount = 6
  const maxIndex = Math.max(0, totalCards - visibleCount)
  const t = useTranslations('home')

  const scrollNext = () => { if (currentIndex < maxIndex) setCurrentIndex(p => p + 1) }
  const scrollPrev = () => { if (currentIndex > 0) setCurrentIndex(p => p - 1) }

  return (
    <section className="px-4 md:px-8 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-base md:text-lg font-semibold tracking-tight truncate" style={{ color: 'var(--color-text)' }}>{title}</h2>
          {subtitle && <p className="text-xs hidden sm:block" style={{ color: 'var(--color-text-subtle)' }}>{subtitle}</p>}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-xs font-medium flex-shrink-0 transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-subtle)' }}
            >
              {t('viewAll')}
              <ArrowRight size={11} />
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-subtle)' }}>
            {currentIndex + 1}<span className="mx-0.5 opacity-40">/</span>{maxIndex + 1}
          </span>
          <button
            onClick={scrollPrev}
            disabled={currentIndex <= 0}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
            aria-label="Previous"
          >
            <ChevronLeft size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>
          <button
            onClick={scrollNext}
            disabled={currentIndex >= maxIndex}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
            aria-label="Next"
          >
            <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Mobile grid */}
      <div className="md:hidden grid grid-cols-3 gap-2">
        {filteredItems.slice(0, 6).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
          >
            <MediaCard item={item} mediaType={mediaType} />
          </motion.div>
        ))}
      </div>

      {/* Desktop carousel */}
      <div className="hidden md:block overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-3 transition-transform duration-350 ease-out"
          style={{ transform: `translateX(calc(-${currentIndex} * (100% / 6 + 2px)))` }}
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="w-[calc((100%-60px)/6)] min-w-[calc((100%-60px)/6)] flex-shrink-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              <MediaCard item={item} mediaType={mediaType} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
