'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { YaniAnime } from '@/types/yani'
import AniCard from '@/components/cards/AniCard'
import { useTranslations } from 'next-intl'

interface AniCarouselSectionProps {
  title: string
  subtitle?: string
  items: YaniAnime[]
  viewAllHref?: string
}

export default function AniCarouselSection({
  title,
  subtitle,
  items,
  viewAllHref,
}: AniCarouselSectionProps) {
  const t = useTranslations('home')
  const trackRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const totalCards = items.length
  const visibleCount = 6
  const maxIndex = Math.max(0, totalCards - visibleCount)

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
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>{title}</h2>
          {subtitle && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>}
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
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
            style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
            onMouseEnter={e => { if (currentIndex > 0) (e.currentTarget.style.backgroundColor = 'var(--color-hover)') }}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-overlay)')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} style={{ color: 'var(--color-text-muted)' }} />
          </button>
          <button
            onClick={scrollNext}
            disabled={currentIndex >= maxIndex}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
            style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
            onMouseEnter={e => { if (currentIndex < maxIndex) (e.currentTarget.style.backgroundColor = 'var(--color-hover)') }}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-overlay)')}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Mobile: 2-column grid */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        {items.slice(0, 8).map((item, index) => (
          <motion.div
            key={item.anime_id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
          >
            <AniCard item={item} />
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
          {items.map((item, index) => (
            <motion.div
              key={item.anime_id}
              className="w-[calc((100%-60px)/6)] min-w-[calc((100%-60px)/6)] flex-shrink-0 flex-grow-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              <AniCard item={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
