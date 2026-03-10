'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  House, Film, Tv2, Sword, Wand2, Bookmark, Search, ChevronDown,
  TrendingUp, Heart, Calendar, Play, Star, Compass, Radio,
  Sparkles, Clock, Users,
} from 'lucide-react'
import ProfileDropdown from '@/components/ui/ProfileDropdown'

interface DropdownItem {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  isNew?: boolean
}

const moviesItems: DropdownItem[] = [
  { icon: <TrendingUp size={16} />, title: 'Trending Movies', description: 'What everyone is watching', href: '/movies?category=trending' },
  { icon: <Heart size={16} />, title: 'Popular', description: 'Most popular right now', href: '/movies?category=popular' },
  { icon: <Calendar size={16} />, title: 'Upcoming', description: 'Coming soon to theaters', href: '/movies?category=upcoming' },
  { icon: <Play size={16} />, title: 'Now Playing', description: 'Currently in theaters', href: '/movies?category=now_playing' },
  { icon: <Star size={16} />, title: 'Top Rated', description: 'Highest rated of all time', href: '/movies?category=top_rated' },
  { icon: <Compass size={16} />, title: 'Discover', description: 'Explore all movies', href: '/movies?category=discover', isNew: true },
]

const tvItems: DropdownItem[] = [
  { icon: <TrendingUp size={16} />, title: 'Trending Shows', description: 'Most talked about series', href: '/tv?category=trending' },
  { icon: <Heart size={16} />, title: 'Popular', description: 'Fan favorites right now', href: '/tv?category=popular' },
  { icon: <Star size={16} />, title: 'Top Rated', description: 'Critically acclaimed series', href: '/tv?category=top_rated' },
  { icon: <Radio size={16} />, title: 'On The Air', description: 'Currently broadcasting', href: '/tv?category=on_the_air' },
  { icon: <Tv2 size={16} />, title: 'Airing Today', description: 'Episodes airing today', href: '/tv?category=airing_today' },
  { icon: <Compass size={16} />, title: 'Discover', description: 'Explore all TV shows', href: '/tv?category=discover', isNew: true },
]

function DropdownPanel({ items }: { items: DropdownItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full mt-2 bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-5 min-w-[440px] z-50"
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
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <span className="text-white/40 group-hover:text-white/70 transition-colors mt-0.5 flex-shrink-0">
                {item.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-white leading-tight">{item.title}</span>
                  {item.isNew && (
                    <span className="ml-2 text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full">NEW</span>
                  )}
                </div>
                <span className="text-xs text-white/50 leading-tight">{item.description}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

const navLinks = [
  { label: 'Home',      href: '/',         icon: <House size={16} />,    dropdown: null },
  { label: 'Movies',    href: '/movies',   icon: <Film size={16} />,     dropdown: moviesItems },
  { label: 'TV Shows',  href: '/tv',       icon: <Tv2 size={16} />,      dropdown: tvItems },
  { label: 'Anime',     href: '/anime',    icon: <Sword size={16} />,    dropdown: null },
  { label: 'Cartoons',  href: '/cartoons', icon: <Wand2 size={16} />,    dropdown: null },
]

// Silence unused-import warnings for icons only referenced in arrays above
void [Sparkles, Clock, Users]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(label)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-14 bg-[var(--bg-primary)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none flex-shrink-0">
          <motion.span
            className="text-xl font-bold tracking-tighter"
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <span className="text-white">space</span>
            <span className="text-white/40">feel</span>
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
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.dropdown && <ChevronDown size={12} className="opacity-50" />}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--text-primary)] rounded-full" />
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

        {/* Right: search bar + watchlist + profile */}
        <div className="flex items-center gap-2">
          {/* Search input bar */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 gap-2 w-48 md:w-64 h-9">
            <Search size={14} className="text-white/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-white placeholder:text-white/30 outline-none w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                  setSearchQuery('')
                }
              }}
            />
          </div>

          {/* Watchlist icon button */}
          <Link
            href="/watchlist"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            aria-label="Watchlist"
          >
            <Bookmark size={16} className="text-white/70" />
          </Link>

          {/* Profile icon button */}
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  )
}
