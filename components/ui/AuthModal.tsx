'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthModalStore } from '@/store/authModalStore'

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export default function AuthModal() {
  const { isOpen, close } = useAuthModalStore()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-md"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="48" height="48">
                  <rect width="32" height="32" rx="6" fill="#0d0d0d"/>
                  <text x="16" y="24" fontFamily="Inter, system-ui, sans-serif"
                        fontSize="24" fontWeight="700" fill="white"
                        textAnchor="middle">s</text>
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mt-4">Welcome Back</h2>
            <p className="text-white/50 text-sm text-center mb-6">Sign in to continue to your account</p>

            {/* Google button */}
            <button className="w-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 rounded-xl py-3 flex items-center justify-center gap-3 transition-colors mb-4">
              <GoogleLogo />
              <span className="text-sm font-medium">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-white/10" />
              <span className="text-white/30 text-xs">Or continue with</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            {/* Email input */}
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-10 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25 transition-colors"
              />
            </div>

            {/* Password input */}
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-10 pr-10 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Sign In button */}
            <motion.button
              className="w-full bg-white text-black font-semibold rounded-xl py-3 hover:bg-white/90 transition-colors mb-4"
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>

            {/* Sign up link */}
            <p className="text-white/40 text-sm text-center">
              Don&apos;t have an account?{' '}
              <span className="text-white font-semibold cursor-pointer hover:text-white/80 transition-colors">
                Sign up
              </span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
