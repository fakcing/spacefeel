'use client'
import { useEffect } from 'react'
import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react'
import { useWatchlistStore } from '@/store/watchlistStore'

function WatchlistSync() {
  const { data: session, status } = useSession()
  const syncFromDB = useWatchlistStore((s) => s.syncFromDB)
  const clearItems = useWatchlistStore((s) => s.clearItems)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      syncFromDB()
    } else if (status === 'unauthenticated') {
      clearItems()
    }
  }, [session, status, syncFromDB, clearItems])

  return null
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <WatchlistSync />
      {children}
    </NextAuthSessionProvider>
  )
}
