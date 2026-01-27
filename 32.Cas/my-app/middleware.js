// ============================================
// MIDDLEWARE - Zastita ruta
// ============================================
// Middleware se izvrsava IZMEDJU requesta i odgovora
// VAZNO: Ovaj fajl mora biti u KORENU projekta!

import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Zastecene rute
  const protectedRoutes = ["/dashboard", "/profile", "/admin"]
  const isProtectedRoute = protectedRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  )

  // Ako korisnik nije ulogovan i pokusava da pristupi zasticenim rutama
  if (isProtectedRoute && !isLoggedIn) {
    // Redirect na login sa povratnim URL-om
    const loginUrl = new URL("/login", nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Ako je ulogovan korisnik na login stranici, redirect na dashboard
  if (isLoggedIn && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin))
  }

  // Admin ruta - samo za admine
  if (nextUrl.pathname.startsWith("/admin")) {
    const userRole = req.auth?.user?.role
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin))
    }
  }

  return NextResponse.next()
})

// ============================================
// MATCHER - Koje rute middleware obradjuje
// ============================================
// Matcher definise na koje URL-ove se middleware primenjuje
export const config = {
  matcher: [
    // Sve rute osim statickih fajlova i API ruta koje nisu auth
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
