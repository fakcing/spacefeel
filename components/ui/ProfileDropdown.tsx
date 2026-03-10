'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { User, ChevronUp, Check, Sun, Moon, Monitor } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSettingsStore } from '@/store/settingsStore'

const LANGUAGES = [
  { code: 'en', label: 'English',    badge: 'US' },
  { code: 'ru', label: 'Russian',    badge: 'RU' },
  { code: 'uk', label: 'Ukrainian',  badge: 'UA' },
  { code: 'de', label: 'German',     badge: 'DE' },
  { code: 'fr', label: 'French',     badge: 'FR' },
  { code: 'ja', label: 'Japanese',   badge: 'JP' },
  { code: 'ko', label: 'Korean',     badge: 'KR' },
  { code: 'es', label: 'Spanish',    badge: 'ES' },
]

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const { language } = useSettingsStore()
  const t = useTranslations('profile')

  useEffect(() => { setMounted(true) }, [])

  const themes = [
    { value: 'light',  label: t('light'),  Icon: Sun },
    { value: 'dark',   label: t('dark'),   Icon: Moon },
    { value: 'system', label: t('system'), Icon: Monitor },
  ]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false)
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  const handleLanguageChange = (lang: typeof LANGUAGES[0]) => {
    document.cookie = `locale=${lang.code};path=/;max-age=31536000`
    window.location.reload()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
        style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
        aria-label="Profile"
      >
        <User size={16} style={{ color: 'var(--color-text-muted)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-64 rounded-2xl shadow-2xl p-4 z-50"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {/* Account section */}
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-subtle)' }}>{t('account')}</p>
            <button className="w-full rounded-xl py-2.5 px-4 text-sm font-semibold transition-colors mb-2" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>
              {t('login')}
            </button>

            <div className="border-t my-4" style={{ borderColor: 'var(--color-border)' }} />

            {/* Language */}
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-subtle)' }}>{t('language')}</p>
            <div className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors"
                style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold w-5" style={{ color: 'var(--color-text-subtle)' }}>{selectedLang.badge}</span>
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>{selectedLang.label}</span>
                </div>
                <ChevronUp
                  size={14}
                  className={`transition-transform ${langOpen ? '' : 'rotate-180'}`}
                  style={{ color: 'var(--color-text-subtle)' }}
                />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden shadow-2xl z-50"
                    style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-bold w-5" style={{ color: 'var(--color-text-subtle)' }}>{lang.badge}</span>
                          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{lang.label}</span>
                        </div>
                        {language === lang.code && (
                          <Check size={14} style={{ color: 'var(--color-text-muted)' }} />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t my-4" style={{ borderColor: 'var(--color-border)' }} />

            {/* Theme */}
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-subtle)' }}>{t('theme')}</p>
            <div className="flex flex-col gap-1">
              {themes.map(({ value, label, Icon }) => {
                const isActive = mounted && theme === value
                return (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className="w-full rounded-xl py-2 px-3 text-sm text-left transition-all flex items-center gap-2"
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
  )
}
