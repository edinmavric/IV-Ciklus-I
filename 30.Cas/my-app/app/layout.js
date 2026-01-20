/**
 * Root Layout - Glavni layout za cijelu aplikaciju
 *
 * Ovaj fajl je OBAVEZAN u Next.js App Router-u.
 * Definiše HTML strukturu i zajedničke elemente za sve stranice.
 */

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Učitavanje Google fontova sa optimizacijom
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata za SEO - ovo Next.js automatski ubacuje u <head>
export const metadata = {
  title: "30. Čas - Forms, Server Actions & Mutations",
  description: "Naučite kako raditi sa formama u Next.js koristeći Server Actions, useFormStatus i useActionState",
};

/**
 * RootLayout komponenta
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child komponente (stranice)
 *
 * Ova komponenta obavija SVE stranice u aplikaciji.
 * Ne re-renderuje se pri navigaciji - samo children se mijenjaju.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
