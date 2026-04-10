'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react'
import { useAuthModalStore } from '@/store/authModalStore'

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function GitHubLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
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

  const reset = () => { setError(''); setName(''); setEmail(''); setPassword(''); setLoading(false) }
  const handleClose = () => { reset(); close() }
  const handleGoogle = () => signIn('google', { callbackUrl: '/' })
  const handleGitHub = () => signIn('github', { callbackUrl: '/' })

  const handleCredentials = async () => {
    setLoading(true); setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) { setError('Invalid email or password'); setLoading(false) }
    else { handleClose(); window.location.reload() }
  }

  const handleRegister = async () => {
    setLoading(true); setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Registration failed'); setLoading(false)
    } else {
      await signIn('credentials', { email, password, redirect: false })
      handleClose(); window.location.reload()
    }
  }

  const inputStyle = {
    backgroundColor: 'var(--color-overlay)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-sm rounded-2xl p-6"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'var(--color-text-subtle)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Brand */}
            <div className="text-center mb-6">
              <span className="text-2xl tracking-[0.15em] font-bold"
                style={{ fontFamily: 'var(--font-bebas), sans-serif', color: 'var(--color-text)' }}>
                SPACEFEEL
              </span>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-subtle)' }}>
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </p>
            </div>

            {/* OAuth */}
            <div className="flex flex-col gap-2 mb-4">
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl py-2.5 text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-overlay)')}
              >
                <GoogleLogo />
                Continue with Google
              </button>
              <button
                onClick={handleGitHub}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl py-2.5 text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-overlay)')}
              >
                <GitHubLogo />
                Continue with GitHub
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t" style={{ borderColor: 'var(--color-border)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>or</span>
              <div className="flex-1 border-t" style={{ borderColor: 'var(--color-border)' }} />
            </div>

            <div className="flex flex-col gap-2.5">
              {mode === 'signup' && (
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-subtle)' }} />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none transition-colors"
                    style={{ ...inputStyle, caretColor: 'var(--color-text)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  />
                </div>
              )}
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-subtle)' }} />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none transition-colors"
                  style={{ ...inputStyle, caretColor: 'var(--color-text)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-subtle)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (mode === 'signin' ? handleCredentials() : handleRegister())}
                  className="w-full rounded-xl py-2.5 pl-9 pr-10 text-sm outline-none transition-colors"
                  style={{ ...inputStyle, caretColor: 'var(--color-text)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-text-subtle)' }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-center mt-3" style={{ color: '#ef4444' }}>{error}</p>
            )}

            <motion.button
              onClick={mode === 'signin' ? handleCredentials : handleRegister}
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl py-2.5 text-sm font-semibold mt-4 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </motion.button>

            <p className="text-xs text-center mt-4" style={{ color: 'var(--color-text-subtle)' }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
                className="font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-text)' }}
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
