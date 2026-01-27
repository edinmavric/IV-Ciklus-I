// ============================================
// DASHBOARD STRANICA (ZASTICENA)
// ============================================
// Ova stranica je dostupna samo ulogovanim korisnicima
// Middleware automatski redirektuje na /login ako korisnik nije ulogovan

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import styles from "./page.module.css"

// Ovo je SERVER KOMPONENTA - koristi auth() umesto useSession()
export default async function DashboardPage() {
  // Dobij sesiju na serveru
  const session = await auth()

  // Dodatna provera (middleware vec stiti, ali za svaki slucaj)
  if (!session) {
    redirect("/login")
  }

  // Formatiranje vremena
  const loginTime = new Date().toLocaleString("sr-RS", {
    dateStyle: "full",
    timeStyle: "short"
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p className={styles.welcome}>
          Dobrodosli, <span>{session.user?.name}</span>!
        </p>
      </div>

      <div className={styles.grid}>
        {/* Kartica sa profilom */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>👤</div>
          <h2>Vas Profil</h2>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Ime:</span>
              <span className={styles.value}>{session.user?.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{session.user?.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>ID:</span>
              <span className={styles.value}>{session.user?.id}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Uloga:</span>
              <span className={`${styles.value} ${styles.role} ${
                session.user?.role === "admin" ? styles.adminRole : styles.userRole
              }`}>
                {session.user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Kartica sa statusom sesije */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>🔐</div>
          <h2>Status Sesije</h2>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Status:</span>
              <span className={`${styles.value} ${styles.statusActive}`}>
                Aktivan
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Pristup:</span>
              <span className={styles.value}>{loginTime}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Tip auth:</span>
              <span className={styles.value}>JWT Token</span>
            </div>
          </div>
        </div>

        {/* Kartica sa pristupom */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>🔑</div>
          <h2>Vas Pristup</h2>
          <div className={styles.accessList}>
            <div className={styles.accessItem}>
              <span className={styles.accessIcon}>✅</span>
              <span>Dashboard</span>
            </div>
            <div className={styles.accessItem}>
              <span className={styles.accessIcon}>✅</span>
              <span>Profil</span>
            </div>
            <div className={styles.accessItem}>
              <span className={styles.accessIcon}>
                {session.user?.role === "admin" ? "✅" : "❌"}
              </span>
              <span>Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Kartica sa session objektom (za debugging) */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>💾</div>
          <h2>Session Objekat</h2>
          <p className={styles.codeDescription}>
            Ovo je session objekat koji dobijate sa <code>auth()</code>:
          </p>
          <pre className={styles.codeBlock}>
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
