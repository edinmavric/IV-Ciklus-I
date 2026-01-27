// ============================================
// NAVIGACIJA KOMPONENTA
// ============================================
// Prikazuje razlicite linkove zavisno od auth statusa

"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import styles from "./Navbar.module.css"

export default function Navbar() {
  // useSession hook daje pristup trenutnoj sesiji
  // status moze biti: "loading", "authenticated", "unauthenticated"
  const { data: session, status } = useSession()

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <Link href="/">NextAuth Demo</Link>
      </div>

      <div className={styles.links}>
        <Link href="/">Pocetna</Link>

        {/* Prikazi loading dok se proverava sesija */}
        {status === "loading" && (
          <span className={styles.loading}>Ucitavanje...</span>
        )}

        {/* Prikazi ako je korisnik ulogovan */}
        {status === "authenticated" && (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Profil</Link>
            {/* Admin link samo za admine */}
            {session?.user?.role === "admin" && (
              <Link href="/admin" className={styles.adminLink}>
                Admin
              </Link>
            )}
            <div className={styles.userInfo}>
              <span className={styles.userName}>{session.user?.name}</span>
              <span className={styles.userRole}>({session.user?.role})</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={styles.logoutBtn}
              >
                Odjavi se
              </button>
            </div>
          </>
        )}

        {/* Prikazi ako korisnik nije ulogovan */}
        {status === "unauthenticated" && (
          <Link href="/login" className={styles.loginLink}>
            Prijavi se
          </Link>
        )}
      </div>
    </nav>
  )
}
