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

const CARD_WIDTH = 192 // 180px card + 12px gap (gap-3)
const VISIBLE_CARDS = 5

export default function CarouselSection({
  title,
  subtitle,
  items,
  mediaType,
  viewAllHref,
}: CarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / VISIBLE_CARDS))

  const scroll = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    setCurrentPage(Math.round(el.scrollLeft / CARD_WIDTH) + 1)
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
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => scroll(-320)}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll(320)}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
      >
        {items.map((item) => (
          <div key={item.id} className="min-w-[160px] md:min-w-[180px] flex-shrink-0">
            <MediaCard item={item} mediaType={mediaType} />
          </div>
        ))}
      </div>
    </section>
  )
}
