'use client'

import { Play } from 'lucide-react'
import { useAniPlayerStore } from '@/store/aniPlayerStore'
import { YaniVideo } from '@/types/yani'

interface Props {
  videos: YaniVideo[]
  titleName: string
  shikimoriId: number
}

export default function AniPlayerButton({ videos, titleName, shikimoriId }: Props) {
  const { openPlayer } = useAniPlayerStore()

  const handlePlay = () => {
    openPlayer({ videos, titleName, shikimoriId })
  }

  return (
    <button
      onClick={handlePlay}
      className="flex items-center gap-2 px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:bg-black/80 dark:hover:bg-white/90 transition-colors"
    >
      <Play size={16} className="fill-white dark:fill-black" />
      Смотреть
    </button>
  )
}
