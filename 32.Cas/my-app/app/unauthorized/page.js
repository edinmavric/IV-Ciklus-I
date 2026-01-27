// ============================================
// UNAUTHORIZED STRANICA
// ============================================
// Prikazuje se kada korisnik nema pristup resursu

import Link from "next/link"
import styles from "./page.module.css"

export default function UnauthorizedPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>🚫</div>
        <h1>Pristup Odbijen</h1>
        <p className={styles.message}>
          Nemate dozvolu za pristup ovoj stranici.
        </p>
        <p className={styles.submessage}>
          Ova stranica zahteva veci nivo pristupa nego sto trenutno imate.
        </p>
        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.primaryBtn}>
            Povratak na Dashboard
          </Link>
          <Link href="/" className={styles.secondaryBtn}>
            Pocetna stranica
          </Link>
        </div>
      </div>
    </div>
  )
}
