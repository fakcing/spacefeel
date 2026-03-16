'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react'
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

function GitHubLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

export default function AuthModal() {
  const { isOpen, close } = useAuthModalStore()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const reset = () => {
    setError('')
    setName('')
    setEmail('')
    setPassword('')
    setLoading(false)
  }

  const handleClose = () => {
    reset()
    close()
  }

  const handleGoogle = () => signIn('google', { callbackUrl: '/' })
  const handleGitHub = () => signIn('github', { callbackUrl: '/' })

  const handleCredentials = async () => {
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      handleClose()
      window.location.reload()
    }
  }

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Registration failed')
      setLoading(false)
    } else {
      await signIn('credentials', { email, password, redirect: false })
      handleClose()
      window.location.reload()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative rounded-2xl p-8 w-full max-w-md"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-900/40 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Logo */}
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="52" height="52">
                <rect width="32" height="32" rx="6" fill="#0d0d0d"/>
                <text x="16" y="23" fontFamily="Inter, Arial Black, system-ui, sans-serif" fontSize="28" fontWeight="900" fill="white" textAnchor="middle">s</text>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-center mt-4">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-900/50 dark:text-white/50 text-sm text-center mb-6">
              {mode === 'signin' ? 'Sign in to continue to your account' : 'Sign up to get started'}
            </p>

            {/* OAuth buttons */}
            <button
              onClick={handleGoogle}
              className="w-full bg-black/[0.08] dark:bg-white/[0.08] hover:bg-black/[0.15] dark:hover:bg-white/[0.15] border border-black/10 dark:border-white/10 rounded-xl py-3 flex items-center justify-center gap-3 transition-colors mb-2"
            >
              <GoogleLogo />
              <span className="text-sm font-medium">Continue with Google</span>
            </button>
            <button
              onClick={handleGitHub}
              className="w-full bg-black/[0.08] dark:bg-white/[0.08] hover:bg-black/[0.15] dark:hover:bg-white/[0.15] border border-black/10 dark:border-white/10 rounded-xl py-3 flex items-center justify-center gap-3 transition-colors mb-4"
            >
              <GitHubLogo />
              <span className="text-sm font-medium">Continue with GitHub</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-black/10 dark:border-white/10" />
              <span className="text-gray-900/30 dark:text-white/30 text-xs">Or continue with</span>
              <div className="flex-1 border-t border-black/10 dark:border-white/10" />
            </div>

            {/* Name field (sign up only) */}
            {mode === 'signup' && (
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900/30 dark:text-white/30 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 pl-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-900/30 dark:placeholder:text-white/30 outline-none focus:border-black/25 dark:focus:border-white/25 transition-colors"
                />
              </div>
            )}

            {/* Email */}
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900/30 dark:text-white/30 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 pl-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-900/30 dark:placeholder:text-white/30 outline-none focus:border-black/25 dark:focus:border-white/25 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900/30 dark:text-white/30 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (mode === 'signin' ? handleCredentials() : handleRegister())}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 pl-10 pr-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-900/30 dark:placeholder:text-white/30 outline-none focus:border-black/25 dark:focus:border-white/25 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900/30 dark:text-white/30 hover:text-gray-900/60 dark:hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-xs text-center mb-3">{error}</p>
            )}

            {/* Submit */}
            <motion.button
              onClick={mode === 'signin' ? handleCredentials : handleRegister}
              disabled={loading}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-xl py-3 hover:bg-gray-800 dark:hover:bg-white/90 transition-colors mb-4 flex items-center justify-center gap-2 disabled:opacity-60"
              whileTap={{ scale: 0.98 }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </motion.button>

            {/* Toggle mode */}
            <p className="text-gray-900/40 dark:text-white/40 text-sm text-center">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <span
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
                className="text-gray-900 dark:text-white font-semibold cursor-pointer hover:text-gray-900/80 dark:hover:text-white/80 transition-colors"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
