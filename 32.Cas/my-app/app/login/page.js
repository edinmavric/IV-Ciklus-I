// ============================================
// LOGIN STRANICA
// ============================================
// Custom login forma za autentifikaciju

"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import styles from "./page.module.css"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Dobij callback URL ako postoji (gde da redirektujemo posle login-a)
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  // PRIMER: POST /api.example.com/foo?callbackURL=http://my.server.com/bar

  // State za formu
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Handler za submit forme
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Pozovi NextAuth signIn funkciju
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Ne radi automatski redirect
      })

      if (result?.error) {
        // Login nije uspesan
        setError("Pogresni kredencijali. Pokusajte ponovo.")
      } else {
        // Login uspesan - redirect na callback URL
        router.push(callbackUrl)
        router.refresh() // Osvezi stranicu da se azurira sesija
      }
    } catch (err) {
      setError("Doslo je do greske. Pokusajte ponovo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Prijava</h1>
        <p className={styles.subtitle}>Unesite vase kredencijale</p>

        {/* Prikaz greske ako postoji */}
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Lozinka</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Vasa lozinka"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "Prijava u toku..." : "Prijavi se"}
          </button>
        </form>

        {/* Demo kredencijali */}
        <div className={styles.demoCredentials}>
          <h3>Demo Kredencijali:</h3>
          <div className={styles.credential}>
            <strong>Admin:</strong>
            <code>admin@test.com / admin123</code>
          </div>
          <div className={styles.credential}>
            <strong>User:</strong>
            <code>user@test.com / user123</code>
          </div>
        </div>
      </div>
    </div>
  )
}
