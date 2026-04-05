'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useLocale, useTranslations } from 'next-intl'
import { Sun, Moon, Monitor, Check, Trash2, Save, User } from 'lucide-react'

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

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const { theme, setTheme } = useTheme()
  const locale = useLocale()
  const t = useTranslations('settings')

  const [mounted, setMounted] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [nameError, setNameError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (session?.user?.name) setNameValue(session.user.name)
  }, [session?.user?.name])

  const themes = [
    { value: 'light',  label: t('light'),  Icon: Sun },
    { value: 'dark',   label: t('dark'),   Icon: Moon },
    { value: 'system', label: t('system'), Icon: Monitor },
  ]

  const handleLanguageChange = (code: string) => {
    document.cookie = `locale=${code};path=/;max-age=31536000`
    window.location.reload()
  }

  const handleNameSave = async () => {
    if (!nameValue.trim()) return
    setNameSaving(true)
    setNameError('')
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameValue.trim() }),
      })
      if (!res.ok) throw new Error()
      await updateSession({ name: nameValue.trim() })
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2500)
    } catch {
      setNameError(t('saveError'))
    } finally {
      setNameSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return }
    setDeleting(true)
    try {
      await fetch('/api/user', { method: 'DELETE' })
      await signOut({ callbackUrl: '/' })
    } catch {
      setDeleting(false)
      setDeleteConfirm(false)
    }
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: 'var(--color-text-subtle)' }}>
        {title}
      </p>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        {children}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 md:px-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-8" style={{ color: 'var(--color-text)' }}>
        {t('title')}
      </h1>

      {/* Appearance */}
      <Section title={t('appearance')}>
        <div className="p-4 flex flex-col gap-2" style={{ backgroundColor: 'var(--color-surface)' }}>
          {mounted && themes.map(({ value, label, Icon }) => {
            const active = theme === value
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-left transition-all"
                style={{
                  backgroundColor: active ? 'var(--color-overlay)' : 'transparent',
                  border: active ? '1px solid var(--color-border-strong)' : '1px solid transparent',
                  color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontWeight: active ? 500 : undefined,
                }}
              >
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                {active && <Check size={14} style={{ color: 'var(--color-text-subtle)' }} />}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Language */}
      <Section title={t('language')}>
        <div style={{ backgroundColor: 'var(--color-surface)' }}>
          {LANGUAGES.map((lang, i) => {
            const active = locale === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                style={{
                  borderBottom: i < LANGUAGES.length - 1 ? '1px solid var(--color-border)' : undefined,
                  backgroundColor: active ? 'var(--color-overlay)' : 'transparent',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-hover)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
              >
                <span className="text-[10px] font-bold w-6 text-left" style={{ color: 'var(--color-text-subtle)' }}>{lang.badge}</span>
                <span className="flex-1 text-left" style={{ color: active ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{lang.label}</span>
                {active && <Check size={14} style={{ color: 'var(--color-text-subtle)' }} />}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Account */}
      {session?.user && (
        <Section title={t('account')}>
          <div className="p-4" style={{ backgroundColor: 'var(--color-surface)' }}>
            {/* Display name */}
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>{t('displayName')}</p>
            <div className="flex gap-2 mb-1">
              <div className="flex-1 relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
                <input
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                  maxLength={50}
                  className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-overlay)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <button
                onClick={handleNameSave}
                disabled={nameSaving || !nameValue.trim() || nameValue.trim() === session.user.name}
                className="rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: nameSaved ? '#22c55e' : 'var(--color-text)', color: 'var(--color-bg)' }}
              >
                {nameSaved ? <Check size={14} /> : <Save size={14} />}
                {nameSaved ? t('saved') : t('save')}
              </button>
            </div>
            {nameError && (
              <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{nameError}</p>
            )}

            <div className="border-t my-5" style={{ borderColor: 'var(--color-border)' }} />

            {/* Email (read-only) */}
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>{t('email')}</p>
            <p className="text-sm mb-6 px-1" style={{ color: 'var(--color-text-subtle)' }}>{session.user.email}</p>

            <div className="border-t mb-5" style={{ borderColor: 'var(--color-border)' }} />

            {/* Delete account */}
            <p className="text-xs font-medium mb-1" style={{ color: '#ef4444' }}>{t('dangerZone')}</p>
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-subtle)' }}>{t('deleteWarning')}</p>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40"
              style={{
                backgroundColor: deleteConfirm ? '#ef4444' : 'var(--color-overlay)',
                border: '1px solid ' + (deleteConfirm ? '#ef4444' : 'var(--color-border)'),
                color: deleteConfirm ? 'white' : '#ef4444',
              }}
            >
              <Trash2 size={14} />
              {deleting ? t('deleting') : deleteConfirm ? t('confirmDelete') : t('deleteAccount')}
            </button>
            {deleteConfirm && !deleting && (
              <button
                onClick={() => setDeleteConfirm(false)}
                className="mt-2 text-xs"
                style={{ color: 'var(--color-text-subtle)' }}
              >
                {t('cancel')}
              </button>
            )}
          </div>
        </Section>
      )}
    </div>
  )
}
