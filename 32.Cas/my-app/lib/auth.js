import CredentialsProvider from "next-auth/providers/credentials"

// ============================================
// NEXTAUTH KONFIGURACIJA
// ============================================
// Ova datoteka sadrzi svu konfiguraciju za autentifikaciju
// U produkciji bi ovde bila konekcija na bazu podataka

export const authOptions = {
  // ----------------------------------------
  // PROVIDERS - Nacini logovanja
  // ----------------------------------------
  providers: [
    CredentialsProvider({
      // Ime providera (prikazuje se na login formi)
      name: "Credentials",

      // Polja za login formu
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "vas@email.com"
        },
        password: {
          label: "Lozinka",
          type: "password",
          placeholder: "Vasa lozinka"
        }
      },

      // ----------------------------------------
      // AUTHORIZE - Funkcija za proveru kredencijala
      // ----------------------------------------
      // Ova funkcija se poziva kada korisnik pokusa da se uloguje
      // Vraca user objekat ako je login uspesan, ili null ako nije
      async authorize(credentials) {
        // DEMO KORISNICI
        // U pravoj aplikaciji, ovde bi bila provera u bazi podataka!
        // NIKADA ne hardkodujte lozinke u produkciji!

        const users = [
          {
            id: "1",
            name: "Admin User",
            email: "admin@test.com",
            password: "admin123", // U produkciji: hashirana lozinka!
            role: "admin"
          },
          {
            id: "2",
            name: "Regular User",
            email: "user@test.com",
            password: "user123",
            role: "user"
          }
        ]

        // Pronadji korisnika po emailu
        const user = users.find(u => u.email === credentials?.email)

        // Proveri lozinku
        // U produkciji: bcrypt.compare(credentials.password, user.hashedPassword)
        if (user && user.password === credentials?.password) {
          // Vrati user objekat BEZ lozinke
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }

        // Login nije uspesan
        return null
      }
    })
  ],

  // ----------------------------------------
  // CALLBACKS - Funkcije za customizaciju
  // ----------------------------------------
  callbacks: {
    // JWT Callback - poziva se kada se kreira/azurira token
    async jwt({ token, user }) {
      // Kada se korisnik uloguje, dodaj custom polja u token
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },

    // Session Callback - poziva se kada se cita sesija
    async session({ session, token }) {
      // Dodaj custom polja iz tokena u sesiju
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },

  // ----------------------------------------
  // PAGES - Custom stranice
  // ----------------------------------------
  pages: {
    signIn: "/login", // Custom login stranica umesto default-ne
    // signOut: "/logout",
    // error: "/auth/error",
  },

  // ----------------------------------------
  // SESSION - Konfiguracija sesije
  // ----------------------------------------
  session: {
    strategy: "jwt", // Koristi JWT umesto database sessions
    maxAge: 24 * 60 * 60, // Sesija traje 24 sata
  },

  // ----------------------------------------
  // DEBUG - Ukljuci za development
  // ----------------------------------------
  debug: process.env.NODE_ENV === "development",
}
