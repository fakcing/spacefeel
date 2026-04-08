'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, User, LogOut, ChevronUp, Check, Sun, Moon, Monitor, Loader2, ArrowRight } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useLocale, useTranslations } from 'next-intl'

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
  const router = useRouter()
  const { data: session } = useSession()

  const { theme, setTheme } = useTheme()
  const locale = useLocale()
  const currentLanguage = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0]
  const t = useTranslations()

  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const handleLanguageChange = async (lang: typeof LANGUAGES[0]) => {
    document.cookie = `locale=${lang.code};path=/;max-age=31536000`
    await fetch('/api/revalidate-locale', { method: 'POST' })
    window.location.reload()
  }

  useEffect(() => {
    setSearchOpen(false)
    setProfileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [searchOpen])

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const data = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=all`).then(r => r.json())
        const combined: SearchResult[] = [
          ...(data.movies ?? []).map((m: SearchResult) => ({ ...m, media_type: 'movie', source: 'tmdb' as const })),
          ...(data.tvShows ?? []).map((s: SearchResult) => ({ ...s, media_type: 'tv', source: 'tmdb' as const })),
          ...(data.anime ?? []).map((a: { anime_id: number; title: string; anime_url: string; year: number; poster: { medium: string } }) => ({
            id: a.anime_id,
            name: a.title,
            media_type: 'anime',
            source: 'yani' as const,
            alias: a.anime_url,
            year: String(a.year),
            anilibria_poster: a.poster?.medium?.startsWith('//') ? `https:${a.poster.medium}` : a.poster?.medium,
          })),
        ]
        setResults(combined.slice(0, 6))
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const themeOptions = [
    { value: 'light',  label: t('profile.light'),  Icon: Sun },
    { value: 'dark',   label: t('profile.dark'),   Icon: Moon },
    { value: 'system', label: t('profile.system'), Icon: Monitor },
  ]

  const handleSearchClose = () => setSearchOpen(false)

  const handleGoToSearch = () => {
    handleSearchClose()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 h-14 md:hidden flex items-center justify-between px-4 border-b"
        style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
      >
        <Link href="/" className="select-none">
          <span
            className="text-2xl tracking-[0.15em]"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-bebas), sans-serif' }}
          >
            SPACEFEEL
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
            aria-label={t('search.placeholder')}
          >
            <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
          </button>

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors overflow-hidden"
              style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
              aria-label={t('profile.account')}
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
                  {session?.user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 mb-3 p-2 rounded-xl transition-colors"
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                      >
                        {session.user.image ? (
                          <Image src={session.user.image} width={36} height={36} className="rounded-full flex-shrink-0" alt="" />
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-overlay)' }}>
                            <User size={16} style={{ color: 'var(--color-text-muted)' }} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{session.user.name}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{session.user.email}</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => { setProfileOpen(false); signOut({ callbackUrl: '/' }) }}
                        className="w-full flex items-center gap-2 rounded-xl py-2.5 px-3 text-sm font-medium transition-colors mb-1"
                        style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text)' }}
                      >
                        <LogOut size={14} />
                        {t('profile.logout')}
                      </button>
                      <div className="border-t my-3" style={{ borderColor: 'var(--color-border)' }} />
                    </>
                  ) : (
                    <>
                      <p className="text-sm mb-3 text-center" style={{ color: 'var(--color-text-muted)' }}>{t('profile.notLoggedIn') || 'Not logged in'}</p>
                      <div className="border-t my-3" style={{ borderColor: 'var(--color-border)' }} />
                    </>
                  )}

                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-subtle)' }}>{t('profile.language')}</p>
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

                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-subtle)' }}>{t('profile.theme')}</p>
                  <div className="flex flex-col gap-1">
                    {themeOptions.map(({ value, label, Icon }) => {
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

      {/* Full-screen search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] md:hidden flex flex-col"
            style={{ backgroundColor: 'var(--color-bg)' }}
          >
            {/* Search bar */}
            <div
              className="flex items-center gap-3 px-4 h-14 border-b flex-shrink-0"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {loading
                ? <Loader2 size={16} className="flex-shrink-0 animate-spin" style={{ color: 'var(--color-text-subtle)' }} />
                : <Search size={16} className="flex-shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
              }
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--color-text)' }}
              />
              {query ? (
                <button onClick={() => setQuery('')} className="p-1">
                  <X size={16} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              ) : null}
              <button
                onClick={handleSearchClose}
                className="ml-1 text-sm font-medium px-2 py-1 rounded-lg"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {t('common.cancel') || 'Cancel'}
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {results.length > 0 ? (
                <>
                  {results.map(item => {
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
                      ? t('search.anime')
                      : item.media_type === 'tv'
                        ? t('search.tvShow')
                        : t('search.movie')

                    return (
                      <Link
                        key={`${item.source ?? 'tmdb'}-${item.id}`}
                        href={href}
                        onClick={handleSearchClose}
                        className="flex items-center gap-3 px-4 py-3 border-b active:opacity-60 transition-opacity"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        {posterSrc ? (
                          <Image
                            src={posterSrc}
                            width={36}
                            height={54}
                            className="rounded-md object-cover flex-shrink-0"
                            alt={itemTitle}
                          />
                        ) : (
                          <div className="w-9 h-[54px] rounded-md flex-shrink-0" style={{ backgroundColor: 'var(--color-overlay)' }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{itemTitle}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            {typeLabel}{year ? ` · ${year}` : ''}
                          </p>
                        </div>
                      </Link>
                    )
                  })}

                  {/* See all results */}
                  <button
                    onClick={handleGoToSearch}
                    className="w-full flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {t('search.viewAll') || 'See all results'}
                    <ArrowRight size={14} />
                  </button>
                </>
              ) : loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-text-subtle)' }} />
                </div>
              ) : query.length >= 2 ? (
                <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {t('search.noResults')}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--color-text-subtle)' }}>
                  {t('search.typeHint')}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
