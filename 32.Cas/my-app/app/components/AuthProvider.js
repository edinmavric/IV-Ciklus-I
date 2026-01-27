// ============================================
// SESSION PROVIDER KOMPONENTA
// ============================================
// Ova komponenta omogucava pristup sesiji u celoj aplikaciji
// Mora biti "use client" jer koristi React Context

"use client"

import { SessionProvider } from "next-auth/react"

export default function AuthProvider({ children }) {
  // SessionProvider prosljedjuje session context svim child komponentama
  // Omogucava koriscenje useSession() hook-a bilo gde u aplikaciji
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
