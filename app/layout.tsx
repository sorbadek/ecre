import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Kalam } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/lib/auth-context'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })
const kalam = Kalam({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-kalam'
})

// Viewport configuration
export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'PeerVerse - Learn Together, Grow Forever',
  description: 'Connect with peers, share knowledge, and unlock your potential in our vibrant learning community',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'PeerVerse - Learn Together, Grow Forever',
    description: 'Connect with peers, share knowledge, and unlock your potential in our vibrant learning community',
    url: 'https://peer-verse.app',
    siteName: 'PeerVerse',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PeerVerse - Learn Together, Grow Forever',
    description: 'Connect with peers, share knowledge, and unlock your potential in our vibrant learning community',
    images: ['/og-image.jpg'],
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  metadataBase: new URL('https://peer-verse.app'),
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${kalam.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
