// ============================================
// AUTH CONFIG - Edge-compatible konfiguracija
// ============================================
// Ovaj fajl sadrzi konfiguraciju koja je kompatibilna sa Edge runtime-om.
// NE KORISTI bcrypt ili druge Node.js module ovde!
// Koristi se u middleware.js

/**
 * NextAuth konfiguracija bez providers-a
 * Providers su definisani u auth.js
 */
export const authConfig = {
  // Prazan providers array - potreban za NextAuth inicijalizaciju
  // Pravi providers su u auth.js
  providers: [],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    /**
     * JWT Callback - dodaje custom polja u token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.image = user.image;
      }
      return token;
    },

    /**
     * Session Callback - dodaje custom polja iz tokena u sesiju
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.image;
      }
      return session;
    },

    /**
     * Authorized Callback - koristi se u middleware-u
     * Ovo je edge-compatible i ne koristi bcrypt
     */
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Definisi protected rute
      const protectedRoutes = ['/dashboard', '/admin', '/profil'];
      const authRoutes = ['/login', '/register'];
      const adminRoutes = ['/admin'];

      // Proveri da li je protected ruta
      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      // Proveri da li je auth ruta
      const isAuthRoute = authRoutes.some((route) =>
        pathname.startsWith(route)
      );

      // Proveri da li je admin ruta
      const isAdminRoute = adminRoutes.some((route) =>
        pathname.startsWith(route)
      );

      // Logika autorizacije
      if (isProtectedRoute) {
        if (!isLoggedIn) return false; // Redirect na login

        // Admin rute zahtevaju admin ulogu
        if (isAdminRoute && auth?.user?.role !== 'admin') {
          return false;
        }
      }

      // Prijavljeni korisnici ne mogu pristupiti login/register
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', request.nextUrl));
      }

      return true;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 sata
  },

  debug: process.env.NODE_ENV === 'development',
};
