'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { User, ChevronDown, Check } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'

const languages = [
  { code: 'English',    flag: '🇺🇸', label: 'English' },
  { code: 'Ukrainian',  flag: '🇺🇦', label: 'Ukrainian' },
  { code: 'German',     flag: '🇩🇪', label: 'German' },
  { code: 'French',     flag: '🇫🇷', label: 'French' },
  { code: 'Japanese',   flag: '🇯🇵', label: 'Japanese' },
  { code: 'Korean',     flag: '🇰🇷', label: 'Korean' },
  { code: 'Spanish',    flag: '🇪🇸', label: 'Spanish' },
]

const themes = [
  { value: 'light',  label: '☀️ Light' },
  { value: 'dark',   label: '🌙 Dark' },
  { value: 'system', label: '💻 System' },
]

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useSettingsStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedLang = languages.find((l) => l.code === language) || languages[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors"
        aria-label="Profile"
      >
        <User size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-72 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl p-6 z-50"
          >
            {/* Account */}
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Account</p>
            <button className="w-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 rounded-xl py-2.5 text-sm font-medium transition-colors text-white">
              Login
            </button>

            <div className="border-t border-white/10 my-4" />

            {/* Language */}
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Language</p>
            <div className="relative">
              {/* Trigger */}
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="w-full flex items-center justify-between bg-white/[0.08] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white transition-colors hover:bg-white/[0.12]"
              >
                <span className="flex items-center gap-2">
                  <span>{selectedLang.flag}</span>
                  <span>{selectedLang.label}</span>
                </span>
                <ChevronDown
                  size={14}
                  className={`text-white/40 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Options */}
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-10 shadow-xl"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code)
                          setLangOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/[0.08] transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                        {language === lang.code && (
                          <Check size={14} className="text-white/60" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-white/10 my-4" />

            {/* Theme */}
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Theme</p>
            <div className="flex flex-col gap-1">
              {themes.map((t) => {
                const isActive = mounted && theme === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`w-full rounded-xl py-2 px-3 text-sm text-left transition-all ${
                      isActive
                        ? 'bg-white/15 border border-white/25 text-white font-medium'
                        : 'bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {t.label}
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
