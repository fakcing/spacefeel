'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { House, Film, Tv2, Sword, Bookmark, Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const navItems = [
  { href: '/', icon: House, label: 'Главная' },
  { href: '/movies', icon: Film, label: 'Фильмы' },
  { href: '/tv', icon: Tv2, label: 'Сериалы' },
  { href: '/anime', icon: Sword, label: 'Аниме' },
  { href: '/watchlist', icon: Bookmark, label: 'Избранное' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  return (
    <>
      {/* Search Overlay */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: searchOpen ? 1 : 0, y: searchOpen ? 0 : -100 }}
        transition={{ duration: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg)] border-b border-[var(--color-border)] md:hidden pointer-events-none"
        style={{ opacity: searchOpen ? 1 : 0 }}
      >
        <div className="p-4 safe-area-inset-top">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[var(--color-overlay)] rounded-xl px-4 py-2.5 border border-[var(--color-border)]">
              <Search size={18} className="text-[var(--color-text-muted)]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Поиск..."
                className="flex-1 bg-transparent text-sm outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>
            <button
              onClick={() => setSearchOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-overlay)] text-[var(--color-text-muted)] hover:bg-[var(--color-hover)] transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-inset-bottom">
        {/* Gradient border top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
        
        {/* Blur background */}
        <div className="absolute inset-0 bg-[var(--color-bg)]/95 backdrop-blur-xl" />
        
        {/* Content */}
        <div className="relative grid grid-cols-5 h-[68px] pb-[env(safe-area-inset-bottom,0)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-1 group"
              >
                {/* Active background glow */}
                {isActive && (
                  <motion.div
                    layoutId="navGlow"
                    className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-t-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon container */}
                <div className="relative mt-1">
                  {/* Outer ring for active state */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ padding: '2px' }}
                    >
                      <div className="w-full h-full rounded-full bg-[var(--color-bg)]" />
                    </motion.div>
                  )}
                  
                  {/* Icon */}
                  <div className={`absolute inset-0 flex items-center justify-center ${isActive ? 'p-0.5' : 'p-0'}`}>
                    <Icon
                      size={22}
                      className={`transition-all duration-300 ${
                        isActive
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400'
                          : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] transition-all duration-300 ${
                    isActive
                      ? 'text-[var(--color-text)] font-semibold'
                      : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Search button (floating) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setSearchOpen(!searchOpen)}
        className="fixed bottom-[84px] right-4 z-50 md:hidden w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-blue-500/40 transition-all active:scale-95"
        whileTap={{ scale: 0.95 }}
      >
        <Search size={20} />
      </motion.button>
    </>
  )
}
