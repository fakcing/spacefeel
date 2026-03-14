interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export default function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`bg-black/10 dark:bg-white/10 rounded-full text-xs px-3 py-1 ${className}`}>
      {children}
    </span>
  )
}
