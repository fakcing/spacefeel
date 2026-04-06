'use client'

import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  initialQ: string
  type: string
}

export default function SearchPageInput({ initialQ, type }: Props) {
  const t = useTranslations('search')
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [value, setValue] = useState(initialQ)
  const [isPending, startTransition] = useTransition()

  const handleChange = (v: string) => {
    setValue(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (v) params.set('q', v)
      if (type && type !== 'all') params.set('type', type)
      startTransition(() => {
        router.replace(`/search?${params.toString()}`)
      })
    }, 400)
  }

  return (
    <div
      className="flex items-center rounded-xl px-4 py-3 gap-3 transition-all"
      style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
    >
      {isPending
        ? <Loader2 size={16} className="flex-shrink-0 animate-spin" style={{ color: 'var(--color-text-subtle)' }} />
        : <Search size={16} className="flex-shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
      }
      <input
        type="text"
        value={value}
        onChange={e => handleChange(e.target.value)}
        placeholder={t('placeholder')}
        autoFocus
        className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
        style={{ color: 'var(--color-text)' }}
      />
      {value && (
        <button onClick={() => handleChange('')} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          <X size={14} />
        </button>
      )}
    </div>
  )
}
