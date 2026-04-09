import { Star } from 'lucide-react'

interface RatingProps {
  value: number
  count?: number
  size?: number
}

export default function Rating({ value, count, size = 14 }: RatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Star size={size} className="text-amber-400 fill-amber-400 flex-shrink-0" />
      <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{value.toFixed(1)}</span>
      <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>/ 10</span>
      {count !== undefined && (
        <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>({count.toLocaleString('en-US')})</span>
      )}
    </div>
  )
}
