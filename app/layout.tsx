import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AuthModal from '@/components/ui/AuthModal'
import PageTransition from '@/components/layout/PageTransition'
import ScrollToTop from '@/components/ui/ScrollToTop'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '900'] })

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <NextIntlClientProvider messages={messages}>
            <Navbar />
            <PageTransition>{children}</PageTransition>
            <Footer />
            <AuthModal />
            <ScrollToTop />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
