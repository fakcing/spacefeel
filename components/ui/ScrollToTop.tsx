'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          whileTap={{ scale: 0.9 }}
          className="hidden sm:flex fixed bottom-6 right-6 z-50 w-10 h-10
                     bg-white/10 hover:bg-white/20
                     border border-white/20 rounded-xl
                     backdrop-blur-sm
                     items-center justify-center
                     transition-colors duration-200"
          aria-label="Scroll to top"
        >
          <ChevronUp size={18} className="text-white/70" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
