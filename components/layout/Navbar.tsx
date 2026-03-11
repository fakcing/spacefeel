'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  House, Film, Tv2, Sword, Wand2, Bookmark, Search, ChevronDown,
  TrendingUp, Heart, Calendar, Play, Star, Compass, Radio,
  Sparkles, Clock, Users, X,
} from 'lucide-react'
import ProfileDropdown from '@/components/ui/ProfileDropdown'

type SearchResult = {
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  anilibria_poster?: string | null
  media_type?: string
  release_date?: string
  first_air_date?: string
  alias?: string
  year?: string
  source?: 'tmdb' | 'anilibria' | 'yani'
}

interface DropdownItem {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  isNew?: boolean
}

function DropdownPanel({ items }: { items: DropdownItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full mt-2 border rounded-2xl shadow-2xl p-5 min-w-[440px] z-50"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="grid grid-cols-2 gap-1">
        {items.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              href={item.href}
              className="flex items-start gap-3 p-3 rounded-xl transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-subtle)' }}>
                {item.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center">
                  <span className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>{item.title}</span>
                  {item.isNew && (
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text)' }}>NEW</span>
                  )}
                </div>
                <span className="text-xs leading-tight" style={{ color: 'var(--color-text-muted)' }}>{item.description}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

void [Sparkles, Clock, Users]

export default function Navbar() {
  const pathname = usePathname()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations('nav')
  const td = useTranslations('dropdown')
  const ts = useTranslations('search')


  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const moviesItems: DropdownItem[] = [
    { icon: <TrendingUp size={16} />, title: td('trendingMovies'), description: td('trendingMoviesDesc'), href: '/movies?category=trending' },
    { icon: <Heart size={16} />, title: td('popular'), description: td('popularDesc'), href: '/movies?category=popular' },
    { icon: <Calendar size={16} />, title: td('upcoming'), description: td('upcomingDesc'), href: '/movies?category=upcoming' },
    { icon: <Play size={16} />, title: td('nowPlaying'), description: td('nowPlayingDesc'), href: '/movies?category=now_playing' },
    { icon: <Star size={16} />, title: td('topRated'), description: td('topRatedDesc'), href: '/movies?category=top_rated' },
    { icon: <Compass size={16} />, title: td('discover'), description: td('discoverDesc'), href: '/movies?category=discover', isNew: true },
  ]

  const tvItems: DropdownItem[] = [
    { icon: <TrendingUp size={16} />, title: td('trendingShows'), description: td('trendingShowsDesc'), href: '/tv?category=trending' },
    { icon: <Heart size={16} />, title: td('popular'), description: td('popularShowsDesc'), href: '/tv?category=popular' },
    { icon: <Star size={16} />, title: td('topRated'), description: td('topRatedShowsDesc'), href: '/tv?category=top_rated' },
    { icon: <Radio size={16} />, title: td('onTheAir'), description: td('onTheAirDesc'), href: '/tv?category=on_the_air' },
    { icon: <Tv2 size={16} />, title: td('airingToday'), description: td('airingTodayDesc'), href: '/tv?category=airing_today' },
    { icon: <Compass size={16} />, title: td('discover'), description: td('discoverShowsDesc'), href: '/tv?category=discover', isNew: true },
  ]

  const navLinks = [
    { label: t('home'),     href: '/',         icon: <House size={16} />,    dropdown: null },
    { label: t('movies'),   href: '/movies',   icon: <Film size={16} />,     dropdown: moviesItems },
    { label: t('tvShows'),  href: '/tv',       icon: <Tv2 size={16} />,      dropdown: tvItems },
    { label: t('anime'),    href: '/anime',    icon: <Sword size={16} />,    dropdown: null },
    { label: t('cartoons'), href: '/cartoons', icon: <Wand2 size={16} />,    dropdown: null },
  ]

  const handleMouseEnter = (label: string) => {
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current)
    setActiveDropdown(label)
  }

  const handleMouseLeave = () => {
    navTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150)
  }

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }
    const timeout = setTimeout(async () => {
      try {
        const data = await fetch(`/api/search?q=${encodeURIComponent(query)}`).then(r => r.json())
        setResults((data.results as SearchResult[]).slice(0, 8) ?? [])
        setIsOpen(true)
      } catch {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-14 border-b md:block hidden" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center select-none flex-shrink-0">
          <motion.span
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="text-3xl tracking-[0.15em]"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-bebas), sans-serif' }}
          >
            SPACEFEEL
          </motion.span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && handleMouseEnter(item.label)}
                onMouseLeave={() => item.dropdown && handleMouseLeave()}
              >
                <Link
                  href={item.href}
                  className="relative flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors"
                  style={{ color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: isActive ? 500 : undefined }}
                >
                  {item.icon}
                  {item.label}
                  {item.dropdown && <ChevronDown size={12} className="opacity-50" />}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-text)' }} />
                  )}
                </Link>
                <AnimatePresence>
                  {activeDropdown === item.label && item.dropdown && (
                    <DropdownPanel items={item.dropdown} />
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Right: search + watchlist + profile */}
        <div className="flex items-center gap-2">
          <div ref={containerRef} className="relative">
            <div
              className={`flex items-center border-[1.5px] rounded-xl px-3 py-2 gap-2 w-48 md:w-64 h-9 transition-all duration-200${isFocused ? ' search-focused' : ''}`}
              style={{ backgroundColor: 'var(--color-overlay)', borderColor: isFocused ? undefined : 'var(--color-border-strong)' }}
            >
              <Search size={14} className="flex-shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ts('placeholder')}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="bg-transparent text-sm outline-none w-full placeholder:opacity-40"
                style={{ color: 'var(--color-text)' }}
              />
              {query && (
                <button onClick={() => { setQuery(''); setResults([]); setIsOpen(false) }}>
                  <X size={14} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {isOpen && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 right-0 w-80 border rounded-2xl shadow-2xl overflow-hidden z-50"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  {results.map((item) => {
                    const isAnime = item.media_type === 'anime'
                    const itemTitle = item.title || item.name || ''
                    const year = isAnime
                      ? (item.year || '')
                      : ((item.release_date || item.first_air_date) || '').slice(0, 4)
                    const href = isAnime
                      ? `/anime/${item.alias}`
                      : item.media_type === 'tv'
                        ? `/tv/${item.id}`
                        : `/movies/${item.id}`
                    const posterSrc = isAnime
                      ? item.anilibria_poster
                      : item.poster_path
                        ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                        : null
                    const typeLabel = isAnime
                      ? 'Аниме'
                      : item.media_type === 'tv' ? ts('tvShow') : ts('movie')
                    return (
                      <Link
                        key={`${item.source ?? 'tmdb'}-${item.id}`}
                        href={href}
                        onClick={() => { setQuery(''); setIsOpen(false) }}
                        className="flex items-center gap-3 px-4 py-3 transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                      >
                        {posterSrc ? (
                          <Image
                            src={posterSrc}
                            width={32}
                            height={48}
                            className="rounded object-cover flex-shrink-0"
                            alt={itemTitle}
                          />
                        ) : (
                          <div className="w-8 h-12 rounded flex-shrink-0" style={{ backgroundColor: 'var(--color-overlay)' }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{itemTitle}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            {typeLabel}{year ? ` · ${year}` : ''}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/watchlist"
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
            style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
            aria-label={t('watchlist')}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-overlay)')}
          >
            <Bookmark size={16} style={{ color: 'var(--color-text-muted)' }} />
          </Link>

          <ProfileDropdown />
        </div>
      </div>
    </nav>
  )
}
