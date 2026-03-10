'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Movie, TVShow, Person } from '@/types/tmdb'

interface DetailTabsProps {
  item: Movie | TVShow
  cast: Person[]
}

export default function DetailTabs({ item, cast }: DetailTabsProps) {
  const t = useTranslations('detail')

  const TABS = [t('overview'), t('cast'), t('details')] as const
  type Tab = typeof TABS[number]

  const [activeTab, setActiveTab] = useState<Tab>(TABS[0])

  const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date
  const runtime = 'runtime' in item ? item.runtime : undefined
  const seasons = 'number_of_seasons' in item ? item.number_of_seasons : undefined

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

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === TABS[0] && (
            <p className="text-[var(--text-muted)] leading-relaxed">{item.overview}</p>
          )}

          {activeTab === TABS[1] && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {cast.slice(0, 12).map((person) => (
                <div key={`${person.id}-${person.character}`} className="flex items-center gap-3">
                  {person.profile_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      width={48}
                      height={48}
                      className="rounded-full object-cover flex-shrink-0"
                      alt={person.name}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-overlay)' }}>
                      <User size={20} style={{ color: 'var(--color-text-subtle)' }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{person.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === TABS[2] && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {item.status && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-subtle)' }}>{t('status')}</p>
                  <p style={{ color: 'var(--color-text)' }}>{item.status}</p>
                </div>
              )}
              {releaseDate && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-subtle)' }}>{t('releaseDate')}</p>
                  <p style={{ color: 'var(--color-text)' }}>{releaseDate}</p>
                </div>
              )}
              {runtime ? (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-subtle)' }}>{t('runtime')}</p>
                  <p style={{ color: 'var(--color-text)' }}>{runtime} min</p>
                </div>
              ) : seasons ? (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-subtle)' }}>{t('seasons')}</p>
                  <p style={{ color: 'var(--color-text)' }}>{seasons} season{seasons !== 1 ? 's' : ''}</p>
                </div>
              ) : null}
              {item.original_language && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-subtle)' }}>{t('language')}</p>
                  <p className="uppercase" style={{ color: 'var(--color-text)' }}>{item.original_language}</p>
                </div>
              )}
              {item.vote_count > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-subtle)' }}>{t('voteCount')}</p>
                  <p style={{ color: 'var(--color-text)' }}>{item.vote_count.toLocaleString()}</p>
                </div>
              )}
              {item.budget && item.budget > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-subtle)' }}>{t('budget')}</p>
                  <p style={{ color: 'var(--color-text)' }}>${item.budget.toLocaleString()}</p>
                </div>
              ) : null}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
