# Čas 35: Deploy, Environment Variables & Production Best Practices

## Pregled Časa

| Segment | Trajanje | Opis |
|---------|----------|------|
| Teorija | 30 min | .env, build vs runtime, Vercel, folder organizacija, skaliranje |
| Praksa | 45 min | Production build, Vercel deploy, error handling |
| Finalni zadatak | 15 min | Mini SaaS / Blog platforma (auth, CRUD, SSR+SSG, deploy) |

---

## Teme

### Teorija
- Environment varijable (.env fajlovi)
- Build time vs Runtime razlike
- Vercel platforma i deployment workflow
- Folder organizacija za produkciju
- Skaliranje Next.js aplikacija

### Praksa
- Production build (`next build`)
- Deploy na Vercel
- Error handling u produkciji
- Monitoring i logging

---

## 1. Environment Varijable (.env)

### Tipovi .env fajlova

Next.js podržava više `.env` fajlova, koji se učitavaju po prioritetu:

```
.env                  # Uvijek se učitava
.env.local            # Uvijek se učitava, ignorisan od git-a
.env.development      # Samo u development modu
.env.development.local
.env.production       # Samo u production modu
.env.production.local
.env.test             # Samo u test modu
```

**Prioritet učitavanja (od najvišeg ka najnižem):**
1. `process.env` (sistemske varijable)
2. `.env.$(NODE_ENV).local`
3. `.env.local` (ne učitava se u test modu)
4. `.env.$(NODE_ENV)`
5. `.env`

### Server vs Client varijable

```bash
# .env.local

# ✅ SERVER ONLY - dostupna samo na serveru
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/mydb
API_SECRET_KEY=sk_live_abc123
NEXTAUTH_SECRET=super-secret-key

# ✅ CLIENT + SERVER - dostupna i u browseru
NEXT_PUBLIC_API_URL=https://api.mojsajt.com
NEXT_PUBLIC_GOOGLE_ANALYTICS=G-XXXXXXXXXX
NEXT_PUBLIC_APP_NAME=MojSaaS
```

> **VAŽNO:** Samo varijable sa prefiksom `NEXT_PUBLIC_` su dostupne u browser-u. Nikada ne stavljajte tajne ključeve sa ovim prefiksom!

### Pristup varijablama u kodu

#### U Server Components / API Routes
```js
// app/api/users/route.js
export async function GET() {
  // ✅ Server varijable su dostupne
  const dbUrl = process.env.DATABASE_URL
  const secret = process.env.API_SECRET_KEY

  // Konekcija na bazu...
  return Response.json({ status: 'ok' })
}
```

#### U Client Components
```js
'use client'

export default function Footer() {
  // ✅ NEXT_PUBLIC_ varijable su dostupne
  const appName = process.env.NEXT_PUBLIC_APP_NAME

  // ❌ Ovo će biti undefined u browseru!
  const secret = process.env.API_SECRET_KEY // undefined

  return <footer>{appName} © 2025</footer>
}
```

### .env.example fajl

Uvijek kreirajte `.env.example` sa svim potrebnim varijablama (bez stvarnih vrijednosti):

```bash
# .env.example - Kopirajte u .env.local i popunite vrijednosti

# Baza podataka
DATABASE_URL=
MONGODB_DB_NAME=

# Autentifikacija
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Eksterni servisi
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_GOOGLE_ANALYTICS=
```

### Validacija env varijabli

```js
// lib/env.js - Provjera da li su sve varijable postavljene
function getRequiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`❌ Missing environment variable: ${name}`)
  }
  return value
}

export const env = {
  DATABASE_URL: getRequiredEnv('DATABASE_URL'),
  NEXTAUTH_SECRET: getRequiredEnv('NEXTAUTH_SECRET'),
  // Client varijable (opciono, sa default vrijednostima)
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'MyApp',
}
```

---

## 2. Build Time vs Runtime

### Šta je Build Time?

Build time je kada pokrećete `next build`. Tokom build-a:
- Svi **static** (SSG) stranice se generišu
- `generateStaticParams()` se poziva
- Static metadata se generiše
- Environment varijable se **inline-uju** u kod

```
next build
   ├── Kompajlira sve stranice
   ├── Generiše statičke HTML fajlove (SSG)
   ├── Bundluje JavaScript
   ├── Optimizuje slike
   └── Kreira .next/ folder
```

### Šta je Runtime?

Runtime je kada aplikacija radi na serveru (nakon deploya):
- **SSR** stranice se renderuju na svaki request
- API rute se izvršavaju
- Server Actions se izvršavaju
- Middleware se izvršava

```
Runtime (svaki request)
   ├── Middleware provjere
   ├── SSR rendering (dinamičke stranice)
   ├── API route handler
   ├── Server Actions
   └── Čita runtime env varijable
```

### Praktični primjer

```js
// ⚡ BUILD TIME - ovo se dešava jednom tokom builda
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  return posts.map(post => ({ slug: post.slug }))
}

// 🔄 RUNTIME - ovo se dešava na svaki request (ako je dinamična stranica)
export default async function Page({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`, {
    cache: 'no-store' // Force runtime fetch
  })
  return <article>{/* ... */}</article>
}
```

### Razumijevanje Next.js output-a

Kada pokrenete `next build`, vidite output poput:

```
Route (app)                    Size     First Load JS
┌ ○ /                          5.2 kB   89 kB
├ ○ /about                     1.8 kB   85 kB
├ λ /api/posts                 0 B      0 B
├ ● /blog                      3.1 kB   87 kB
├ ● /blog/[slug]               2.4 kB   86 kB
└ λ /dashboard                 4.7 kB   88 kB

○  (Static)   prazan krug = statička stranica (build time)
●  (SSG)      pun krug = generisano u build time-u
λ  (Dynamic)  lambda = server-side renderovano (runtime)
```

---

## 3. Vercel Platforma

### Šta je Vercel?

Vercel je cloud platforma kreirana od istog tima koji je napravio Next.js. Nudi:
- **Automatski deploy** iz Git repozitorijuma
- **Edge Network** - CDN sa 100+ lokacija
- **Serverless Functions** - API rute se izvršavaju kao serverless
- **Preview Deployments** - svaki PR dobije svoj URL
- **Analytics** - Web Vitals monitoring

### Deploy Workflow

```
1. Push na GitHub/GitLab
         ↓
2. Vercel detektuje promjene
         ↓
3. Pokreće `next build`
         ↓
4. Deploy na Edge Network
         ↓
5. Dostupno na .vercel.app domeni
```

### Kako deployovati na Vercel

#### Opcija A: Preko Vercel Dashboard-a (GUI)

1. Idite na [vercel.com](https://vercel.com) i napravite nalog
2. Kliknite **"Add New Project"**
3. Povežite GitHub repozitorijum
4. Vercel automatski detektuje Next.js
5. Dodajte environment varijable
6. Kliknite **"Deploy"**

#### Opcija B: Preko Vercel CLI

```bash
# 1. Instalirajte Vercel CLI
npm install -g vercel

# 2. Ulogujte se
vercel login

# 3. Deploy (iz root foldera projekta)
vercel

# 4. Deploy u produkciju
vercel --prod
```

#### Opcija C: Automatski deploy (preporučeno)

```bash
# 1. Povežite repo sa Vercel-om (jednom)
# 2. Svaki push na main = production deploy
# 3. Svaki push na drugu branch = preview deploy

git add .
git commit -m "Nova funkcionalnost"
git push origin main
# ✅ Vercel automatski deploya!
```

### Vercel Environment Varijable

Dodajte env varijable kroz Vercel Dashboard:

```
Settings → Environment Variables

┌──────────────────┬─────────────────────────┬─────────────┐
│ Name             │ Value                   │ Environment │
├──────────────────┼─────────────────────────┼─────────────┤
│ DATABASE_URL     │ mongodb+srv://...       │ Production  │
│ NEXTAUTH_SECRET  │ abc123...               │ All         │
│ NEXTAUTH_URL     │ https://mojsajt.com     │ Production  │
│ NEXTAUTH_URL     │ https://dev.mojsajt.com │ Preview     │
└──────────────────┴─────────────────────────┴─────────────┘
```

> **Tip:** Možete imati različite vrijednosti za Production, Preview i Development okruženja.

### vercel.json (opciona konfiguracija)

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["fra1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/stari-url",
      "destination": "/novi-url",
      "permanent": true
    }
  ]
}
```

---

## 4. Production Build

### Pokretanje production build-a lokalno

```bash
# 1. Build
npm run build

# 2. Start production server
npm run start

# Ili u jednoj komandi
npm run build && npm run start
```

### next.config.mjs za produkciju

```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizacija slika sa eksternih domena
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Redirecti
  async redirects() {
    return [
      {
        source: '/blog/stari-post',
        destination: '/blog/novi-post',
        permanent: true, // 301
      },
    ]
  },

  // Custom headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

---

## 5. Folder Organizacija za Produkciju

### Preporučena struktura

```
my-app/
├── app/                     # App Router (stranice i rute)
│   ├── (auth)/              # Route group - auth stranice
│   │   ├── login/
│   │   │   └── page.js
│   │   └── register/
│   │       └── page.js
│   ├── (dashboard)/         # Route group - zaštićene stranice
│   │   ├── layout.js        # Dashboard layout sa sidebar-om
│   │   ├── dashboard/
│   │   │   └── page.js
│   │   └── settings/
│   │       └── page.js
│   ├── api/                 # API rute
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.js
│   │   └── posts/
│   │       ├── route.js     # GET /api/posts, POST /api/posts
│   │       └── [id]/
│   │           └── route.js # GET, PUT, DELETE /api/posts/:id
│   ├── blog/
│   │   ├── page.js          # SSG lista postova
│   │   └── [slug]/
│   │       └── page.js      # SSG/ISR pojedinačni post
│   ├── layout.js            # Root layout
│   ├── page.js              # Početna stranica
│   ├── not-found.js         # Custom 404
│   ├── error.js             # Global error handler
│   ├── loading.js           # Global loading UI
│   └── globals.css
├── components/              # Reusable komponente
│   ├── ui/                  # Bazne UI komponente
│   │   ├── Button.js
│   │   ├── Input.js
│   │   └── Modal.js
│   ├── layout/              # Layout komponente
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   └── Sidebar.js
│   └── features/            # Feature-specific komponente
│       ├── PostCard.js
│       └── UserAvatar.js
├── lib/                     # Utility funkcije i konfiguracija
│   ├── db.js                # Database konekcija
│   ├── auth.js              # Auth konfiguracija
│   ├── utils.js             # Helper funkcije
│   └── env.js               # Env validacija
├── hooks/                   # Custom React hooks
│   ├── useAuth.js
│   └── useDebounce.js
├── public/                  # Statički fajlovi
│   ├── images/
│   ├── favicon.ico
│   └── robots.txt
├── .env.local               # Lokalne env varijable (GITIGNORE!)
├── .env.example             # Primjer env varijabli
├── .gitignore
├── next.config.mjs
├── package.json
└── README.md
```

### Zašto je organizacija bitna?

| Princip | Objašnjenje |
|---------|-------------|
| **Separation of Concerns** | Svaka folder ima jasnu odgovornost |
| **Skalabilnost** | Lako dodati nove feature-e bez haosa |
| **Team collaboration** | Developeri znaju gdje šta ide |
| **Maintenance** | Lakše pronaći i popraviti bugove |

---

## 6. Error Handling u Produkciji

### Global Error Boundary

```js
// app/error.js
'use client'

export default function Error({ error, reset }) {
  // Logujte grešku na server (npr. Sentry)
  console.error('Application error:', error)

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Nešto je pošlo naopako!</h2>
      <p>{error.message || 'Nepoznata greška'}</p>
      <button onClick={() => reset()}>
        Pokušaj ponovo
      </button>
    </div>
  )
}
```

### Custom 404 stranica

```js
// app/not-found.js
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>404 - Stranica nije pronađena</h2>
      <p>Stranica koju tražite ne postoji.</p>
      <Link href="/">Nazad na početnu</Link>
    </div>
  )
}
```

### Error handling u API rutama

```js
// app/api/posts/route.js
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const posts = await db.collection('posts').find({}).toArray()
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Greška pri učitavanju postova' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Validacija
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Naslov i sadržaj su obavezni' },
        { status: 400 }
      )
    }

    const result = await db.collection('posts').insertOne(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Greška pri kreiranju posta' },
      { status: 500 }
    )
  }
}
```

---

## 7. Skaliranje Next.js Aplikacija

### Strategije skaliranja

```
             ┌─────────────────────────────────────┐
             │        Skaliranje Next.js            │
             └──────────┬──────────────────────────┘
                        │
          ┌─────────────┼──────────────┐
          │             │              │
    ┌─────▼─────┐ ┌────▼─────┐ ┌─────▼──────┐
    │  Caching  │ │  Static  │ │  Database  │
    │           │ │Generation│ │Optimization│
    └─────┬─────┘ └────┬─────┘ └─────┬──────┘
          │             │              │
    - ISR          - SSG pages    - Connection
    - CDN cache    - Static API     pooling
    - Redis        - Edge caching - Indexing
    - HTTP cache   - Prerender    - Read replicas
```

### ISR (Incremental Static Regeneration)

```js
// app/blog/page.js
// Revalidate svakih 60 sekundi
export const revalidate = 60

export default async function BlogPage() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }
  }).then(r => r.json())

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  )
}
```

### On-Demand Revalidation

```js
// app/api/revalidate/route.js
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request) {
  const { path, tag, secret } = await request.json()

  // Provjera secret-a
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (path) {
    revalidatePath(path)
    return Response.json({ revalidated: true, path })
  }

  if (tag) {
    revalidateTag(tag)
    return Response.json({ revalidated: true, tag })
  }

  return Response.json({ error: 'Path or tag required' }, { status: 400 })
}
```

---

## 8. Deploy Checklist

Prije svakog deploya, provjerite:

### Pre-Deploy

- [ ] Sve env varijable su postavljene na Vercel-u
- [ ] `.env.local` je u `.gitignore`
- [ ] `.env.example` je ažuriran
- [ ] `next build` prolazi bez grešaka lokalno
- [ ] Nema hardkodiranih URL-ova (koristite env varijable)
- [ ] Slike koriste `next/image` komponentu
- [ ] API rute imaju error handling

### Sigurnost

- [ ] Secret ključevi nisu u client kodu (bez `NEXT_PUBLIC_` prefiksa)
- [ ] CORS je ispravno konfigurisan
- [ ] Security headers su postavljeni (X-Frame-Options, CSP, itd.)
- [ ] Rate limiting na API rutama (opciono)
- [ ] Input validacija na svim API rutama

### Performanse

- [ ] Lighthouse score > 90
- [ ] Slike su optimizovane
- [ ] Statičke stranice koriste SSG gdje je moguće
- [ ] Bundle size je prihvatljiv
- [ ] Lazy loading za teške komponente

### Post-Deploy

- [ ] Provjeri da sajt radi na produkcijskom URL-u
- [ ] Testiraj auth flow
- [ ] Testiraj API rute
- [ ] Provjeri logs na Vercel Dashboard-u
- [ ] Provjeri Core Web Vitals

---

## 9. Alternative Vercel-u

| Platforma | Besplatni Plan | Serverless | Edge | Napomena |
|-----------|---------------|------------|------|----------|
| **Vercel** | Da | Da | Da | Best za Next.js |
| **Netlify** | Da | Da | Da | Dobar za Jamstack |
| **Railway** | Da (trial) | Ne | Ne | Full-stack hosting |
| **Render** | Da | Ne | Ne | Generalni hosting |
| **AWS Amplify** | Da (free tier) | Da | Da | AWS ekosistem |
| **Cloudflare Pages** | Da | Da | Da | Edge-first |
| **DigitalOcean App Platform** | Ne | Ne | Ne | Jednostavan setup |

---

## Zadaci za Studente

### Zadatak 1: Environment Setup (Lako)
Kreirajte pravilan .env setup za projekat:
- [ ] Napravite `.env.local` sa svim varijablama
- [ ] Napravite `.env.example` bez tajnih vrijednosti
- [ ] Provjerite da je `.env.local` u `.gitignore`
- [ ] Napravite `lib/env.js` sa validacijom varijabli

---

### Zadatak 2: Production Build (Lako)
Pokrenite i analizirajte production build:
- [ ] Pokrenite `npm run build`
- [ ] Analizirajte output (koje stranice su statičke, koje dinamičke)
- [ ] Pokrenite `npm run start` i testirajte lokalno
- [ ] Identifikujte stranice koje mogu biti SSG umjesto SSR

---

### Zadatak 3: Error Pages (Srednje)
Implementirajte error handling:
- [ ] Kreirajte custom `app/not-found.js` stranicu
- [ ] Kreirajte custom `app/error.js` error boundary
- [ ] Dodajte try/catch na sve API rute
- [ ] Testirajte error stranice (posjetite nepostojeći URL)

---

### Zadatak 4: Security Headers (Srednje)
Dodajte sigurnosne headere:
- [ ] Dodajte `X-Frame-Options: DENY` u `next.config.mjs`
- [ ] Dodajte `X-Content-Type-Options: nosniff`
- [ ] Dodajte `Referrer-Policy`
- [ ] Provjerite headere u browser DevTools (Network tab)

**Fajl za izmenu:** `next.config.mjs`

---

### Zadatak 5: Vercel Deploy (Srednje)
Deployajte projekat na Vercel:
- [ ] Napravite Vercel nalog (ako ga nemate)
- [ ] Povežite GitHub repozitorijum
- [ ] Dodajte sve env varijable u Vercel Dashboard
- [ ] Deploy i testirajte produkcijski URL
- [ ] Napravite promjenu i push-ujte - provjerite automatski deploy

---

### Zadatak 6: ISR Implementacija (Teško)
Implementirajte Incremental Static Regeneration:
- [ ] Postavite `revalidate` na blog stranicu (60 sekundi)
- [ ] Kreirajte API rutu za on-demand revalidaciju
- [ ] Testirajte: dodajte novi post i pozovite revalidaciju
- [ ] Provjerite da se stranica ažurira bez ponovnog builda

---

### Zadatak 7: Deploy Checklist (Teško)
Prođite kroz kompletnu deploy checklist:
- [ ] Sve stavke iz "Pre-Deploy" sekcije
- [ ] Lighthouse audit sa score > 90
- [ ] Testirajte na mobilnom uređaju
- [ ] Provjerite SEO meta tagove na produkciji
- [ ] Dokumentujte deployment proces za tim

---

### Bonus: Mini SaaS Platforma
Kreirajte i deployajte mini blog platformu sa:
- [ ] **Auth** - Login/Register sa NextAuth
- [ ] **CRUD** - Kreiranje, čitanje, ažuriranje, brisanje postova
- [ ] **SSR + SSG** - Dashboard (SSR), Blog stranice (SSG)
- [ ] **Deploy** - Postavite na Vercel sa svim env varijablama
- [ ] Bonus: Dodajte custom domenu

---

## Korisni Linkovi

- [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Next.js Production Checklist](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)
- [Web.dev Performance](https://web.dev/performance/)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)

---
