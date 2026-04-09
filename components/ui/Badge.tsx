interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export default function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full text-xs px-3 py-1 font-medium transition-colors ${className}`}
      style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
    >
      {children}
    </span>
  )
}
