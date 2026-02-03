// ============================================
// ROOT LAYOUT - Glavni layout aplikacije
// ============================================
// Sadrzi globalne providere, metadata i strukturu stranice.
// Demonstrira SEO optimizaciju sa Metadata API.

import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './components/auth/AuthProvider';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// ============================================
// FONT OPTIMIZACIJA
// ============================================
// Next.js automatski hostuje fontove lokalno (nema external request-a)
// display: 'swap' sprecava FOUT (Flash of Unstyled Text)

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

// ============================================
// METADATA - SEO Konfiguracija
// ============================================
// Ovo je globalna metadata koja se primenjuje na sve stranice.
// Pojedinacne stranice mogu override-ovati ove vrednosti.

export const metadata = {
  // Bazni URL za apsolutne linkove
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),

  // Naslov sa template-om
  // %s ce biti zamenjen sa naslovom child stranice
  title: {
    default: 'BlogMaster - Full-Stack Next.js Blog',
    template: '%s | BlogMaster',
  },

  // Opis sajta
  description:
    'BlogMaster je moderna full-stack blog aplikacija napravljena sa Next.js, MongoDB i NextAuth. Demonstrira Server Actions, SSR/SSG, i SEO optimizaciju.',

  // Kljucne reci
  keywords: [
    'Next.js',
    'React',
    'MongoDB',
    'NextAuth',
    'Blog',
    'Full-Stack',
    'Server Actions',
    'SSR',
    'SSG',
    'SEO',
  ],

  // Autori
  authors: [{ name: 'BlogMaster Team' }],

  // Open Graph (za deljenje na socijalnim mrezama)
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    url: '/',
    siteName: 'BlogMaster',
    title: 'BlogMaster - Full-Stack Next.js Blog',
    description: 'Moderna full-stack blog aplikacija sa Next.js i MongoDB',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BlogMaster - Full-Stack Next.js Blog',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'BlogMaster - Full-Stack Next.js Blog',
    description: 'Moderna full-stack blog aplikacija sa Next.js i MongoDB',
    images: ['/images/og-image.jpg'],
  },

  // Robots direktive
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// ============================================
// ROOT LAYOUT KOMPONENTA
// ============================================
export default function RootLayout({ children }) {
  return (
    <html lang="sr" className={inter.variable}>
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 antialiased`}>
        {/* AuthProvider wrappuje celu aplikaciju */}
        <AuthProvider>
          {/* Navigacija */}
          <Navbar />

          {/* Glavni sadrzaj */}
          <main className="grow">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
