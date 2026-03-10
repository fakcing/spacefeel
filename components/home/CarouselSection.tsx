'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MediaItem } from '@/types/tmdb'
import MediaCard from '@/components/cards/MediaCard'

interface CarouselSectionProps {
  title: string
  subtitle?: string
  items: MediaItem[]
  mediaType: 'movie' | 'tv'
  viewAllHref?: string
}

const CARD_WIDTH = 180 + 12 // card width + gap-3

export default function CarouselSection({
  title,
  subtitle,
  items,
  mediaType,
  viewAllHref,
}: CarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const maxIndex = Math.max(0, items.length - 5)

  const scrollNext = () => {
    const next = Math.min(currentIndex + 1, maxIndex)
    setCurrentIndex(next)
    scrollRef.current?.scrollTo({ left: next * CARD_WIDTH, behavior: 'smooth' })
  }

  const scrollPrev = () => {
    const prev = Math.max(currentIndex - 1, 0)
    setCurrentIndex(prev)
    scrollRef.current?.scrollTo({ left: prev * CARD_WIDTH, behavior: 'smooth' })
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
              <span className="text-white/20">|</span>
              <Link
                href={viewAllHref}
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                View All
              </Link>
            </>
          )}
        </div>

        {/* Right: page counter + arrows */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/40 mr-1">
            {currentIndex + 1} / {items.length - 4}
          </span>
          <button
            onClick={scrollPrev}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollNext}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
      >
        {items.map((item) => (
          <div key={item.id} className="min-w-[calc(20%-10px)] w-[calc(20%-10px)] flex-shrink-0 flex-grow-0">
            <MediaCard item={item} mediaType={mediaType} />
          </div>
        ))}
      </div>
    </section>
  )
}
