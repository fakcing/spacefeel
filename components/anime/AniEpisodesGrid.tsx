'use client'

import { Play } from 'lucide-react'
import { YaniVideo } from '@/types/yani'
import { useAniPlayerStore } from '@/store/aniPlayerStore'
import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  videos: YaniVideo[]
  titleName: string
  shikimoriId: number
}

export default function AniEpisodesGrid({ videos, titleName, shikimoriId }: Props) {
  const t = useTranslations('player')
  const { openPlayer } = useAniPlayerStore()

  // Unique dubbings
  const dubbings = useMemo(
    () => Array.from(new Set(videos.map((v) => v.data.dubbing))),
    [videos]
  )
  const firstDub = dubbings[0] ?? ''

  // All episodes for first dubbing
  const episodes = useMemo(() => {
    return videos
      .filter((v) => v.data.dubbing === firstDub)
      .sort((a, b) => Number(a.number) - Number(b.number))
  }, [videos, firstDub])

  if (episodes.length === 0) return null

  return (
    <section className="max-w-5xl mx-auto px-6 pb-16">
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>
        {t('episodes')} ({episodes.length})
      </h2>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        {episodes.map((ep) => (
          <button
            key={ep.video_id}
            onClick={() => openPlayer({ videos, titleName, shikimoriId, startEpisode: ep.number })}
            className="group relative aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--color-overlay)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span className="group-hover:opacity-0 transition-opacity">{ep.number}</span>
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
