'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Star, Loader2, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAuthModalStore } from '@/store/authModalStore'

interface RatingEntry {
  id: string
  score: number
  review: string | null
  createdAt: string
  user: { name: string | null; image: string | null }
}

interface RatingData {
  ratings: RatingEntry[]
  average: number
  count: number
  myRatingId: string | null
}

interface UserRatingProps {
  tmdbId: number
  mediaType: 'movie' | 'tv' | 'anime'
}

export default function UserRating({ tmdbId, mediaType }: UserRatingProps) {
  const { data: session } = useSession()
  const { open: openAuthModal } = useAuthModalStore()
  const t = useTranslations('detail')

  const [data, setData] = useState<RatingData | null>(null)
  const [score, setScore] = useState(0)
  const [hover, setHover] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/ratings?tmdbId=${tmdbId}&mediaType=${mediaType}`)
      .then((r) => r.ok ? r.json() : Promise.resolve(null))
      .then((d) => { if (d) setData(d) })
      .catch(() => {})
  }, [tmdbId, mediaType, submitted])

  const handleSubmit = async () => {
    if (!session) { openAuthModal(); return }
    if (!score) return
    setSubmitting(true)
    await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbId, mediaType, score, review }),
    })
    setSubmitting(false)
    setScore(0)
    setReview('')
    setSubmitted((v) => !v)
  }

  const handleDelete = async () => {
    if (!session) return
    setDeleting(true)
    await fetch(`/api/ratings?tmdbId=${tmdbId}&mediaType=${mediaType}`, { method: 'DELETE' })
    setDeleting(false)
    setSubmitted((v) => !v)
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
        {t('communityRating')}
        {data && data.count > 0 && (
          <span className="ml-2 text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>
            {data.average.toFixed(1)} / 10 · {data.count}
          </span>
        )}
      </h3>

      <div className="mb-4">
        <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
          {session ? t('yourRating') : t('signInToRate')}
        </p>
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => session ? setScore(n) : openAuthModal()}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={22}
                className={`transition-colors ${
                  n <= (hover || score) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-900/20 dark:text-white/20'
                }`}
              />
            </button>
          ))}
        </div>

        {score > 0 && session && (
          <>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={t('writeReview')}
              rows={3}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm placeholder:text-black/30 dark:placeholder:text-white/30 outline-none focus:border-black/25 dark:focus:border-white/25 transition-colors resize-none mb-2"
              style={{ color: 'var(--color-text)' }}
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-full px-5 py-2 text-sm hover:bg-gray-800 dark:hover:bg-white/90 transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {t('submitRating')}
            </button>
          </>
        )}
      </div>

      {data && data.ratings.length > 0 && (
        <div className="space-y-3">
          {data.ratings.map((r) => {
            const isOwn = data.myRatingId === r.id
            return (
              <div
                key={r.id}
                className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {r.user.image ? (
                    <Image src={r.user.image} width={28} height={28} className="rounded-full flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-overlay)' }} />
                  )}
                  <span className="text-sm font-medium flex-1 min-w-0 truncate" style={{ color: 'var(--color-text)' }}>
                    {r.user.name ?? 'User'}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Star size={13} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.score}/10</span>
                  </div>
                  {isOwn && session && (
                    <button
                      onClick={() => handleDelete()}
                      disabled={deleting}
                      className="ml-1 p-1 rounded-lg transition-colors hover:bg-red-500/15 text-red-400/60 hover:text-red-400"
                      title={t('deleteRating')}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                {r.review && (
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{r.review}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
