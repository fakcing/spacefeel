import type { Metadata } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AuthModal from '@/components/ui/AuthModal'
import PageTransition from '@/components/layout/PageTransition'
import ScrollToTop from '@/components/ui/ScrollToTop'
import AniPlayerModal from '@/components/anime/AniPlayerModal'
import { SessionProvider } from '@/components/providers/SessionProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '900'], variable: '--font-inter' })

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
})

export const metadata: Metadata = {
  title: 'spacefeel',
  description: 'Cinema information platform',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'spacefeel',
    description: 'Cinema information platform',
    images: ['/favicon.svg'],
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages()
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${bebasNeue.variable}`}>
      <body className={inter.variable} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SessionProvider>
            <NextIntlClientProvider messages={messages}>
              <Navbar />
              <PageTransition>{children}</PageTransition>
              <Footer />
              <AuthModal />
              <ScrollToTop />
              <AniPlayerModal />
            </NextIntlClientProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
