// ============================================
// NEXTAUTH API ROUTE HANDLER
// ============================================
// Ova ruta obradjuje sve NextAuth zahteve:
// - GET /api/auth/signin - Stranica za prijavu
// - GET /api/auth/signout - Stranica za odjavu
// - GET /api/auth/session - Dobijanje sesije
// - POST /api/auth/signin - Prijava
// - POST /api/auth/signout - Odjava
// - POST /api/auth/callback/credentials - Callback za credentials provider

import { handlers } from '@/auth';

// Exportujemo GET i POST handlere iz auth konfiguracije
export const { GET, POST } = handlers;
