import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Inter, Cairo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import { PageTransition } from '@/components/page-transition'
import { ProgressBar } from '@/components/progress-bar'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wslni.ma | Marketplace Freelance Marocain',
  description: 'Trouve le talent qu\'il te faut. Des milliers de freelances qualifiés au Maroc, prêts à travailler sur ton projet.',
  generator: 'v0.app',
  keywords: ['freelance', 'Maroc', 'marketplace', 'travail', 'talent', 'design', 'développement', 'services'],
  openGraph: {
    title: 'Wslni.ma | Marketplace Freelance Marocain',
    description: 'Trouve le talent qu\'il te faut. Des milliers de freelances qualifiés au Maroc, prêts à travailler sur ton projet.',
    url: 'https://wslni.ma',
    siteName: 'Wslni.ma',
    locale: 'fr_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wslni.ma | Marketplace Freelance Marocain',
    description: 'Trouve le talent qu\'il te faut. Des milliers de freelances qualifiés au Maroc, prêts à travailler sur ton projet.',
  },
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
      <body className={`${jakarta.variable} ${inter.variable} ${cairo.variable} font-sans antialiased`}>
        <ProgressBar />
        <Providers>
          <PageTransition>
            {children}
          </PageTransition>
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
