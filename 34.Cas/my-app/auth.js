// ============================================
// NEXTAUTH KONFIGURACIJA (Full - Server Only)
// ============================================
// Ovaj fajl sadrzi kompletnu konfiguraciju za NextAuth v5.
// Koristi se u API routes i server components.
// VAZNO: Ne koristiti u middleware.js! (koristi auth.config.js)

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/models/User';

/**
 * NextAuth konfiguracija sa providers-ima
 * Spaja edge-compatible config sa providers-ima koji koriste bcrypt
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  // ============================================
  // PROVIDERS - Nacini autentifikacije
  // ============================================
  providers: [
    CredentialsProvider({
      name: 'Credentials',

      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'vas@email.com',
        },
        lozinka: {
          label: 'Lozinka',
          type: 'password',
        },
      },

      /**
       * Authorize funkcija - proverava kredencijale
       * Ovo se izvrsava samo na serveru (ne u edge runtime)
       */
      async authorize(credentials) {
        try {
          await dbConnect();

          if (!credentials?.email || !credentials?.lozinka) {
            console.log('=> Auth: Nedostaju kredencijali');
            return null;
          }

          // Pronadi korisnika po email-u (ukljuci lozinku)
          const user = await User.findOne({ email: credentials.email })
            .select('+lozinka');

          if (!user) {
            console.log('=> Auth: Korisnik nije pronadjen:', credentials.email);
            return null;
          }

          if (!user.aktivan) {
            console.log('=> Auth: Nalog je deaktiviran:', credentials.email);
            return null;
          }

          // Uporedi lozinke koristeci bcrypt
          const isPasswordValid = await bcrypt.compare(
            credentials.lozinka,
            user.lozinka
          );

          if (!isPasswordValid) {
            console.log('=> Auth: Pogresna lozinka za:', credentials.email);
            return null;
          }

          // Azuriraj datum poslednje prijave
          await User.findByIdAndUpdate(user._id, {
            zadnjaPrijava: new Date(),
          });

          console.log('=> Auth: Uspesna prijava:', user.email);

          return {
            id: user._id.toString(),
            name: user.ime,
            email: user.email,
            role: user.uloga,
            image: user.slika,
          };
        } catch (error) {
          console.error('=> Auth greska:', error);
          return null;
        }
      },
    }),
  ],
});
