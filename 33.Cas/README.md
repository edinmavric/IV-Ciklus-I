# Čas 33: Performance, SEO & Optimization

## Teme

### Teorija
- SEO u Next.js aplikacijama
- Metadata API (static i dynamic)
- Image optimization (next/image)
- Font optimization (next/font)
- Core Web Vitals

### Praksa
- generateMetadata funkcija
- Komponenta `<Image />`
- Komponenta `<Script />`
- Open Graph i Twitter Cards
- Sitemap i robots.txt

---

## Pokretanje Projekta

```bash
# 1. Uđite u direktorijum
cd my-app

# 2. Instalirajte zavisnosti
npm install

# 3. Pokrenite development server
npm run dev

# 4. Otvorite http://localhost:3000
```

---

## Struktura Projekta

```
my-app/
├── app/
│   ├── layout.js              # Root layout sa meta tagovima
│   ├── page.js                # Početna stranica
│   ├── globals.css            # Globalni stilovi
│   ├── blog/
│   │   ├── page.js            # Lista blog postova
│   │   ├── [slug]/
│   │   │   └── page.js        # Dinamička stranica posta
│   │   └── page.module.css
│   ├── products/
│   │   ├── page.js            # Lista proizvoda
│   │   ├── [id]/
│   │   │   └── page.js        # Stranica proizvoda
│   │   └── page.module.css
│   ├── about/
│   │   └── page.js            # O nama stranica
│   ├── sitemap.js             # Dinamički sitemap
│   └── robots.js              # Robots.txt
├── public/
│   ├── images/
│   │   ├── hero.jpg           # Hero slika
│   │   ├── blog/              # Blog slike
│   │   └── products/          # Slike proizvoda
│   └── og-image.jpg           # Open Graph slika
├── lib/
│   └── data.js                # Mock podaci
└── next.config.mjs            # Next.js konfiguracija
```

---

## Ključni Koncepti

### 1. **Metadata API**

Next.js omogućava definisanje meta tagova na dva načina:

#### Static Metadata
```js
export const metadata = {
  title: 'Moja Stranica',
  description: 'Opis stranice'
}
```

#### Dynamic Metadata
```js
export async function generateMetadata({ params }) {
  return {
    title: `Post - ${params.slug}`,
    description: 'Dinamički opis'
  }
}
```

### 2. **Image Optimization**

Next.js automatski optimizuje slike:
- Lazy loading
- Responsive images
- WebP format
- Placeholder blur

```js
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  priority
/>
```

### 3. **Font Optimization**

Next.js optimizuje fontove:
- Self-hosting Google Fonts
- Eliminiše dodatne network zahteve
- Automatski font subset

```js
import { Inter, Roboto } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

### 4. **Core Web Vitals**

- **LCP** (Largest Contentful Paint) - Loading performance
- **FID** (First Input Delay) - Interactivity
- **CLS** (Cumulative Layout Shift) - Visual stability

---

## SEO Best Practices

### ✅ DO
- Koristite semantički HTML (`<header>`, `<main>`, `<article>`)
- Dodajte `alt` tekst svim slikama
- Generirajte `sitemap.xml` i `robots.txt`
- Koristite Open Graph meta tagove
- Optimizujte slike (WebP format, lazy loading)
- Koristite server-side rendering (SSR) za dinamički sadržaj

### ❌ DON'T
- Ne koristite samo client-side rendering za kritičan sadržaj
- Ne zaboravljajte meta description
- Ne koristite generičke naslove (npr. "Home")
- Ne učitavajte sve slike odmah (koristite lazy loading)
- Ne blokirajte crawler-e u robots.txt ako želite da vas Google indexuje

---

## Zadaci za Studente

### Zadatak 1: Meta Tagovi (Lako)
Dodajte meta tagove na About stranicu:
- [ ] Naslov: "O Nama - Naša Kompanija"
- [ ] Opis: "Saznajte više o našoj kompaniji i timu"
- [ ] Keywords meta tag

**Fajl za izmenu:** `app/about/page.js`

---

### Zadatak 2: Open Graph Slika (Lako)
Dodajte Open Graph sliku na blog post:
- [ ] Dodajte `openGraph` objekat u metadata
- [ ] Postavite sliku, naslov i opis
- [ ] Testirajte sa [OpenGraph.xyz](https://www.opengraph.xyz/)

**Fajl za izmenu:** `app/blog/[slug]/page.js`

---

### Zadatak 3: Image Gallery (Srednje)
Kreirajte galeriju slika sa optimizacijom:
- [ ] Napravite `app/gallery/page.js`
- [ ] Prikažite 9 slika u grid layoutu (3x3)
- [ ] Koristite `next/image` komponentu
- [ ] Dodajte `loading="lazy"` na sve slike osim prve
- [ ] Dodajte `placeholder="blur"`

**Hint:** Možete koristiti slike sa [Unsplash](https://unsplash.com/)

---

### Zadatak 4: Custom Font (Srednje)
Dodajte custom Google Font:
- [ ] Instalirajte i koristite "Poppins" font
- [ ] Primenite ga na naslove (`<h1>`, `<h2>`, `<h3>`)
- [ ] Zadržite Inter za paragraf tekst

**Fajlovi za izmenu:**
- `app/layout.js`
- `app/globals.css`

---

### Zadatak 5: Breadcrumbs (Srednje)
Implementirajte breadcrumb navigaciju:
- [ ] Napravite `components/Breadcrumbs.js`
- [ ] Prikažite na svim stranicama osim home
- [ ] Dodajte schema.org JSON-LD markup za SEO

**Primer:** Home > Blog > Moj Post

---

### Zadatak 6: Structured Data (Teško)
Dodajte JSON-LD structured data za blog post:
- [ ] Article schema (headline, datePublished, author)
- [ ] Image schema
- [ ] Publisher schema
- [ ] Testirajte sa [Google Rich Results Test](https://search.google.com/test/rich-results)

**Fajl za izmenu:** `app/blog/[slug]/page.js`

**Hint:** Koristite `<script type="application/ld+json">`

---

### Zadatak 7: Performance Audit (Teško)
Optimizujte performance početne stranice:
- [ ] Pokrenite Lighthouse audit
- [ ] Identifikujte probleme
- [ ] Popravite performance score na minimum 90
- [ ] Dokumentujte sve izmene

**Alati:**
- Chrome DevTools > Lighthouse
- [PageSpeed Insights](https://pagespeed.web.dev/)

---

### Bonus Zadatak: Dynamic Sitemap
Proširite sitemap da uključi sve blog postove:
- [ ] Učitajte sve postove iz `lib/data.js`
- [ ] Dodajte svaki post u sitemap
- [ ] Postavite `lastModified` datum
- [ ] Postavite `changeFrequency` i `priority`

**Fajl za izmenu:** `app/sitemap.js`

---

## Korisni Linkovi

- [Next.js Metadata Docs](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [next/image Docs](https://nextjs.org/docs/app/api-reference/components/image)
- [next/font Docs](https://nextjs.org/docs/app/api-reference/components/font)
- [Web.dev - Core Web Vitals](https://web.dev/vitals/)
- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)

---
