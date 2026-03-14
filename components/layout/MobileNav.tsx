'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { House, Film, Tv2, Sword, Bookmark } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useAuthModalStore } from '@/store/authModalStore'

const navItems = [
  { href: '/', icon: House, label: 'Главная' },
  { href: '/movies', icon: Film, label: 'Фильмы' },
  { href: '/tv', icon: Tv2, label: 'Сериалы' },
  { href: '/anime', icon: Sword, label: 'Аниме' },
  { href: '/watchlist', icon: Bookmark, label: 'Список' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { open: openAuthModal } = useAuthModalStore()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t safe-area-inset-bottom"
      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          const isWatchlist = item.href === '/watchlist'

          const handleClick = isWatchlist
            ? (e: React.MouseEvent) => { e.preventDefault(); if (!session) { openAuthModal(); return } router.push('/watchlist') }
            : undefined

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClick}
              className="flex flex-col items-center justify-center gap-1 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavPill"
                  className="absolute top-1.5 w-10 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--color-text)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={22}
                className="transition-colors"
                style={{ color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)' }}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)' }}
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
