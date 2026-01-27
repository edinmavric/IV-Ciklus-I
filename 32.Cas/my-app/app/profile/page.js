// ============================================
// PROFIL STRANICA (ZASTICENA)
// ============================================
// Prikazuje detaljne informacije o korisniku

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import styles from "./page.module.css"

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        {/* Avatar */}
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {session.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h1>{session.user?.name}</h1>
          <span className={`${styles.roleBadge} ${
            session.user?.role === "admin" ? styles.adminBadge : styles.userBadge
          }`}>
            {session.user?.role === "admin" ? "Administrator" : "Korisnik"}
          </span>
        </div>

        {/* Informacije */}
        <div className={styles.infoSection}>
          <h2>Informacije o nalogu</h2>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Email adresa</span>
              <span className={styles.infoValue}>{session.user?.email}</span>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Korisnicki ID</span>
              <span className={styles.infoValue}>{session.user?.id}</span>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Uloga u sistemu</span>
              <span className={styles.infoValue}>{session.user?.role}</span>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Status naloga</span>
              <span className={`${styles.infoValue} ${styles.statusActive}`}>
                Aktivan
              </span>
            </div>
          </div>
        </div>

        {/* Akcije */}
        <div className={styles.actionsSection}>
          <h2>Brze akcije</h2>
          <div className={styles.actionButtons}>
            <Link href="/dashboard" className={styles.actionBtn}>
              📊 Dashboard
            </Link>
            {session.user?.role === "admin" && (
              <Link href="/admin" className={`${styles.actionBtn} ${styles.adminBtn}`}>
                ⚙️ Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
