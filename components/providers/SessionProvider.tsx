'use client'
import { useEffect } from 'react'
import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react'
import { useWatchlistStore } from '@/store/watchlistStore'

function WatchlistSync() {
  const { data: session } = useSession()
  const syncFromDB = useWatchlistStore((s) => s.syncFromDB)

  useEffect(() => {
    if (session?.user) syncFromDB()
  }, [session, syncFromDB])

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
