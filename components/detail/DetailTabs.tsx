'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from 'lucide-react'
import { Movie, TVShow, Person } from '@/types/tmdb'

const TABS = ['Overview', 'Cast', 'Details'] as const
type Tab = typeof TABS[number]

interface DetailTabsProps {
  item: Movie | TVShow
  cast: Person[]
}

export default function DetailTabs({ item, cast }: DetailTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

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
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-black'
                : 'text-white/50 hover:text-white hover:bg-white/[0.08]'
            }`}
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
          {activeTab === 'Overview' && (
            <p className="text-[var(--text-muted)] leading-relaxed">{item.overview}</p>
          )}

          {activeTab === 'Cast' && (
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
                    <div className="w-12 h-12 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center">
                      <User size={20} className="text-white/30" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{person.name}</p>
                    <p className="text-xs text-white/50 truncate">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Details' && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {item.status && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Status</p>
                  <p className="text-white">{item.status}</p>
                </div>
              )}
              {releaseDate && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Release Date</p>
                  <p className="text-white">{releaseDate}</p>
                </div>
              )}
              {runtime ? (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Runtime</p>
                  <p className="text-white">{runtime} min</p>
                </div>
              ) : seasons ? (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Seasons</p>
                  <p className="text-white">{seasons} season{seasons !== 1 ? 's' : ''}</p>
                </div>
              ) : null}
              {item.original_language && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Original Language</p>
                  <p className="text-white uppercase">{item.original_language}</p>
                </div>
              )}
              {item.vote_count > 0 && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Vote Count</p>
                  <p className="text-white">{item.vote_count.toLocaleString()}</p>
                </div>
              )}
              {item.budget && item.budget > 0 ? (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Budget</p>
                  <p className="text-white">${item.budget.toLocaleString()}</p>
                </div>
              ) : null}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
