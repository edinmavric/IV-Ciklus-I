// ============================================
// ROOT LAYOUT - Font Optimization Demo
// ============================================

import { Inter, Roboto_Mono } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'

// OPTIMIZATION
// Next.js automatski:
// 1. Self-host fontove (preuzme ih na build time)
// 2. Eliminiše dodatne network zahteve
// 3. Automatski font subsetting
// 4. Zero layout shift

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Sprečava FOUT (Flash of Unstyled Text)
  variable: '--font-inter'
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-roboto-mono'
})

// ROOT METADATA
// Template omogućava child stranicama da dodaju svoj title
export const metadata = {
  metadataBase: new URL('https://example.com'),

  title: {
    default: 'Next.js SEO & Performance Demo',
    template: '%s | Next.js Demo' // %s će biti zamenjen sa title iz child stranica
  },

  description: 'Demonstracija SEO i Performance optimizacije u Next.js 15 - Metadata API, Image Optimization, Font Optimization',

  keywords: ['next.js', 'seo', 'performance', 'optimization', 'web vitals', 'react'],

  authors: [{ name: 'Edin Mavric', url: 'https://example.com' }],

  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    url: 'https://example.com',
    siteName: 'Next.js Demo',
    title: 'Next.js SEO & Performance Demo',
    description: 'Naučite kako optimizovati Next.js aplikacije',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Next.js SEO Demo'
      }
    ]
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Next.js SEO & Performance Demo',
    description: 'Naučite kako optimizovati Next.js aplikacije',
    creator: '@yourhandle',
    images: ['/og-image.jpg']
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },

  // Verification (Google, Bing, etc.)
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="sr" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>
        {/* Navigacija */}
        <Navbar />

        {/* Main Content */}
        {children}

        {/* Footer */}
        <footer style={{
          marginTop: '4rem',
          padding: '2rem',
          background: '#f5f5f5',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#666' }}>
            © 2025 Next.js SEO Demo. Čas 33 - Performance, SEO & Optimization
          </p>
        </footer>
      </body>
    </html>
  )
}
