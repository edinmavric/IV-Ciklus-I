// ============================================
// ADMIN STRANICA (SAMO ZA ADMINE)
// ============================================
// Ova stranica je dostupna samo korisnicima sa role: "admin"
// Middleware proverava ulogu i redirektuje na /unauthorized

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import styles from "./page.module.css"

export default async function AdminPage() {
  const session = await auth()

  // Provera autentifikacije
  if (!session) {
    redirect("/login")
  }

  // Provera autorizacije (role)
  if (session.user?.role !== "admin") {
    redirect("/unauthorized")
  }

  // Simulirani podaci za admin panel
  const stats = {
    totalUsers: 156,
    activeUsers: 89,
    newUsersToday: 12,
    totalSessions: 423
  }

  const recentUsers = [
    { id: 1, name: "Marko Markovic", email: "marko@test.com", role: "user", status: "active" },
    { id: 2, name: "Ana Anic", email: "ana@test.com", role: "user", status: "active" },
    { id: 3, name: "Petar Petrovic", email: "petar@test.com", role: "admin", status: "active" },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Admin Panel</h1>
        <p className={styles.subtitle}>
          Dobrodosli, {session.user?.name}. Imate admin pristup.
        </p>
      </div>

      {/* Statistike */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.totalUsers}</span>
            <span className={styles.statLabel}>Ukupno korisnika</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.activeUsers}</span>
            <span className={styles.statLabel}>Aktivnih korisnika</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🆕</div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.newUsersToday}</span>
            <span className={styles.statLabel}>Novih danas</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔐</div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.totalSessions}</span>
            <span className={styles.statLabel}>Ukupno sesija</span>
          </div>
        </div>
      </div>

      {/* Tabela korisnika */}
      <div className={styles.tableSection}>
        <h2>Nedavni korisnici</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ime</th>
              <th>Email</th>
              <th>Uloga</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`${styles.roleBadge} ${
                    user.role === "admin" ? styles.adminBadge : styles.userBadge
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={styles.statusBadge}>{user.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info o autorizaciji */}
      <div className={styles.infoBox}>
        <h3>O ovoj stranici</h3>
        <p>
          Ova stranica je zasticena middleware-om koji proverava da li korisnik ima
          <code>role: "admin"</code>. Korisnici bez admin privilegija su automatski
          preusmereni na <code>/unauthorized</code> stranicu.
        </p>
      </div>
    </div>
  )
}
