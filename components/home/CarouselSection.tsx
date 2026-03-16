'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

export default function CarouselSection({
  title,
  subtitle,
  items,
  mediaType,
  viewAllHref,
}: CarouselSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const filteredItems = items.filter(item => item.poster_path)
  const totalCards = filteredItems.length
  const visibleCount = 6
  const maxIndex = Math.max(0, totalCards - visibleCount)
  const t = useTranslations('home')

  const scrollNext = () => {
    if (currentIndex >= maxIndex) return
    setCurrentIndex((prev) => prev + 1)
  }

  const scrollPrev = () => {
    if (currentIndex <= 0) return
    setCurrentIndex((prev) => prev - 1)
  }

  return (
    <section className="px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-4">

        {/* Left: title + View All */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
          {subtitle && <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>}
          {viewAllHref && (
            <>
              <span style={{ color: 'var(--color-border-strong)' }}>|</span>
              <Link
                href={viewAllHref}
                className="text-sm transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {t('viewAll')}
              </Link>
            </>
          )}
        </div>

        {/* Right: page counter + arrows (desktop only) */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">
            {currentIndex + 1} / {maxIndex + 1}
          </span>
          <button
            onClick={scrollPrev}
            disabled={currentIndex <= 0}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              currentIndex <= 0 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: 'var(--color-overlay)' }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollNext}
            disabled={currentIndex >= maxIndex}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              currentIndex >= maxIndex ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: 'var(--color-overlay)' }}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Mobile: 2-column grid showing first 8 */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        {filteredItems.slice(0, 8).map((item, index) => (
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

      {/* Desktop: carousel */}
      <div className="hidden md:block overflow-hidden py-3 -my-3">
        <div
          ref={trackRef}
          className="flex gap-3 transition-transform duration-300 ease-out"
          style={{ transform: `translateX(calc(-${currentIndex} * (100% / 6 + 2px)))` }}
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="w-[calc((100%-60px)/6)] min-w-[calc((100%-60px)/6)] flex-shrink-0 flex-grow-0"
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
