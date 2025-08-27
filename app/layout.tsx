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

export const metadata: Metadata = {
  title: 'PeerVerse - Learn Together, Grow Forever',
  description: 'Connect with peers, share knowledge, and unlock your potential in our vibrant learning community',
    generator: 'v0.app'
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
