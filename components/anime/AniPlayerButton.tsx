'use client'

import { Play } from 'lucide-react'
import { useAniPlayerStore } from '@/store/aniPlayerStore'
import { AniEpisode } from '@/types/anilibria'

interface Props {
  episodes: AniEpisode[]
  host: string
  titleName: string
}

export default function AniPlayerButton({ episodes, host, titleName }: Props) {
  const { openPlayer } = useAniPlayerStore()

  const handlePlay = () => {
    openPlayer({
      episodes,
      host,
      titleName,
      startEpisode: episodes[0]?.serie ?? 1,
    })
  }

  return (
    <button
      onClick={handlePlay}
      className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
    >
      <Play size={16} fill="black" />
      Смотреть
    </button>
  )
}
