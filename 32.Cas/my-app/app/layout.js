// ============================================
// ROOT LAYOUT
// ============================================
// Glavni layout koji omotava celu aplikaciju
// Ovde dodajemo AuthProvider za pristup sesiji

import { Geist, Geist_Mono } from "next/font/google"
import AuthProvider from "./components/AuthProvider"
import Navbar from "./components/Navbar"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "NextAuth Demo - Cas 32",
  description: "Demonstracija autentifikacije u Next.js sa NextAuth",
}

export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* AuthProvider omogucava pristup sesiji u celoj aplikaciji */}
        <AuthProvider>
          {/* Navbar komponenta sa auth statusom */}
          <Navbar />
          {/* Glavni sadrzaj */}
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
