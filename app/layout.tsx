import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Cairo, Libre_Baskerville, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-jakarta',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: '--font-cairo',
  display: 'swap',
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['400', '600', '700'],
})

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: '--font-baskerville',
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Wslni.ma | Marketplace Freelance Marocain',
  description: 'Trouve le talent qu\'il te faut. Des milliers de freelances qualifiés au Maroc, prêts à travailler sur ton projet.',
  generator: 'v0.app',
  keywords: ['freelance', 'Maroc', 'marketplace', 'travail', 'talent', 'design', 'développement', 'services'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#DC2626',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="bg-background" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} ${cairo.variable} ${libreBaskerville.variable} ${cormorantGaramond.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
