'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { User, ChevronDown, Check, Sun, Moon, Monitor, LogOut, UserCircle, Settings, Clock, ChevronRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuthModalStore } from '@/store/authModalStore'

const LANGUAGES = [
  { code: 'en', label: 'English',   badge: 'EN' },
  { code: 'ru', label: 'Russian',   badge: 'RU' },
  { code: 'uk', label: 'Ukrainian', badge: 'UK' },
  { code: 'de', label: 'German',    badge: 'DE' },
  { code: 'fr', label: 'French',    badge: 'FR' },
  { code: 'ja', label: 'Japanese',  badge: 'JA' },
  { code: 'ko', label: 'Korean',    badge: 'KO' },
  { code: 'es', label: 'Spanish',   badge: 'ES' },
]

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const locale = useLocale()
  const { setLanguage } = useSettingsStore()
  const { open: openAuthModal } = useAuthModalStore()
  const { data: session } = useSession()
  const t = useTranslations('profile')

  const currentLanguage = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0]

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setLanguage(locale) }, [locale, setLanguage])

  const themes = [
    { value: 'light',  label: t('light'),  Icon: Sun },
    { value: 'dark',   label: t('dark'),   Icon: Moon },
    { value: 'system', label: t('system'), Icon: Monitor },
  ]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) { setOpen(false); setLangOpen(false) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLanguageChange = async (lang: typeof LANGUAGES[0]) => {
    document.cookie = `locale=${lang.code};path=/;max-age=31536000`
    await fetch('/api/revalidate-locale', { method: 'POST' })
    window.location.reload()
  }

  const navItem = (href: string, icon: React.ReactNode, label: string) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className="w-full rounded-xl py-2.5 px-3 text-sm font-medium flex items-center gap-2.5 transition-colors"
      style={{ color: 'var(--color-text-muted)' }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-hover)'; e.currentTarget.style.color = 'var(--color-text)' }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-text-muted)' }}
    >
      {icon}
      <span className="flex-1">{label}</span>
      <ChevronRight size={12} className="opacity-30" />
    </Link>
  )

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors overflow-hidden"
        style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
        aria-label="Profile"
      >
        {session?.user?.image ? (
          <Image src={session.user.image} width={36} height={36} className="rounded-xl object-cover" alt={session.user.name ?? ''} />
        ) : (
          <User size={15} style={{ color: 'var(--color-text-muted)' }} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute top-full right-0 mt-2 w-64 rounded-2xl shadow-2xl overflow-hidden z-50"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {session?.user ? (
              <>
                {/* User info */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center gap-3">
                    {session.user.image ? (
                      <Image src={session.user.image} width={38} height={38} className="rounded-xl flex-shrink-0 object-cover" alt="" />
                    ) : (
                      <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-overlay)' }}>
                        <User size={16} style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{session.user.name}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--color-text-subtle)' }}>{session.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Nav links */}
                <div className="px-2 pb-2">
                  {navItem('/profile', <UserCircle size={15} />, t('viewProfile'))}
                  {navItem('/history', <Clock size={15} />, t('history'))}
                  {navItem('/settings', <Settings size={15} />, t('settings'))}
                </div>

                <div className="border-t mx-2" style={{ borderColor: 'var(--color-border)' }} />

                {/* Sign out */}
                <div className="px-2 py-2">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full rounded-xl py-2.5 px-3 text-sm font-medium flex items-center gap-2.5 transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-hover)'; e.currentTarget.style.color = 'var(--color-text)' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-text-muted)' }}
                  >
                    <LogOut size={15} />
                    {t('logout')}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-3">
                <button
                  onClick={() => { setOpen(false); openAuthModal() }}
                  className="w-full rounded-xl py-2.5 px-4 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}
                >
                  {t('login')}
                </button>
              </div>
            )}

            <div className="border-t mx-2" style={{ borderColor: 'var(--color-border)' }} />

            {/* Language */}
            <div className="px-3 pt-3 pb-2">
              <button
                onClick={() => setLangOpen(v => !v)}
                className="w-full flex items-center justify-between mb-2"
              >
                <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--color-text-subtle)' }}>{t('language')}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>{currentLanguage.badge}</span>
                  <ChevronDown size={11} className={`transition-transform duration-150 ${langOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--color-text-subtle)' }} />
                </div>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden rounded-xl"
                    style={{ border: '1px solid var(--color-border)' }}
                  >
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors"
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-bold w-5 text-left" style={{ color: 'var(--color-text-subtle)' }}>{lang.badge}</span>
                          <span style={{ color: locale === lang.code ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{lang.label}</span>
                        </div>
                        {locale === lang.code && <Check size={13} style={{ color: 'var(--color-text-subtle)' }} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme */}
            <div className="px-3 pb-3">
              <p className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: 'var(--color-text-subtle)' }}>{t('theme')}</p>
              <div className="grid grid-cols-3 gap-1">
                {themes.map(({ value, label, Icon }) => {
                  const isActive = mounted && theme === value
                  return (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className="flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-xs transition-all"
                      style={{
                        backgroundColor: isActive ? 'var(--color-overlay)' : 'transparent',
                        border: `1px solid ${isActive ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
                        color: isActive ? 'var(--color-text)' : 'var(--color-text-subtle)',
                        fontWeight: isActive ? 500 : undefined,
                      }}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
