# Cas 32: Authentication (NextAuth / Auth.js)

## Pregled Casa

**Trajanje:** 1h 30min

| Sekcija | Trajanje |
|---------|----------|
| Teorija | 30 min |
| Praksa | 45 min |
| Zadaci | 15 min |

## Teme

### Teorija
- Session vs JWT autentifikacija
- Cookies u Next.js (httpOnly, secure, sameSite)
- Middleware za zastitu ruta

### Praksa
- NextAuth setup i konfiguracija
- Credentials provider
- Protected routes

---

## Pokretanje Projekta

```bash
# 1. Udjite u direktorijum
cd my-app

# 2. Instalirajte zavisnosti
npm install

# 3. Pokrenite development server
npm run dev

# 4. Otvorite http://localhost:3000
```

## Demo Kredencijali

| Tip | Email | Lozinka | Pristup |
|-----|-------|---------|---------|
| Admin | admin@test.com | admin123 | Sve stranice |
| User | user@test.com | user123 | Dashboard, Profil |

---

## Struktura Projekta

```
my-app/
├── auth.js                    # NextAuth konfiguracija
├── middleware.js              # Zastita ruta
├── .env.local                 # Environment varijable
├── app/
│   ├── layout.js              # Root layout + AuthProvider
│   ├── page.js                # Pocetna stranica
│   ├── globals.css            # Globalni stilovi
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.js   # NextAuth API route
│   ├── login/
│   │   ├── page.js            # Login stranica
│   │   └── page.module.css
│   ├── dashboard/
│   │   ├── page.js            # Zasticena stranica
│   │   └── page.module.css
│   ├── profile/
│   │   ├── page.js            # Zasticena stranica
│   │   └── page.module.css
│   ├── admin/
│   │   ├── page.js            # Samo za admine
│   │   └── page.module.css
│   ├── unauthorized/
│   │   ├── page.js            # Pristup odbijen
│   │   └── page.module.css
│   └── components/
│       ├── AuthProvider.js    # Session Provider
│       ├── Navbar.js          # Navigacija
│       └── Navbar.module.css
└── lib/
    └── auth.js                # Auth helper (opciono)
```

---

## Zadaci za Studente

### Zadatak 1: Prosirenje Dashboard-a (Lako)

Dodajte na dashboard stranicu:
- [ ] Prikaz vremena kada je korisnik posetio stranicu
- [ ] Dugme "Osvezi podatke" koje refreshuje stranicu
- [ ] Karticu sa brojem poseta (hint: mozete koristiti localStorage)

**Fajl za izmenu:** `app/dashboard/page.js`

---

### Zadatak 2: Novi Korisnik (Lako)

Dodajte novog korisnika u sistem:
- [ ] Email: `profesor@test.com`
- [ ] Lozinka: `profesor123`
- [ ] Uloga: `moderator`
- [ ] Prikazi ulogu moderator drugom bojom u Navbar-u

**Fajl za izmenu:** `auth.js`

---

### Zadatak 3: Settings Stranica (Srednje)

Kreirajte novu zastecenu stranicu `/settings`:
- [ ] Kreirajte `app/settings/page.js`
- [ ] Dodajte formu za promenu imena (samo UI, bez funkcionalnosti)
- [ ] Dodajte toggle za dark/light mode (samo UI)
- [ ] Dodajte link u Navbar
- [ ] Zastitite rutu middleware-om

**Hint:** Pogledajte kako je napravljena `/profile` stranica.

---

### Zadatak 4: Role-Based UI (Srednje)

Implementirajte razlicit prikaz na dashboard-u zavisno od uloge:
- [ ] Za `admin`: Prikazi "Admin Controls" sekciju sa dugmicima
- [ ] Za `user`: Prikazi "Upgrade to Premium" baner
- [ ] Za `moderator`: Prikazi "Moderation Queue" sekciju

**Fajl za izmenu:** `app/dashboard/page.js`

---

### Zadatak 5: Logout Potvrda (Srednje)

Dodajte potvrdu pre logout-a:
- [ ] Kada korisnik klikne "Odjavi se", prikazi modal za potvrdu
- [ ] Modal ima dugmad "Da, odjavi me" i "Odustani"
- [ ] Tek nakon potvrde izvrsi signOut()

**Fajl za izmenu:** `app/components/Navbar.js`

**Hint:** Napravite novi state za modal i renderujte ga uslovno.

---

### Zadatak 6: Remember Me (Tesko)

Implementirajte "Zapamti me" funkcionalnost na login stranici:
- [ ] Dodajte checkbox "Zapamti me" na login formu
- [ ] Ako je cekiran, sesija traje 30 dana
- [ ] Ako nije cekiran, sesija traje 24 sata

**Fajlovi za izmenu:**
- `app/login/page.js`
- `auth.js`

**Hint:** Istrazite `maxAge` opciju u NextAuth session konfiguraciji i kako proslediti custom parametre iz authorize funkcije.

---

### Zadatak 7: Error Handling (Tesko)

Poboljsajte error handling na login stranici:
- [ ] Prikazi razlicite poruke za razlicite greske:
  - "Korisnik ne postoji" ako email nije pronadjen
  - "Pogresna lozinka" ako je lozinka netacna
  - "Nalog je blokiran" za blokirane korisnike
- [ ] Dodajte animaciju za prikaz greske

**Hint:** Morate modifikovati `authorize` funkciju da vraca razlicite error poruke.

---

### Bonus Zadatak: OAuth Provider

Istrazite i pokusajte da dodate GitHub OAuth provider:
1. Kreirajte GitHub OAuth App na https://github.com/settings/developers
2. Dodajte `GITHUB_ID` i `GITHUB_SECRET` u `.env.local`
3. Dodajte GitHubProvider u auth.js
4. Dodajte dugme "Prijavi se sa GitHub" na login stranicu

**Dokumentacija:** https://authjs.dev/getting-started/providers/github

---

## Korisni Linkovi

- [NextAuth.js Dokumentacija](https://next-auth.js.org/)
- [Auth.js (nova verzija)](https://authjs.dev/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [JWT.io Debugger](https://jwt.io/)

---

## Napomene

- **NIKADA** ne hardkodujte lozinke u produkciji
- Uvek koristite HTTPS u produkciji
- Generiste NEXTAUTH_SECRET sa `openssl rand -base64 32`
- U pravoj aplikaciji koristite bazu podataka i bcrypt za hashiranje lozinki
