'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
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
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <section className="px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
          {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group flex items-center gap-1 mr-1"
            >
              View All
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          <button
            onClick={() => scroll(-320)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll(320)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide pb-2">
        {items.map((item) => (
          <div key={item.id} className="min-w-[160px] md:min-w-[180px] flex-shrink-0">
            <MediaCard item={item} mediaType={mediaType} />
          </div>
        ))}
      </div>
    </section>
  )
}
