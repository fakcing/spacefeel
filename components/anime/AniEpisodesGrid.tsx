'use client'

import { Play } from 'lucide-react'
import { AniEpisode } from '@/types/anilibria'
import { useAniPlayerStore } from '@/store/aniPlayerStore'

interface Props {
  episodes: AniEpisode[]
  titleName: string
}

export default function AniEpisodesGrid({ episodes, titleName }: Props) {
  const { openPlayer } = useAniPlayerStore()

  return (
    <section className="max-w-5xl mx-auto px-6 pb-16">
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>
        Серии ({episodes.length})
      </h2>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        {episodes.map((ep) => (
          <button
            key={ep.ordinal}
            onClick={() => openPlayer({ episodes, titleName, startEpisode: ep.ordinal })}
            className="group relative aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--color-overlay)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span className="group-hover:opacity-0 transition-opacity">{ep.ordinal}</span>
            <Play
              size={14}
              className="absolute opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--color-text)' }}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
