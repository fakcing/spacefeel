'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { User, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Movie, TVShow, Person, Season, EpisodeItem } from '@/types/tmdb'

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

interface DetailTabsProps {
  item: Movie | TVShow
  cast: Person[]
}

function EpisodesTab({ tvId, seasons }: { tvId: number; seasons: Season[] }) {
  const t = useTranslations('detail')
  const visibleSeasons = seasons.filter((s) => s.season_number > 0)
  const [selectedSeason, setSelectedSeason] = useState(
    visibleSeasons[0]?.season_number ?? 1
  )
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${selectedSeason}?api_key=${API_KEY}&language=en-US`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setEpisodes(data.episodes ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [tvId, selectedSeason])

  const formatDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div>
      {/* Season selector */}
      {visibleSeasons.length > 1 && (
        <div className="relative inline-block mb-5">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-sm font-medium cursor-pointer focus:outline-none"
            style={{
              backgroundColor: 'var(--color-overlay)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border, rgba(128,128,128,0.2))',
            }}
          >
            {visibleSeasons.map((s) => (
              <option key={s.season_number} value={s.season_number}>
                {s.name || `Season ${s.season_number}`}
                {s.episode_count ? ` · ${s.episode_count} ep.` : ''}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      )}

      {/* Episode list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-overlay)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {episodes.map((ep) => (
            <div
              key={ep.id}
              className="flex gap-3 p-2.5 rounded-xl transition-colors"
              style={{ backgroundColor: 'var(--color-overlay)' }}
            >
              {/* Still image */}
              {ep.still_path ? (
                <div className="relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden">
                  <Image
                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                    alt={ep.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div
                  className="flex-shrink-0 w-24 h-14 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg)' }}
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--color-text-subtle)' }}>
                    {ep.episode_number}
                  </span>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                    {ep.name}
                  </p>
                  {ep.runtime && (
                    <span className="text-xs flex-shrink-0 ml-auto" style={{ color: 'var(--color-text-subtle)' }}>
                      {ep.runtime} min
                    </span>
                  )}
                </div>
                {ep.air_date && (
                  <p className="text-[11px] mb-1" style={{ color: 'var(--color-text-subtle)' }}>
                    {formatDate(ep.air_date)}
                  </p>
                )}
                {ep.overview && (
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                    {ep.overview}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DetailTabs({ item, cast }: DetailTabsProps) {
  const t = useTranslations('detail')

  const isTVShow = 'name' in item
  const seasons = isTVShow ? (item as TVShow).seasons ?? [] : []
  const hasEpisodes = isTVShow && seasons.some((s) => s.season_number > 0)

  const TABS = [
    t('overview'),
    t('cast'),
    t('details'),
    ...(hasEpisodes ? [t('episodes')] : []),
  ] as const
  type Tab = string

  const [activeTab, setActiveTab] = useState<Tab>(TABS[0])

  const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date
  const runtime = 'runtime' in item ? item.runtime : undefined
  const seasonCount = 'number_of_seasons' in item ? item.number_of_seasons : undefined

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 flex-wrap">
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
          {activeTab === t('overview') && (
            <p className="text-[var(--text-muted)] leading-relaxed">{item.overview}</p>
          )}

          {activeTab === t('cast') && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {cast.slice(0, 12).map((person) => (
                <Link
                  key={`${person.id}-${person.character}`}
                  href={`/actors/${person.id}`}
                  className="flex items-center gap-3 group"
                >
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
                    <p className="text-sm font-medium truncate group-hover:underline" style={{ color: 'var(--color-text)' }}>{person.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{person.character}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === t('details') && (
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
              ) : seasonCount ? (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-subtle)' }}>{t('seasons')}</p>
                  <p style={{ color: 'var(--color-text)' }}>{seasonCount} season{seasonCount !== 1 ? 's' : ''}</p>
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
                  <p style={{ color: 'var(--color-text)' }}>{item.vote_count.toLocaleString('en-US')}</p>
                </div>
              )}
              {item.budget && item.budget > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-subtle)' }}>{t('budget')}</p>
                  <p style={{ color: 'var(--color-text)' }}>${item.budget.toLocaleString('en-US')}</p>
                </div>
              ) : null}
            </div>
          )}

          {hasEpisodes && activeTab === t('episodes') && (
            <EpisodesTab tvId={item.id} seasons={seasons} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
