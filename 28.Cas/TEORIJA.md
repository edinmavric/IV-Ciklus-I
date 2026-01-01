# Next.js Kurs - Teorija

## Sadržaj
- [Next.js mindset & App Router osnove](#nextjs-mindset--app-router-osnove)
- [Routing, layouts & navigacija](#routing-layouts--navigacija)

---

# Next.js mindset & App Router osnove

## 1. Zašto Next.js? (Problem SPA-a)

### Problemi tradicionalnih Single Page Applications (SPA)

Tradicionalne SPA aplikacije (React sa Create React App, Vue CLI) imaju nekoliko ključnih problema:

#### 1.1 SEO Problemi
```
SPA Flow:
1. Browser traži stranicu
2. Server vraća prazan HTML sa <div id="root"></div>
3. Browser skida JavaScript bundle
4. JavaScript renderuje sadržaj
5. Korisnik KONAČNO vidi stranicu

Problem: Google bot možda ne čeka JavaScript!
```

```html
<!-- Šta Google bot vidi kod SPA -->
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="root"></div>  <!-- PRAZAN! -->
  <script src="bundle.js"></script>
</body>
</html>
```

#### 1.2 Sporo Inicijalno Učitavanje (First Contentful Paint)

```
SPA Timeline:
[----Download HTML----][----Download JS (2MB)----][----Parse JS----][----Execute JS----][RENDER]
                                                                                         ↑
                                                                              Korisnik čeka ovde!

Next.js Timeline:
[----Download HTML with Content----][RENDER][----Download JS----][Hydration]
                                     ↑
                         Korisnik vidi sadržaj ODMAH!
```

#### 1.3 Problemi sa Social Media Sharing

```html
<!-- SPA: Meta tagovi nisu dostupni -->
<meta property="og:title" content="Loading..." />
<meta property="og:image" content="" />

<!-- Next.js: Pravilni meta tagovi -->
<meta property="og:title" content="Moj Proizvod - Najbolja Ponuda" />
<meta property="og:image" content="https://example.com/product.jpg" />
```

### Šta Next.js Rešava?

| Problem | SPA | Next.js |
|---------|-----|---------|
| SEO | Loš | Odličan |
| Inicijalno učitavanje | Sporo | Brzo |
| Social sharing | Ne radi | Radi |
| Code splitting | Ručno | Automatski |
| Routing | Biblioteka | Built-in |
| API routes | Odvojen backend | Built-in |

---

## 2. Next.js vs CRA vs Vite

### Create React App (CRA)

```bash
npx create-react-app my-app
```

**Karakteristike:**
- Više se ne održava aktivno (deprecated)
- Samo CSR (Client-Side Rendering)
- Nema routing (treba react-router)
- Spor development server
- Veliki bundle size

```javascript
// CRA - Sve se renderuje na klijentu
function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;  // Korisnik vidi ovo prvo!

  return <div>{data.content}</div>;
}
```

### Vite

```bash
npm create vite@latest my-app -- --template react
```

**Karakteristike:**
- Izuzetno brz development server (ESM)
- Aktivno održavan
- Samo CSR po defaultu
- Nema routing built-in
- Nema SSR bez dodatne konfiguracije

```javascript
// Vite - Slično CRA, ali brži dev server
// Ipak je samo CSR
```

### Next.js

```bash
npx create-next-app@latest my-app
```

**Karakteristike:**
- SSR, SSG, ISR, CSR - sve strategije
- File-based routing
- API routes built-in
- Optimizacija slika
- Automatski code splitting
- Aktivno održavan (Vercel)

```javascript
// Next.js - Server Component (default)
async function Page() {
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();

  // Ovo se renderuje na SERVERU
  // Korisnik dobija gotov HTML!
  return <div>{json.content}</div>;
}
```

### Poređenje Performansi

```
First Contentful Paint (FCP):

CRA:     [████████████████████] 3.2s
Vite:    [████████████████████] 3.0s  (brži dev, ista produkcija)
Next.js: [████████] 0.8s              (SSR prednost)
```

---

## 3. Rendering Strategije

### 3.1 CSR (Client-Side Rendering)

**Kako radi:**
```
1. Server šalje prazan HTML
2. Browser skida JavaScript
3. JavaScript renderuje stranicu
4. Fetch-uje podatke
5. Prikazuje podatke
```

```javascript
// Next.js - CSR komponenta
'use client';

import { useState, useEffect } from 'react';

export default function ClientComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Učitavanje...</div>;

  return (
    <ul>
      {data.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

**Kada koristiti CSR:**
- Dashboard-i sa real-time podacima
- Interaktivne forme
- Komponente koje koriste browser API (localStorage, window)
- Privatni sadržaj (ne treba SEO)

---

### 3.2 SSR (Server-Side Rendering)

**Kako radi:**
```
1. Korisnik traži stranicu
2. Server renderuje HTML sa podacima
3. Server šalje KOMPLETAN HTML
4. Browser prikazuje odmah
5. JavaScript se učitava (hydration)
6. Stranica postaje interaktivna
```

```javascript
// Next.js 13+ App Router - SSR (dynamic rendering)
// Ovo je Server Component - default ponašanje

async function ProductPage({ params }) {
  // Ovo se izvršava na SERVERU pri SVAKOM requestu
  const response = await fetch(`https://api.example.com/products/${params.id}`, {
    cache: 'no-store'  // Forsira SSR - svaki put svež podatak
  });
  const product = await response.json();

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Cena: {product.price} RSD</p>
    </div>
  );
}

export default ProductPage;
```

**Kada koristiti SSR:**
- Stranice sa često menjajućim podacima
- Personalizovan sadržaj
- E-commerce product stranice
- Vesti i članci

---

### 3.3 SSG (Static Site Generation)

**Kako radi:**
```
BUILD TIME:
1. Next.js poziva API
2. Generiše statički HTML
3. Čuva HTML fajlove

RUNTIME:
1. Korisnik traži stranicu
2. Server šalje GOTOV HTML (iz keša/CDN)
3. Super brzo!
```

```javascript
// Next.js 13+ App Router - SSG
// Po defaultu, fetch se kešira = SSG ponašanje

async function BlogPost({ params }) {
  // Ovo se izvršava samo JEDNOM tokom builda
  const response = await fetch(`https://api.example.com/posts/${params.slug}`, {
    cache: 'force-cache'  // Default - SSG ponašanje
  });
  const post = await response.json();

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

// Generisanje svih mogućih putanja tokom builda
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return posts.map(post => ({
    slug: post.slug
  }));
}

export default BlogPost;
```

**Kada koristiti SSG:**
- Blog postovi
- Dokumentacija
- Marketing stranice
- Portfolio sajtovi
- Bilo šta što se retko menja

---

### 3.4 ISR (Incremental Static Regeneration) - Uvod

**Kako radi:**
```
BUILD TIME:
1. Generiše statički HTML

RUNTIME:
1. Servira statički HTML
2. Nakon X sekundi, revalidira u pozadini
3. Sledeći korisnik dobija novu verziju
```

```javascript
// Next.js 13+ App Router - ISR
async function ProductsPage() {
  const response = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 }  // Revalidira svaki minut
  });
  const products = await response.json();

  return (
    <div>
      <h1>Naši Proizvodi</h1>
      <p>Poslednje ažuriranje: {new Date().toLocaleTimeString()}</p>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name} - {product.price} RSD</li>
        ))}
      </ul>
    </div>
  );
}

export default ProductsPage;
```

**ISR = Najbolje od SSG + SSR:**
- Brzina SSG-a
- Svežina SSR-a
- Ne opterećuje server kao SSR

---

### Uporedni Pregled Rendering Strategija

```
                    CSR         SSR         SSG         ISR
─────────────────────────────────────────────────────────────
Brzina FCP          Spora       Srednja     Najbrža     Najbrža
SEO                 Loš         Odličan     Odličan     Odličan
Svežina podataka    Real-time   Real-time   Build-time  Periodično
Server load         Nizak       Visok       Minimalan   Nizak
Build time          Brz         Brz         Može biti   Srednji
                                            spor
Primer              Dashboard   User        Blog        E-commerce
                               profile                  catalog
```

---

## 4. App Router vs Pages Router

### Istorija Next.js Routera

```
Next.js verzije:

v1-v12: Pages Router (pages/ direktorijum)
v13+:   App Router (app/ direktorijum) - PREPORUČENO
```

### Pages Router (Legacy)

```
pages/
├── index.js          → /
├── about.js          → /about
├── blog/
│   ├── index.js      → /blog
│   └── [slug].js     → /blog/:slug
└── _app.js           → Layout wrapper
```

```javascript
// pages/index.js - Pages Router
export default function Home({ data }) {
  return <div>{data.title}</div>;
}

// Data fetching - posebne funkcije
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return { props: { data } };
}
```

**Problemi Pages Routera:**
- Sve komponente su Client Components
- Specijalne funkcije za data fetching
- Kompleksni layouts
- Teško deljenje stanja između ruta

### App Router (Preporučeno)

```
app/
├── layout.tsx        → Root layout
├── page.tsx          → /
├── about/
│   └── page.tsx      → /about
├── blog/
│   ├── layout.tsx    → Blog layout
│   ├── page.tsx      → /blog
│   └── [slug]/
│       └── page.tsx  → /blog/:slug
└── globals.css
```

```javascript
// app/page.tsx - App Router
// Server Component po defaultu!
async function Home() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  // Nema potrebe za getServerSideProps!
  return <div>{data.title}</div>;
}

export default Home;
```

### Zašto App Router?

| Feature | Pages Router | App Router |
|---------|--------------|------------|
| Server Components | | Default |
| Nested Layouts | Kompleksno | Jednostavno |
| Data Fetching | getServerSideProps | async/await u komponenti |
| Loading States | Ručno | loading.tsx |
| Error Handling | _error.js | error.tsx |
| Streaming | | |
| Partial Rendering | | |

---

## 5. Struktura Next.js Projekta

### Kreiranje Projekta

```bash
npx create-next-app@latest my-app
```

**Opcije pri kreiranju:**
```
✔ Would you like to use TypeScript? Yes
✔ Would you like to use ESLint? Yes
✔ Would you like to use Tailwind CSS? Yes
✔ Would you like to use `src/` directory? No
✔ Would you like to use App Router? Yes
✔ Would you like to customize the default import alias? No
```

### Struktura Foldera

```
my-app/
├── app/                    # App Router - glavna logika
│   ├── layout.tsx          # Root layout (obavezan)
│   ├── page.tsx            # Homepage (/)
│   ├── globals.css         # Globalni stilovi
│   ├── favicon.ico         # Favicon
│   └── ...                 # Ostale rute
├── public/                 # Statički fajlovi
│   ├── images/
│   └── ...
├── components/             # Reusable komponente (opciono)
├── lib/                    # Utility funkcije (opciono)
├── next.config.js          # Next.js konfiguracija
├── package.json
├── tsconfig.json           # TypeScript konfiguracija
├── tailwind.config.js      # Tailwind konfiguracija
└── postcss.config.js
```

---

## 6. layout.tsx vs page.tsx

### layout.tsx - Layout Komponenta

```typescript
// app/layout.tsx - ROOT LAYOUT (obavezan)
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Moja Aplikacija',
  description: 'Opis moje aplikacije',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className={inter.className}>
        <header>
          <nav>
            <a href="/">Početna</a>
            <a href="/about">O nama</a>
            <a href="/contact">Kontakt</a>
          </nav>
        </header>

        <main>{children}</main>

        <footer>
          <p>&copy; 2024 Moja Aplikacija</p>
        </footer>
      </body>
    </html>
  );
}
```

**Karakteristike layout.tsx:**
- Obavija sve child stranice
- NE re-renderuje se pri navigaciji
- Čuva state između navigacija
- Može biti nested (više nivoa)

### page.tsx - Page Komponenta

```typescript
// app/page.tsx - HOMEPAGE
export default function HomePage() {
  return (
    <div>
      <h1>Dobrodošli!</h1>
      <p>Ovo je početna stranica.</p>
    </div>
  );
}
```

```typescript
// app/about/page.tsx - ABOUT STRANICA
export default function AboutPage() {
  return (
    <div>
      <h1>O nama</h1>
      <p>Mi smo tim developers-a...</p>
    </div>
  );
}
```

**Karakteristike page.tsx:**
- Jedinstveni sadržaj za rutu
- Re-renderuje se pri navigaciji
- Jedini fajl koji kreira rutu

### Kako Layout i Page Rade Zajedno

```
Korisnik posećuje /about

1. Next.js pronalazi app/about/page.tsx
2. Renderuje layout.tsx sa page.tsx kao children

Rezultat:
┌─────────────────────────────────────┐
│ layout.tsx                          │
│ ┌─────────────────────────────────┐ │
│ │ <header>Nav</header>            │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ page.tsx (children)         │ │ │
│ │ │ <h1>O nama</h1>             │ │ │
│ │ │ <p>Mi smo...</p>            │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ <footer>Copyright</footer>      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 7. Server Components vs Client Components

### Server Components (Default)

```typescript
// app/products/page.tsx
// Ovo je Server Component - NEMA 'use client'

async function ProductsPage() {
  // Možemo koristiti async/await direktno!
  const products = await fetch('https://api.example.com/products')
    .then(res => res.json());

  // Možemo pristupiti bazi direktno!
  // const products = await db.product.findMany();

  console.log('Ovo se loguje na SERVERU, ne u browseru!');

  return (
    <div>
      <h1>Proizvodi</h1>
      {products.map(product => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.price} RSD</p>
        </div>
      ))}
    </div>
  );
}

export default ProductsPage;
```

**Prednosti Server Components:**
- Manji JavaScript bundle (ne šalju se klijentu)
- Direktan pristup backend resursima
- Sigurno čuvanje API ključeva
- Automatsko code splitting

**Ograničenja Server Components:**
- Ne mogu koristiti useState, useEffect
- Ne mogu koristiti browser API (window, document)
- Ne mogu imati event handlere (onClick, onChange)

### Client Components

```typescript
// app/components/Counter.tsx
'use client';  // ← OBAVEZNA DIREKTIVA!

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Broj: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Povećaj
      </button>
    </div>
  );
}
```

**Kada koristiti Client Components:**
- Interaktivnost (onClick, onChange)
- State management (useState, useReducer)
- Lifecycle effects (useEffect)
- Browser API (localStorage, geolocation)
- Custom hooks koji koriste state

---

## 8. "use client" Objašnjenje

### Šta je "use client"?

```typescript
'use client';  // Mora biti PRVA LINIJA fajla!

// Ova direktiva označava granicu između Server i Client komponenti
```

### Pravila za "use client"

```
PRAVILO 1: "use client" se propagira NADOLE

ServerComponent.tsx (nema 'use client')
    └── ClientComponent.tsx ('use client')
            └── AnyComponent.tsx → automatski postaje Client!
```

```
PRAVILO 2: Server komponente NE mogu biti importovane u Client komponente

GREŠKA:
'use client';
import ServerComponent from './ServerComponent';  // ERROR!
```

```
PRAVILO 3: Client komponente mogu biti CHILDREN Server komponenti

ISPRAVNO:
// app/page.tsx (Server)
import ClientButton from './ClientButton';

export default function Page() {
  return (
    <div>
      <h1>Server rendered</h1>
      <ClientButton />  {/* Ovo radi! */}
    </div>
  );
}
```

### Vizuelni Prikaz Granice

```
app/
├── layout.tsx          ← Server Component
│   └── Header.tsx      ← Server Component
│   └── page.tsx        ← Server Component
│       └── ProductList ← Server (fetch data)
│           └── AddToCartButton ('use client')  ← CLIENT BOUNDARY
│               └── CartIcon    ← Client (child of client)
```

### Praktični Primer

```typescript
// app/products/page.tsx - SERVER COMPONENT
import AddToCartButton from '@/components/AddToCartButton';

async function ProductsPage() {
  const products = await fetch('https://api.example.com/products')
    .then(res => res.json());

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.price} RSD</p>
          {/* Client komponenta unutar Server komponente */}
          <AddToCartButton productId={product.id} />
        </div>
      ))}
    </div>
  );
}
```

```typescript
// components/AddToCartButton.tsx - CLIENT COMPONENT
'use client';

import { useState } from 'react';

export default function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    // Dodaj u korpu...
    setAdded(true);
  };

  return (
    <button onClick={handleClick} disabled={added}>
      {added ? 'Dodato ✓' : 'Dodaj u korpu'}
    </button>
  );
}
```

---

## Mini Zadatak

Napraviti 3 stranice: `/`, `/about`, `/contact`

### Rešenje:

```
app/
├── layout.tsx
├── page.tsx           → /
├── about/
│   └── page.tsx       → /about
├── contact/
│   └── page.tsx       → /contact
└── globals.css
```

```typescript
// app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Moj Sajt',
  description: 'Next.js aplikacija',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body>
        <nav style={{ padding: '1rem', background: '#333', color: 'white' }}>
          <a href="/" style={{ marginRight: '1rem', color: 'white' }}>Početna</a>
          <a href="/about" style={{ marginRight: '1rem', color: 'white' }}>O nama</a>
          <a href="/contact" style={{ color: 'white' }}>Kontakt</a>
        </nav>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
```

```typescript
// app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>Dobrodošli na naš sajt!</h1>
      <p>Ovo je početna stranica napravljena sa Next.js.</p>
    </div>
  );
}
```

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>O nama</h1>
      <p>Mi smo tim posvećen kreiranju kvalitetnih web aplikacija.</p>
    </div>
  );
}
```

```typescript
// app/contact/page.tsx
export default function ContactPage() {
  return (
    <div>
      <h1>Kontakt</h1>
      <p>Email: info@example.com</p>
      <p>Telefon: +381 11 123 4567</p>
    </div>
  );
}
```

---

# Routing, layouts & navigacija

## 1. File-based Routing

Next.js koristi **file-system based routing** - struktura foldera = struktura URL-ova.

### Osnovna Pravila

```
app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
├── products/
│   └── page.tsx          → /products
├── blog/
│   ├── page.tsx          → /blog
│   └── first-post/
│       └── page.tsx      → /blog/first-post
```

### Specijalni Fajlovi u App Router-u

| Fajl | Namena |
|------|--------|
| `page.tsx` | UI za rutu (jedini koji kreira rutu) |
| `layout.tsx` | Shared layout za segment i children |
| `loading.tsx` | Loading UI |
| `error.tsx` | Error UI |
| `not-found.tsx` | 404 UI |
| `route.tsx` | API endpoint |

```
app/
├── products/
│   ├── page.tsx          # /products stranica
│   ├── layout.tsx        # Layout za /products/*
│   ├── loading.tsx       # Prikazuje se dok se učitava
│   ├── error.tsx         # Prikazuje se ako dođe do greške
│   └── not-found.tsx     # 404 za /products/*
```

---

## 2. Nested Routes (Ugnježdene Rute)

### Struktura

```
app/
├── dashboard/
│   ├── layout.tsx        # Dashboard layout
│   ├── page.tsx          # /dashboard
│   ├── settings/
│   │   └── page.tsx      # /dashboard/settings
│   ├── profile/
│   │   └── page.tsx      # /dashboard/profile
│   └── analytics/
│       └── page.tsx      # /dashboard/analytics
```

### Dashboard Layout

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar - ostaje isti na svim dashboard stranicama */}
      <aside style={{ width: '250px', background: '#f0f0f0', padding: '1rem' }}>
        <h2>Dashboard</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><a href="/dashboard">Pregled</a></li>
            <li><a href="/dashboard/profile">Profil</a></li>
            <li><a href="/dashboard/settings">Podešavanja</a></li>
            <li><a href="/dashboard/analytics">Analitika</a></li>
          </ul>
        </nav>
      </aside>

      {/* Main content - menja se */}
      <main style={{ flex: 1, padding: '1rem' }}>
        {children}
      </main>
    </div>
  );
}
```

```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard Pregled</h1>
      <p>Dobrodošli na vaš dashboard!</p>
    </div>
  );
}
```

```typescript
// app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return (
    <div>
      <h1>Podešavanja</h1>
      <form>
        <label>
          Ime:
          <input type="text" name="name" />
        </label>
        <button type="submit">Sačuvaj</button>
      </form>
    </div>
  );
}
```

### Kako Nested Layouts Rade

```
Poseta: /dashboard/settings

Renderovanje:
┌─ RootLayout (app/layout.tsx) ──────────────────────┐
│  <html>                                             │
│    <body>                                           │
│      ┌─ DashboardLayout (app/dashboard/layout.tsx)─┐│
│      │  <div style="display:flex">                 ││
│      │    <aside>Sidebar</aside>                   ││
│      │    <main>                                   ││
│      │      ┌─ SettingsPage ─────────────────────┐ ││
│      │      │  <h1>Podešavanja</h1>              │ ││
│      │      │  <form>...</form>                  │ ││
│      │      └────────────────────────────────────┘ ││
│      │    </main>                                  ││
│      │  </div>                                     ││
│      └─────────────────────────────────────────────┘│
│    </body>                                          │
│  </html>                                            │
└─────────────────────────────────────────────────────┘
```

---

## 3. Dynamic Routes [id]

### Osnovne Dinamičke Rute

```
app/
├── posts/
│   ├── page.tsx              # /posts (lista postova)
│   └── [id]/
│       └── page.tsx          # /posts/1, /posts/2, /posts/abc
```

```typescript
// app/posts/page.tsx - Lista postova
async function PostsPage() {
  const posts = await fetch('https://jsonplaceholder.typicode.com/posts')
    .then(res => res.json());

  return (
    <div>
      <h1>Blog Postovi</h1>
      <ul>
        {posts.slice(0, 10).map(post => (
          <li key={post.id}>
            <a href={`/posts/${post.id}`}>{post.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PostsPage;
```

```typescript
// app/posts/[id]/page.tsx - Pojedinačni post
interface PageProps {
  params: Promise<{ id: string }>;
}

async function PostPage({ params }: PageProps) {
  const { id } = await params;

  const post = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
    .then(res => res.json());

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <a href="/posts">← Nazad na listu</a>
    </article>
  );
}

export default PostPage;
```

### Više Dinamičkih Segmenata

```
app/
├── shop/
│   └── [category]/
│       └── [productId]/
│           └── page.tsx      # /shop/electronics/123
```

```typescript
// app/shop/[category]/[productId]/page.tsx
interface PageProps {
  params: Promise<{
    category: string;
    productId: string;
  }>;
}

async function ProductPage({ params }: PageProps) {
  const { category, productId } = await params;

  return (
    <div>
      <p>Kategorija: {category}</p>
      <p>Proizvod ID: {productId}</p>
    </div>
  );
}

export default ProductPage;
```

### Catch-all Segments

```
app/
├── docs/
│   └── [...slug]/
│       └── page.tsx          # /docs/a, /docs/a/b, /docs/a/b/c
```

```typescript
// app/docs/[...slug]/page.tsx
interface PageProps {
  params: Promise<{ slug: string[] }>;
}

async function DocsPage({ params }: PageProps) {
  const { slug } = await params;
  // slug = ['a', 'b', 'c'] za /docs/a/b/c

  return (
    <div>
      <h1>Dokumentacija</h1>
      <p>Putanja: {slug.join(' / ')}</p>
    </div>
  );
}

export default DocsPage;
```

### Optional Catch-all

```
app/
├── docs/
│   └── [[...slug]]/
│       └── page.tsx          # /docs, /docs/a, /docs/a/b
```

Razlika: `[[...slug]]` hvata i `/docs` (bez parametara).

---

## 4. Link vs \<a\>

### Zašto ne koristiti \<a\>?

```html
<!-- Standardni <a> tag -->
<a href="/about">O nama</a>

<!-- Problem: FULL PAGE RELOAD!
1. Browser zahteva novu stranicu
2. Svi resursi se ponovo učitavaju
3. JavaScript se ponovo izvršava
4. State se gubi
5. Sporo i loše UX
-->
```

### next/link Komponenta

```typescript
// Pravilna navigacija u Next.js
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      {/* Client-side navigacija - bez reload-a! */}
      <Link href="/">Početna</Link>
      <Link href="/about">O nama</Link>
      <Link href="/contact">Kontakt</Link>

      {/* Sa dinamičkim rutama */}
      <Link href="/posts/123">Post 123</Link>
      <Link href={`/posts/${postId}`}>Dinamički post</Link>
    </nav>
  );
}
```

### Prednosti Link Komponente

```
Link vs <a>:

<a href="/about">
  [Click] → Server Request → Full HTML → Parse → Render → Hydrate
  Vreme: ~500ms-2s

<Link href="/about">
  [Click] → Fetch JSON → Update DOM
  Vreme: ~50-200ms

+ Prefetching: Link unapred učitava stranice (na hover/viewport)
+ Soft Navigation: Samo promenjeni delovi se ažuriraju
+ State Preservation: Layout state se čuva
```

### Link sa Stilovima

```typescript
import Link from 'next/link';

// Link sa className
<Link href="/about" className="nav-link">
  O nama
</Link>

// Link kao button
<Link href="/products" className="btn btn-primary">
  Pogledaj proizvode
</Link>
```

### Prefetching

```typescript
import Link from 'next/link';

// Default: prefetch={true} za statičke rute
<Link href="/about">O nama</Link>

// Isključi prefetch za dinamičke/teške rute
<Link href="/heavy-page" prefetch={false}>
  Teška stranica
</Link>
```

---

## 5. useRouter, usePathname, useSearchParams

### useRouter - Programska Navigacija

```typescript
'use client';  // MORA biti client component!

import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await loginUser();

    if (success) {
      router.push('/dashboard');  // Navigacija
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Lozinka" />
      <button type="submit">Prijavi se</button>
    </form>
  );
}
```

### useRouter Metode

```typescript
'use client';

import { useRouter } from 'next/navigation';

export default function NavigationExample() {
  const router = useRouter();

  return (
    <div>
      {/* Navigacija napred */}
      <button onClick={() => router.push('/about')}>
        Idi na About
      </button>

      {/* Zameni trenutnu stranicu u istoriji */}
      <button onClick={() => router.replace('/login')}>
        Zameni sa Login
      </button>

      {/* Nazad u istoriji */}
      <button onClick={() => router.back()}>
        ← Nazad
      </button>

      {/* Napred u istoriji */}
      <button onClick={() => router.forward()}>
        Napred →
      </button>

      {/* Osvježi stranicu (refetch data) */}
      <button onClick={() => router.refresh()}>
        Osveži
      </button>
    </div>
  );
}
```

### usePathname - Trenutna Putanja

```typescript
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();
  // pathname = '/about' kada smo na /about stranici

  const links = [
    { href: '/', label: 'Početna' },
    { href: '/about', label: 'O nama' },
    { href: '/contact', label: 'Kontakt' },
  ];

  return (
    <nav>
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            fontWeight: pathname === link.href ? 'bold' : 'normal',
            color: pathname === link.href ? 'blue' : 'black',
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
```

### useSearchParams - Query Parametri

```typescript
'use client';

import { useSearchParams } from 'next/navigation';

// URL: /products?category=electronics&sort=price
export default function ProductFilters() {
  const searchParams = useSearchParams();

  const category = searchParams.get('category');  // 'electronics'
  const sort = searchParams.get('sort');          // 'price'
  const page = searchParams.get('page') || '1';   // '1' (default)

  return (
    <div>
      <p>Kategorija: {category}</p>
      <p>Sortiranje: {sort}</p>
      <p>Stranica: {page}</p>
    </div>
  );
}
```

### Kombinovanje Hook-ova

```typescript
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: string) => {
    // Kreiraj novi URLSearchParams
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);

    // Navigiraj sa novim parametrima
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <button onClick={() => handleCategoryChange('electronics')}>
        Elektronika
      </button>
      <button onClick={() => handleCategoryChange('clothing')}>
        Odeća
      </button>
    </div>
  );
}
```

---

## 6. Praktični Primeri

### Nested Dashboard Layout

```typescript
// app/dashboard/layout.tsx
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Dashboard</h2>
        <nav>
          <Link href="/dashboard">Pregled</Link>
          <Link href="/dashboard/profile">Profil</Link>
          <Link href="/dashboard/settings">Podešavanja</Link>
        </nav>
      </aside>
      <main className="content">
        {children}
      </main>
    </div>
  );
}
```

```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard Pregled</h1>
      <div className="stats">
        <div className="stat">
          <h3>Ukupno korisnika</h3>
          <p>1,234</p>
        </div>
        <div className="stat">
          <h3>Aktivnih sesija</h3>
          <p>56</p>
        </div>
      </div>
    </div>
  );
}
```

### Dinamičke Rute sa Podacima

```typescript
// app/posts/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

async function PostPage({ params }: PageProps) {
  const { id } = await params;

  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );

  if (!response.ok) {
    return <div>Post nije pronađen</div>;
  }

  const post = await response.json();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}

export default PostPage;
```

### Aktivna Navigacija

```typescript
// components/NavLink.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`nav-link ${isActive ? 'active' : ''}`}
      style={{
        color: isActive ? '#0070f3' : '#666',
        fontWeight: isActive ? 'bold' : 'normal',
        textDecoration: 'none',
        padding: '0.5rem 1rem',
        borderBottom: isActive ? '2px solid #0070f3' : '2px solid transparent',
      }}
    >
      {children}
    </Link>
  );
}
```

---

## Zadatak - Čas 2

Napraviti:
- `/blog` - lista blog postova
- `/blog/[slug]` - pojedinačni blog post
- Shared layout za blog

### Rešenje:

```
app/
├── blog/
│   ├── layout.tsx        # Blog layout
│   ├── page.tsx          # /blog
│   └── [slug]/
│       └── page.tsx      # /blog/prvi-post
```

```typescript
// app/blog/layout.tsx
import Link from 'next/link';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>
          <Link href="/blog" style={{ textDecoration: 'none', color: '#333' }}>
            Moj Blog
          </Link>
        </h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Razmišljanja o programiranju i tehnologiji
        </p>
      </header>

      <main>
        {children}
      </main>

      <footer style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #eee', color: '#666' }}>
        <p>&copy; 2024 Moj Blog. Sva prava zadržana.</p>
      </footer>
    </div>
  );
}
```

```typescript
// app/blog/page.tsx
import Link from 'next/link';

// Simulirani podaci
const posts = [
  {
    slug: 'uvod-u-nextjs',
    title: 'Uvod u Next.js',
    excerpt: 'Naučite osnove Next.js framework-a i zašto je tako popularan.',
    date: '2024-01-15',
  },
  {
    slug: 'react-hooks-vodic',
    title: 'Kompletan vodič za React Hooks',
    excerpt: 'Sve što trebate znati o useState, useEffect i drugim hooks-ima.',
    date: '2024-01-10',
  },
  {
    slug: 'typescript-za-pocetnike',
    title: 'TypeScript za početnike',
    excerpt: 'Započnite sa TypeScript-om i poboljšajte kvalitet svog koda.',
    date: '2024-01-05',
  },
];

export default function BlogPage() {
  return (
    <div>
      <h2>Svi postovi</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {posts.map(post => (
          <article
            key={post.slug}
            style={{
              padding: '1.5rem',
              border: '1px solid #eee',
              borderRadius: '8px'
            }}
          >
            <time style={{ color: '#666', fontSize: '0.875rem' }}>
              {new Date(post.date).toLocaleDateString('sr-RS')}
            </time>
            <h3 style={{ margin: '0.5rem 0' }}>
              <Link
                href={`/blog/${post.slug}`}
                style={{ color: '#0070f3', textDecoration: 'none' }}
              >
                {post.title}
              </Link>
            </h3>
            <p style={{ color: '#666', margin: 0 }}>{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// app/blog/[slug]/page.tsx
import Link from 'next/link';

// Simulirani podaci
const posts: Record<string, { title: string; content: string; date: string }> = {
  'uvod-u-nextjs': {
    title: 'Uvod u Next.js',
    content: `
      Next.js je React framework koji omogućava server-side rendering,
      static site generation, i mnoge druge napredne funkcionalnosti.

      U ovom članku ćemo proći kroz osnove Next.js-a i pokazati zašto
      je postao jedan od najpopularnijih načina za izgradnju React aplikacija.

      ## Zašto Next.js?

      1. Server-side rendering iz kutije
      2. File-based routing
      3. Optimizacija slika
      4. API routes
      5. I mnogo više...
    `,
    date: '2024-01-15',
  },
  'react-hooks-vodic': {
    title: 'Kompletan vodič za React Hooks',
    content: `
      React Hooks su revolucionisali način na koji pišemo React komponente.

      ## useState

      useState je najosnovniji hook koji nam omogućava dodavanje stanja
      u funkcionalne komponente.

      ## useEffect

      useEffect nam omogućava izvršavanje side-effects u našim komponentama.
    `,
    date: '2024-01-10',
  },
  'typescript-za-pocetnike': {
    title: 'TypeScript za početnike',
    content: `
      TypeScript je nadskup JavaScript-a koji dodaje statičko tipiziranje.

      ## Zašto TypeScript?

      1. Bolje tooling i autocomplete
      2. Hvatanje grešaka u compile-time
      3. Bolja dokumentacija koda
      4. Lakše refaktorisanje
    `,
    date: '2024-01-05',
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    return (
      <div>
        <h2>Post nije pronađen</h2>
        <p>Žao nam je, traženi post ne postoji.</p>
        <Link href="/blog">← Nazad na blog</Link>
      </div>
    );
  }

  return (
    <article>
      <Link
        href="/blog"
        style={{ color: '#666', textDecoration: 'none' }}
      >
        ← Nazad na blog
      </Link>

      <time
        style={{
          display: 'block',
          color: '#666',
          marginTop: '1rem',
          fontSize: '0.875rem'
        }}
      >
        {new Date(post.date).toLocaleDateString('sr-RS')}
      </time>

      <h1 style={{ marginTop: '0.5rem' }}>{post.title}</h1>

      <div style={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
        {post.content}
      </div>
    </article>
  );
}

// Generisanje statičkih putanja za sve postove
export function generateStaticParams() {
  return Object.keys(posts).map(slug => ({
    slug,
  }));
}
```

---

## Rezime

### Ključne Tačke

1. **Next.js rešava probleme SPA-a**: SEO, sporo učitavanje, social sharing
2. **Rendering strategije**: CSR, SSR, SSG, ISR - svaka ima svoju namenu
3. **App Router**: Moderni pristup sa Server Components kao default
4. **layout.tsx**: Deljeni UI koji se ne re-renderuje
5. **page.tsx**: Jedinstveni sadržaj za svaku rutu
6. **Server vs Client Components**: Server po defaultu, Client sa `'use client'`

### Ključne Tačke

1. **File-based routing**: Struktura foldera = URL struktura
2. **Nested routes**: Složene rute sa deljenim layoutima
3. **Dynamic routes [id]**: Dinamički segmenti u URL-u
4. **Link vs \<a\>**: Link za client-side navigaciju bez reload-a
5. **useRouter**: Programska navigacija
6. **usePathname**: Čitanje trenutne putanje
7. **useSearchParams**: Rad sa query parametrima

---

## Korisni Linkovi

- [Next.js Dokumentacija](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Routing](https://nextjs.org/docs/app/building-your-application/routing)
