// ============================================
// NAVBAR KOMPONENTA
// ============================================

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Navbar.module.css'

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
    { href: '/gallery', label: 'Gallery' }
  ]

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          Next.js Demo
        </Link>

        {/* Links */}
        <ul className={styles.links}>
          {links.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? styles.active : ''}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
