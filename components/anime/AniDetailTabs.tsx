'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { YaniAnime } from '@/types/yani'

interface Props {
  title: YaniAnime
}

export default function AniDetailTabs({ title }: Props) {
  const t = useTranslations('detail')
  const TABS = [t('overview'), t('details')] as const
  type Tab = typeof TABS[number]
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0])

  const details = [
    { label: t('year'),     value: title.year ? String(title.year) : null },
    { label: t('type'),     value: title.type?.name },
    { label: t('episodes'), value: title.episodes?.count > 0 ? String(title.episodes.count) : title.episodes?.aired > 0 ? String(title.episodes.aired) : null },
    { label: t('status'),   value: title.anime_status?.title },
    { label: t('rating'),   value: title.rating.average > 0 ? title.rating.average.toFixed(1) : null },
  ].filter(i => i.value)

  const platformRatings = [
    { label: 'MyAnimeList', value: title.rating.myanimelist_rating },
    { label: 'Shikimori',   value: title.rating.shikimori_rating },
    { label: 'KinoPoisk',   value: title.rating.kp_rating },
  ].filter(r => r.value > 0)

  const dubbings = Array.from(
    new Set(
      title.translates?.map(tr => tr.title).filter(Boolean) ?? []
    )
  )

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={
              activeTab === tab
                ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }
                : { color: 'var(--color-text-muted)' }
            }
            onMouseEnter={(e) => {
              if (activeTab !== tab) e.currentTarget.style.backgroundColor = 'var(--color-overlay)'
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) e.currentTarget.style.backgroundColor = ''
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overview tab */}
          {activeTab === TABS[0] && (
            <p className="leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {title.description || '—'}
            </p>
          )}

          {/* Details tab */}
          {activeTab === TABS[1] && (
            <div className="space-y-6">
              {/* Info grid */}
              {details.length > 0 && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {details.map(item => (
                    <div key={item.label}>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-subtle)' }}>
                        {item.label}
                      </p>
                      <p style={{ color: 'var(--color-text)' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Platform ratings */}
              {platformRatings.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-subtle)' }}>
                    {t('rating')}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {platformRatings.map(r => (
                      <div
                        key={r.label}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl"
                        style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
                      >
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                          {r.value.toFixed(1)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dubbing */}
              {dubbings.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-subtle)' }}>
                    {t('dubbing')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dubbings.map(dub => (
                      <span
                        key={dub}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                      >
                        {dub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
