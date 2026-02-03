// ============================================
// AUTH PROVIDER - SessionProvider wrapper
// ============================================
// Ova komponenta wrappuje aplikaciju sa NextAuth SessionProvider-om.
// Mora biti client komponenta jer koristi React Context.

'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * AuthProvider komponenta
 * Pruza pristup sesiji u celoj aplikaciji
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child komponente
 * @param {Object} props.session - Opcionalna inicijalna sesija
 *
 * @example
 * // U layout.js:
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 */
export default function AuthProvider({ children, session }) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
