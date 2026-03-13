'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, User, LogOut, ChevronUp, Check, Sun, Moon, Monitor } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useLocale } from 'next-intl'

const LANGUAGES = [
  { code: 'en', label: 'English',   badge: 'US' },
  { code: 'ru', label: 'Russian',   badge: 'RU' },
  { code: 'uk', label: 'Ukrainian', badge: 'UA' },
  { code: 'de', label: 'German',    badge: 'DE' },
  { code: 'fr', label: 'French',    badge: 'FR' },
  { code: 'ja', label: 'Japanese',  badge: 'JP' },
  { code: 'ko', label: 'Korean',    badge: 'KR' },
  { code: 'es', label: 'Spanish',   badge: 'ES' },
]

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

export default function MobileHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const { theme, setTheme } = useTheme()
  const locale = useLocale()
  const currentLanguage = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0]

  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const handleLanguageChange = async (lang: typeof LANGUAGES[0]) => {
    document.cookie = `locale=${lang.code};path=/;max-age=31536000`
    await fetch('/api/revalidate-locale', { method: 'POST' })
    window.location.reload()
  }

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false)
    setProfileOpen(false)
  }, [pathname])

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [searchOpen])

  // Search debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      return
    }
    const timeout = setTimeout(async () => {
      try {
        const data = await fetch(`/api/search?q=${encodeURIComponent(query)}`).then(r => r.json())
        setResults((data.results as SearchResult[]).slice(0, 6) ?? [])
      } catch {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  // Close profile on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      {/* Top header bar - mobile only */}
      <header
        className="fixed top-0 left-0 right-0 z-40 h-14 md:hidden flex items-center justify-between px-4 border-b"
        style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
      >
        {/* Logo */}
        <Link href="/" className="select-none">
          <span
            className="text-2xl tracking-[0.15em]"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-bebas), sans-serif' }}
          >
            SPACEFEEL
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
            aria-label="Поиск"
          >
            <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
          </button>

          {/* Profile button */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors overflow-hidden"
              style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
              aria-label="Профиль"
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  width={36}
                  height={36}
                  className="rounded-xl object-cover"
                  alt={session.user.name ?? ''}
                />
              ) : (
                <User size={16} style={{ color: 'var(--color-text-muted)' }} />
              )}
            </button>

            {/* Profile dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-64 rounded-2xl shadow-2xl p-4 z-50"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  {/* Account */}
                  {session?.user && (
                    <>
                      <div className="flex items-center gap-2.5 mb-3">
                        {session.user.image ? (
                          <Image src={session.user.image} width={32} height={32} className="rounded-full flex-shrink-0" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-overlay)' }}>
                            <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{session.user.name}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{session.user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setProfileOpen(false); signOut({ callbackUrl: '/' }) }}
                        className="w-full flex items-center gap-2 rounded-xl py-2.5 px-3 text-sm font-medium transition-colors mb-1"
                        style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text)' }}
                      >
                        <LogOut size={14} />
                        Выйти
                      </button>
                      <div className="border-t my-3" style={{ borderColor: 'var(--color-border)' }} />
                    </>
                  )}

                  {/* Language */}
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-subtle)' }}>Language</p>
                  <div className="relative mb-3">
                    <button
                      onClick={() => setLangOpen(v => !v)}
                      className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors"
                      style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-bold w-5" style={{ color: 'var(--color-text-subtle)' }}>{currentLanguage.badge}</span>
                        <span className="text-sm" style={{ color: 'var(--color-text)' }}>{currentLanguage.label}</span>
                      </div>
                      <ChevronUp size={14} className={`transition-transform ${langOpen ? '' : 'rotate-180'}`} style={{ color: 'var(--color-text-subtle)' }} />
                    </button>
                    <AnimatePresence>
                      {langOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.12 }}
                          className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden shadow-2xl z-50"
                          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                        >
                          {LANGUAGES.map(lang => (
                            <button
                              key={lang.code}
                              onClick={() => handleLanguageChange(lang)}
                              className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[10px] font-bold w-5" style={{ color: 'var(--color-text-subtle)' }}>{lang.badge}</span>
                                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{lang.label}</span>
                              </div>
                              {locale === lang.code && <Check size={14} style={{ color: 'var(--color-text-muted)' }} />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Theme */}
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-subtle)' }}>Theme</p>
                  <div className="flex flex-col gap-1">
                    {[
                      { value: 'light', label: 'Light', Icon: Sun },
                      { value: 'dark',  label: 'Dark',  Icon: Moon },
                      { value: 'system',label: 'System',Icon: Monitor },
                    ].map(({ value, label, Icon }) => {
                      const isActive = theme === value
                      return (
                        <button
                          key={value}
                          onClick={() => setTheme(value)}
                          className="w-full rounded-xl py-2 px-3 text-sm text-left flex items-center gap-2 transition-all"
                          style={{
                            backgroundColor: isActive ? 'var(--color-overlay)' : 'transparent',
                            border: isActive ? '1px solid var(--color-border-strong)' : '1px solid var(--color-border)',
                            color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                            fontWeight: isActive ? 500 : undefined,
                          }}
                        >
                          <Icon size={15} />
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Search overlay - fullscreen on mobile */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] md:hidden flex flex-col"
            style={{ backgroundColor: 'var(--color-bg)' }}
          >
            {/* Search header */}
            <div
              className="flex items-center gap-3 px-4 h-14 border-b flex-shrink-0"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Search size={16} style={{ color: 'var(--color-text-subtle)' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск фильмов, аниме..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--color-text)' }}
              />
              <button onClick={() => setSearchOpen(false)}>
                <X size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {results.length > 0 ? (
                results.map((item) => {
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
                  const typeLabel = isAnime ? 'Аниме' : item.media_type === 'tv' ? 'Сериал' : 'Фильм'

                  return (
                    <Link
                      key={`${item.source ?? 'tmdb'}-${item.id}`}
                      href={href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 border-b active:opacity-70"
                      style={{ borderColor: 'var(--color-border)' }}
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
                        <div
                          className="w-8 h-12 rounded flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-overlay)' }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                          {itemTitle}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {typeLabel}{year ? ` · ${year}` : ''}
                        </p>
                      </div>
                    </Link>
                  )
                })
              ) : query.length >= 2 ? (
                <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Ничего не найдено
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--color-text-subtle)' }}>
                  Введите название для поиска
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
