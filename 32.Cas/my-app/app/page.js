// ============================================
// POCETNA STRANICA
// ============================================
// Prikazuje razlicit sadrzaj zavisno od auth statusa

import { auth } from "@/auth"
import Link from "next/link"
import styles from "./page.module.css"

export default async function HomePage() {
  // Dobij sesiju na serveru
  const session = await auth()

  return (
    <div className={styles.container}>
      {/* Hero sekcija */}
      <section className={styles.hero}>
        <h1>NextAuth.js Demo</h1>
        <p className={styles.subtitle}>
          Naucite kako da implementirate autentifikaciju u Next.js aplikaciji
        </p>

        {session ? (
          // Korisnik je ulogovan
          <div className={styles.loggedIn}>
            <p className={styles.welcomeText}>
              Zdravo, <span>{session.user?.name}</span>!
            </p>
            <div className={styles.heroButtons}>
              <Link href="/dashboard" className={styles.primaryBtn}>
                Idi na Dashboard
              </Link>
              <Link href="/profile" className={styles.secondaryBtn}>
                Moj Profil
              </Link>
            </div>
          </div>
        ) : (
          // Korisnik nije ulogovan
          <div className={styles.heroButtons}>
            <Link href="/login" className={styles.primaryBtn}>
              Prijavi se
            </Link>
            <a href="#features" className={styles.secondaryBtn}>
              Saznaj vise
            </a>
          </div>
        )}
      </section>

      {/* Features sekcija */}
      <section id="features" className={styles.features}>
        <h2>Sta cemo nauciti danas?</h2>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔐</div>
            <h3>Session vs JWT</h3>
            <p>
              Razumevanje razlike izmedju session-based i JWT autentifikacije.
              Kada koristiti koji pristup.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🍪</div>
            <h3>Cookies</h3>
            <p>
              Kako Next.js rukuje sa cookies-ima. httpOnly, secure, sameSite
              atributi i zastita.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛡️</div>
            <h3>Middleware</h3>
            <p>
              Zastita ruta pomocu middleware-a. Automatski redirect
              neautorizovanih korisnika.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚙️</div>
            <h3>NextAuth Setup</h3>
            <p>
              Kompletna implementacija NextAuth biblioteke sa Credentials
              providerom.
            </p>
          </div>
        </div>
      </section>

      {/* Demo kredencijali */}
      <section className={styles.demoSection}>
        <h2>Probajte Demo</h2>
        <p>Koristite sledece kredencijale za testiranje:</p>

        <div className={styles.credentialsGrid}>
          <div className={styles.credentialCard}>
            <h4>Admin nalog</h4>
            <div className={styles.credentialInfo}>
              <span>Email:</span>
              <code>admin@test.com</code>
            </div>
            <div className={styles.credentialInfo}>
              <span>Lozinka:</span>
              <code>admin123</code>
            </div>
            <p className={styles.credentialNote}>
              Ima pristup svim stranicama ukljucujuci Admin panel
            </p>
          </div>

          <div className={styles.credentialCard}>
            <h4>Obican korisnik</h4>
            <div className={styles.credentialInfo}>
              <span>Email:</span>
              <code>user@test.com</code>
            </div>
            <div className={styles.credentialInfo}>
              <span>Lozinka:</span>
              <code>user123</code>
            </div>
            <p className={styles.credentialNote}>
              Ima pristup Dashboard-u i Profilu, ali NE Admin panelu
            </p>
          </div>
        </div>
      </section>

      {/* Struktura projekta */}
      <section className={styles.structureSection}>
        <h2>Struktura Projekta</h2>
        <pre className={styles.codeBlock}>
{`my-app/
├── auth.js                    # NextAuth konfiguracija
├── middleware.js              # Zastita ruta
├── .env.local                 # Environment varijable
├── app/
│   ├── layout.js              # Root layout sa AuthProvider
│   ├── page.js                # Pocetna stranica
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/ # NextAuth API route
│   │           └── route.js
│   ├── login/
│   │   └── page.js            # Login stranica
│   ├── dashboard/
│   │   └── page.js            # Zasticena stranica
│   ├── profile/
│   │   └── page.js            # Zasticena stranica
│   ├── admin/
│   │   └── page.js            # Samo za admine
│   └── components/
│       ├── AuthProvider.js    # Session Provider
│       └── Navbar.js          # Navigacija
└── lib/
    └── auth.js                # Auth helper (opciono)`}
        </pre>
      </section>
    </div>
  )
}
