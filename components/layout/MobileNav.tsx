'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { House, Film, Tv2, Sword, MoreHorizontal, Wand2, Bookmark, History, X, Settings } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useAuthModalStore } from '@/store/authModalStore'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'

export default function MobileNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { open: openAuthModal } = useAuthModalStore()
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  const mainItems = [
    { href: '/',        icon: House, label: t('home') },
    { href: '/movies',  icon: Film,  label: t('movies') },
    { href: '/tv',      icon: Tv2,   label: t('tvShows') },
    { href: '/anime',   icon: Sword, label: t('anime') },
  ]

  const moreItems = [
    { href: '/cartoons',  icon: Wand2,    label: t('cartoons') },
    {
      href: '/watchlist',
      icon: Bookmark,
      label: t('watchlist'),
      requiresAuth: true,
    },
    {
      href: '/history',
      icon: History,
      label: t('history') || 'History',
      requiresAuth: true,
    },
    {
      href: '/settings',
      icon: Settings,
      label: t('settings') || 'Settings',
    },
  ]

  const isMoreActive = ['/cartoons', '/watchlist', '/history', '/settings'].some(
    p => pathname === p || pathname.startsWith(p + '/')
  )

  const handleMoreItemClick = (item: typeof moreItems[0]) => {
    setMoreOpen(false)
    if (item.requiresAuth && !session) {
      openAuthModal()
      return
    }
    router.push(item.href)
  }

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t"
        style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
      >
        <div className="grid grid-cols-5 h-16 pb-safe">
          {mainItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavPill"
                    className="absolute top-1.5 w-8 h-0.5 rounded-full"
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

          {/* More button */}
          <button
            onClick={() => setMoreOpen(v => !v)}
            className="flex flex-col items-center justify-center gap-1 relative"
          >
            {isMoreActive && !moreOpen && (
              <motion.div
                layoutId="mobileNavPill"
                className="absolute top-1.5 w-8 h-0.5 rounded-full"
                style={{ backgroundColor: 'var(--color-text)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {moreOpen
              ? <X size={22} style={{ color: 'var(--color-text)' }} strokeWidth={2.5} />
              : <MoreHorizontal size={22} style={{ color: isMoreActive ? 'var(--color-text)' : 'var(--color-text-muted)' }} strokeWidth={1.8} />
            }
            <span
              className="text-[10px] font-medium transition-colors"
              style={{ color: moreOpen || isMoreActive ? 'var(--color-text)' : 'var(--color-text-muted)' }}
            >
              {t('more') || 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* More drawer — slides up from bottom */}
      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMoreOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-3xl pb-20"
              style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border-strong)' }} />
              </div>

              <div className="px-4 pb-4">
                <p className="text-xs uppercase tracking-wider px-1 mb-2" style={{ color: 'var(--color-text-subtle)' }}>
                  {t('more') || 'More'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {moreItems.map(item => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleMoreItemClick(item)}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors text-left"
                        style={{
                          backgroundColor: isActive ? 'var(--color-overlay)' : 'var(--color-overlay)',
                          border: isActive ? '1px solid var(--color-border-strong)' : '1px solid var(--color-border)',
                          color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                        }}
                      >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
