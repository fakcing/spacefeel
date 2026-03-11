'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { House, Film, Tv2, Sword, Bookmark } from 'lucide-react'

const navItems = [
  { href: '/', icon: House, label: 'Home' },
  { href: '/movies', icon: Film, label: 'Movies' },
  { href: '/tv', icon: Tv2, label: 'TV' },
  { href: '/anime', icon: Sword, label: 'Anime' },
  { href: '/watchlist', icon: Bookmark, label: 'Watchlist' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t h-16 safe-area-inset-bottom"
      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
    >
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 relative"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-colors ${
                    isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-text)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={`text-[10px] ${
                  isActive ? 'text-[var(--color-text)] font-medium' : 'text-[var(--color-text-muted)]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
