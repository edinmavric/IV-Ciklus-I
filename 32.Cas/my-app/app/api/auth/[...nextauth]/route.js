// ============================================
// NEXTAUTH API ROUTE
// ============================================
// Ova ruta hvata sve auth-related zahteve:
// - /api/auth/signin
// - /api/auth/signout
// - /api/auth/callback
// - /api/auth/session
// itd.

import { handlers } from "@/auth"

export const { GET, POST } = handlers
