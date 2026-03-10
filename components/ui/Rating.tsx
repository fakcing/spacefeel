import { Star } from 'lucide-react'

interface RatingProps {
  value: number
  count?: number
  size?: number
}

export default function Rating({ value, count, size = 14 }: RatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Star size={size} className="text-yellow-400 fill-yellow-400" />
      <span className="text-sm font-semibold">{value.toFixed(1)}</span>
      <span className="text-xs text-[var(--text-muted)]">/ 10</span>
      {count !== undefined && (
        <span className="text-xs text-[var(--text-muted)] ml-1">({count.toLocaleString('en-US')})</span>
      )}
    </div>
  )
}
