'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  label: string
  value: string
}

interface Props {
  label: string
  value: string
  options: SelectOption[]
  onChange: (v: string) => void
}

export default function FilterSelect({ label, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = !!value
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all whitespace-nowrap"
        style={
          isActive
            ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', border: '1px solid transparent' }
            : { backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }
        }
      >
        {selected?.label || label}
        <ChevronDown
          size={12}
          style={{
            opacity: 0.5,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-1.5 rounded-xl p-1 z-50 shadow-2xl min-w-[160px] max-h-60 overflow-y-auto"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {options.map(o => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className="w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={
                  o.value === value
                    ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }
                    : { color: 'var(--color-text-muted)' }
                }
                onMouseEnter={(e) => {
                  if (o.value !== value) e.currentTarget.style.backgroundColor = 'var(--color-hover)'
                }}
                onMouseLeave={(e) => {
                  if (o.value !== value) e.currentTarget.style.backgroundColor = ''
                }}
              >
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
