// ============================================
// MIDDLEWARE - Zastita ruta i kontrola pristupa
// ============================================
// Koristi NextAuth sa edge-compatible konfiguracijom.
// VAZNO: Ne importuje bcrypt ili druge Node.js module!

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Kreiraj auth instancu sa edge-compatible konfiguracijom
const { auth } = NextAuth(authConfig);

/**
 * Middleware funkcija
 * Koristi authorized callback iz auth.config.js
 */
export default auth;

/**
 * Matcher konfiguracija
 * Definise na kojim rutama se middleware izvrsava.
 * VAZNO: Izbegavamo staticke fajlove i API rute.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - robots.txt, sitemap.xml (SEO files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml).*)',
  ],
};
