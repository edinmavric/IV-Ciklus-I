# 🚀 UPUTSTVA ZA ČAS 33 - Performance, SEO & Optimization

## 📦 Pre Časa - Priprema

### 1. Instalirajte Zavisnosti

```bash
cd 33.Cas/my-app
npm install
```

### 2. Dodajte Slike (VAŽNO!)

Preuzmite slike sa [Unsplash](https://unsplash.com/) i stavite ih u:

```
public/
├── images/
│   ├── blog/
│   │   ├── post-1.jpg (800x600px)
│   │   ├── post-2.jpg (800x600px)
│   │   └── post-3.jpg (800x600px)
│   └── og-image.jpg (1200x630px)
```

**Pretraži na Unsplash:**
- "coding laptop"
- "programming"
- "web development"

**ALTERNATIVA:** Aplikacija će raditi i bez slika (gray background), ali slike poboljšavaju prezentaciju!

### 3. Pokrenite Development Server

```bash
npm run dev
```

Otvorite: http://localhost:3000

---

## 📚 Struktura Časa

### 1. README.md
- Pregled časa
- Zadaci za studente
- Korisni linkovi

### 2. SKRIPTA.md
- **KOMPLETNA SKRIPTA ZA PREDAVAČA**
- Korak-po-korak scenario
- Live coding primeri
- Q&A sekcija
- Timing tips

### 3. Projekat (my-app/)
- Funkcionalna Next.js aplikacija
- Svi primeri iz časa
- Blog sa dynamic metadata
- Image optimization demo
- Sitemap i robots.txt

---

## 🎯 Šta Projekat Demonstrira?

### ✅ SEO Optimization
- **Static Metadata** - [app/about/page.js](my-app/app/about/page.js)
- **Dynamic Metadata** - [app/blog/[slug]/page.js](my-app/app/blog/[slug]/page.js)
- **Open Graph Tags** - Svi page.js fajlovi
- **Twitter Cards** - Blog postovi
- **Structured Data (JSON-LD)** - Homepage i blog

### ✅ Image Optimization
- **next/image Komponenta** - [app/gallery/page.js](my-app/app/gallery/page.js)
- **priority Prop** - Hero slike
- **lazy Loading** - Sve ostale slike
- **fill Prop** - Gallery primeri
- **Responsive Images** - sizes prop

### ✅ Font Optimization
- **next/font/google** - [app/layout.js](my-app/app/layout.js)
- **Inter** - Glavni font
- **Roboto Mono** - Code font
- **CSS Variables** - [app/globals.css](my-app/app/globals.css)

### ✅ Sitemap & Robots
- **sitemap.xml** - [app/sitemap.js](my-app/app/sitemap.js)
- **robots.txt** - [app/robots.js](my-app/app/robots.js)

---

## 🔍 Testiranje

### 1. Testirajte Sitemap i Robots

```
http://localhost:3000/sitemap.xml
http://localhost:3000/robots.txt
```

### 2. Testirajte Meta Tagove

```bash
# View Page Source na bilo kojoj stranici
# Desni klik > View Page Source
# Tražite <meta> tagove u <head> sekciji
```

### 3. Testirajte Image Optimization

```
1. Otvorite Chrome DevTools (F12)
2. Network tab
3. Refresh stranicu
4. Kliknite na bilo koju sliku
5. Videćete WebP format i optimizovanu veličinu!
```

### 4. Lighthouse Audit

```
1. Chrome DevTools > Lighthouse tab
2. Kliknite "Generate report"
3. Čekajte rezultate
4. Cilj: 90+ u svim kategorijama!
```

### 5. Testirajte Open Graph

- Deploy na Vercel (besplatno)
- Koristite [OpenGraph.xyz](https://www.opengraph.xyz/)
- Unesi deployed URL

---

## 💡 Tipični Problemi i Rešenja

### Problem 1: Slike ne učitavaju
```
Error: Invalid src prop on `next/image`
```
**Rešenje:** Proverite da li postoji fajl u `public/images/`

### Problem 2: Font se ne primenjuje
```
Font se ne vidi u browser-u
```
**Rešenje:** Proverite da li je `className` primenjen na `<html>` u layout.js

### Problem 3: Sitemap vraća 404
```
404 Not Found
```
**Rešenje:** Fajl mora biti `app/sitemap.js` (ne `app/sitemap.xml`)

### Problem 4: Metadata se ne pojavljuje
```
Meta tagovi nisu u <head>
```
**Rešenje:**
- Proverite da li je `export const metadata = {...}`
- Ne `export default metadata`!

---

## 🎓 Zadaci za Studente

Svi zadaci su detaljno opisani u [README.md](README.md):

1. **Zadatak 1** (Lako) - Meta tagovi
2. **Zadatak 2** (Lako) - Open Graph slika
3. **Zadatak 3** (Srednje) - Image Gallery
4. **Zadatak 4** (Srednje) - Custom Font
5. **Zadatak 5** (Srednje) - Breadcrumbs
6. **Zadatak 6** (Teško) - Structured Data
7. **Zadatak 7** (Teško) - Performance Audit
8. **Bonus** - Dynamic Sitemap

---

## 🔗 Dodatni Resursi

### Dokumentacija:
- [Next.js Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [next/image](https://nextjs.org/docs/app/api-reference/components/image)
- [next/font](https://nextjs.org/docs/app/api-reference/components/font)

### Alati:
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [OpenGraph.xyz](https://www.opengraph.xyz/)
- [Web.dev - Core Web Vitals](https://web.dev/vitals/)

### Schema.org:
- [Article Schema](https://schema.org/Article)
- [Organization Schema](https://schema.org/Organization)
- [WebSite Schema](https://schema.org/WebSite)

---
