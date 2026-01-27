// ============================================
// AUTH.JS - Glavna konfiguracija za NextAuth v5
// ============================================
// Ovaj fajl mora biti u KORENU projekta za NextAuth v5
// NextAuth v5 (Auth.js) koristi drugaciji pristup od v4

// ----------------------------------------
// IMPORTI
// ----------------------------------------
// NextAuth - glavna funkcija koja kreira auth sistem
import NextAuth from "next-auth"
// CredentialsProvider - omogucava login sa email/password
// (postoje i drugi provideri: Google, GitHub, Facebook, itd.)
import CredentialsProvider from "next-auth/providers/credentials"

// ----------------------------------------
// DEMO KORISNICI
// ----------------------------------------
// U produkciji bi ovi podaci bili u bazi podataka (PostgreSQL, MongoDB, itd.)
// NIKADA ne hardkodujte lozinke u produkciji!
// Lozinke bi trebale biti HASHIRANE pomocu bcrypt ili slicnog algoritma
const users = [
  {
    id: "1",              // Jedinstveni identifikator korisnika
    name: "Admin User",   // Ime koje ce se prikazivati
    email: "admin@test.com", // Email za login
    password: "admin123", // U produkciji: hashirana lozinka!
    role: "admin"         // Custom polje - uloga korisnika
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@test.com",
    password: "user123",
    role: "user"
  }
]

// ============================================
// NEXTAUTH KONFIGURACIJA I EXPORTI
// ============================================
// NextAuth() vraca objekat sa sledecim funkcijama:
//
// handlers - { GET, POST } handleri za API rute
//   - GET  - obradjuje OAuth callback-ove, CSRF token, session check
//   - POST - obradjuje sign in, sign out, callback-ove
//   - Koriste se u: app/api/auth/[...nextauth]/route.js
//
// signIn - Funkcija za programatsko logovanje korisnika
//   - Koristi se u Server Actions ili API rutama
//   - Primer: await signIn("credentials", { email, password })
//
// signOut - Funkcija za programatsko odjavljivanje
//   - Koristi se u Server Actions
//   - Primer: await signOut()
//
// auth - Funkcija za dobijanje trenutne sesije
//   - Koristi se u Server Components, middleware, API rutama
//   - Primer: const session = await auth()
//   - Vraca null ako korisnik nije ulogovan
//
export const { handlers, signIn, signOut, auth } = NextAuth({
  // ----------------------------------------
  // PROVIDERS - Nacini autentifikacije
  // ----------------------------------------
  // Niz svih providera koje aplikacija podrzava
  providers: [
    // Credentials Provider - login sa email i lozinkom
    CredentialsProvider({
      // Ime providera (prikazuje se na default login formi)
      name: "Credentials",

      // Definicija polja za login formu
      // Ovo se koristi za automatsko generisanje forme
      credentials: {
        email: { label: "Email", type: "email" },       // Input polje za email
        password: { label: "Password", type: "password" } // Input polje za lozinku
      },

      // ----------------------------------------
      // AUTHORIZE FUNKCIJA
      // ----------------------------------------
      // Poziva se kada korisnik pokusa da se uloguje
      // Prima credentials objekat sa podacima iz forme
      // Vraca: user objekat ako je login uspesan, null ako nije
      async authorize(credentials) {
        // Pronadji korisnika po email adresi
        // U produkciji: upit u bazu podataka
        const user = users.find(u => u.email === credentials?.email)

        // Provera lozinke
        // U produkciji bi ovo bilo: await bcrypt.compare(credentials.password, user.hashedPassword)
        if (user && user.password === credentials?.password) {
          // Login USPESAN - vrati user objekat BEZ lozinke!
          // Ovi podaci ce biti dostupni u JWT tokenu i sesiji
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role  // Custom polje koje dodajemo
          }
        }
        // Login NEUSPESAN - vrati null
        // NextAuth ce automatski prikazati gresku
        return null
      }
    })
  ],

  // ----------------------------------------
  // CALLBACKS - Funkcije za customizaciju
  // ----------------------------------------
  // Callbacks se pozivaju u razlicitim fazama auth procesa
  callbacks: {
    // JWT CALLBACK
    // Poziva se svaki put kada se kreira ili azurira JWT token
    // Koristi se za dodavanje custom podataka u token
    async jwt({ token, user }) {
      // 'user' je dostupan SAMO pri prvom logovanju
      // Nakon toga je undefined, a podaci se citaju iz tokena
      if (user) {
        token.role = user.role  // Dodaj role u token
        token.id = user.id      // Dodaj id u token
      }
      // OBAVEZNO vrati token (sa ili bez izmena)
      return token
    },

    // SESSION CALLBACK
    // Poziva se svaki put kada se cita sesija (auth() ili useSession())
    // Koristi se za dodavanje podataka iz tokena u sesiju
    async session({ session, token }) {
      // Prenesi custom polja iz JWT tokena u session objekat
      // Ovo omogucava pristup ovim podacima na klijentu
      if (token) {
        session.user.role = token.role  // Dodaj role u sesiju
        session.user.id = token.id      // Dodaj id u sesiju
      }
      // OBAVEZNO vrati session objekat
      return session
    }
  },

  // ----------------------------------------
  // PAGES - Custom stranice za auth
  // ----------------------------------------
  // Zameni default NextAuth stranice sa svojim
  pages: {
    signIn: "/login",  // Custom login stranica umesto /api/auth/signin
    // signOut: "/logout",      // Custom logout stranica
    // error: "/auth/error",    // Custom error stranica
    // newUser: "/welcome",     // Stranica za nove korisnike
  },

  // ----------------------------------------
  // SESSION - Konfiguracija sesije
  // ----------------------------------------
  session: {
    strategy: "jwt",      // Koristi JWT tokens (alternativa: "database")
    maxAge: 24 * 60 * 60, // Trajanje sesije: 24 sata (u sekundama)
    // updateAge: 24 * 60 * 60, // Koliko cesto se token osvezava
  },

  // ----------------------------------------
  // DEBUG MODE
  // ----------------------------------------
  // Ukljucuje detaljne logove u konzoli
  // Korisno za development, ISKLJUCI u produkciji!
  debug: process.env.NODE_ENV === "development",
})
