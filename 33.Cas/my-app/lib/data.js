// ============================================
// MOCK DATA - Blog Postovi
// ============================================
// U pravoj aplikaciji, ovi podaci bi dolazili iz baze podataka

export const blogPosts = [
  {
    slug: 'uvod-u-nextjs',
    title: 'Uvod u Next.js - Kompletni Vodič za Početnike',
    excerpt: 'Naučite osnove Next.js frameworka, od instalacije do deployment-a. Savršen vodič za one koji počinju sa React full-stack razvojem.',
    content: `
      Next.js je React framework koji omogućava server-side rendering, static site generation,
      i mnoge druge napredne funkcionalnosti. U ovom vodiču ćemo proći kroz osnovne koncepte
      i naučiti kako da kreiramo modernu web aplikaciju.

      ## Zašto Next.js?

      Next.js rešava mnoge probleme koje standardni React ima:
      - SEO optimizacija kroz SSR
      - Automatski code splitting
      - File-based routing
      - Image optimization
      - I još mnogo toga!

      ## Kako početi?

      Instalacija je jednostavna:
      \`\`\`bash
      npx create-next-app@latest my-app
      cd my-app
      npm run dev
      \`\`\`

      I to je to! Vaša aplikacija je pokrenuta na http://localhost:3000
    `,
    image: '/images/blog/post-1.jpg',
    author: 'Marko Marković',
    date: '2025-01-15',
    readTime: '5 min',
    category: 'Tutorial'
  },
  {
    slug: 'seo-best-practices',
    title: 'SEO Best Practices za Next.js Aplikacije',
    excerpt: 'Otkrijte najvažnije SEO tehnike za Next.js: metadata API, structured data, sitemap generacija i optimizacija performansi.',
    content: `
      SEO (Search Engine Optimization) je kritičan za uspeh svake web aplikacije.
      Next.js pruža odlične alate za SEO optimizaciju.

      ## Metadata API

      Next.js 13+ uvodi novi Metadata API koji zamenjuje stari Head komponentu:

      \`\`\`js
      export const metadata = {
        title: 'Moja Stranica',
        description: 'Opis stranice'
      }
      \`\`\`

      ## Open Graph

      Ne zaboravite Open Graph tagove za društvene mreže:

      \`\`\`js
      export const metadata = {
        openGraph: {
          title: 'Naslov',
          description: 'Opis',
          images: ['/og-image.jpg']
        }
      }
      \`\`\`

      ## Sitemap

      Generisite sitemap.xml dinamički:

      \`\`\`js
      export default function sitemap() {
        return [
          {
            url: 'https://example.com',
            lastModified: new Date()
          }
        ]
      }
      \`\`\`
    `,
    image: '/images/blog/post-2.jpg',
    author: 'Ana Anić',
    date: '2025-01-20',
    readTime: '8 min',
    category: 'SEO'
  },
  {
    slug: 'image-optimization-nextjs',
    title: 'Optimizacija Slika u Next.js - Kompletni Vodič',
    excerpt: 'Naučite kako da optimizujete slike u Next.js aplikacijama koristeći next/image komponentu za najbolje performanse.',
    content: `
      Slike često čine najveći deo bundle-a web aplikacije. Next.js Image komponenta
      automatski optimizuje slike i poboljšava performanse.

      ## Problem sa Normalnim <img> Tagom

      Normalan HTML img tag ima nekoliko problema:
      - Učitava punu rezoluciju slike
      - Nema lazy loading
      - Nema responsive images
      - Nema modernih formata (WebP, AVIF)

      ## Next.js <Image> Komponenta

      Next.js Image komponenta rešava sve ove probleme:

      \`\`\`jsx
      import Image from 'next/image'

      <Image
        src="/hero.jpg"
        alt="Hero slika"
        width={800}
        height={600}
        priority
      />
      \`\`\`

      ## Šta Next.js Radi Automatski?

      1. Generiše više verzija slike (responsive)
      2. Lazy loading (osim ako ne stavite priority)
      3. Konvertuje u WebP/AVIF
      4. Placeholder blur efekat
      5. Sprečava CLS (Cumulative Layout Shift)

      ## Best Practices

      - Koristite \`priority\` za hero slike
      - Dodajte \`alt\` tekst uvek
      - Definišite \`width\` i \`height\`
      - Koristite \`fill\` za background slike
    `,
    image: '/images/blog/post-3.jpg',
    author: 'Petar Petrović',
    date: '2025-01-25',
    readTime: '6 min',
    category: 'Performance'
  },
  {
    slug: 'core-web-vitals',
    title: 'Core Web Vitals - Merenje Performansi Web Aplikacija',
    excerpt: 'Razumite LCP, FID i CLS metrike i naučite kako da optimizujete performanse vaše Next.js aplikacije.',
    content: `
      Google koristi Core Web Vitals kao deo svog ranking algoritma.
      Važno je razumeti ove metrike i optimizovati ih.

      ## Tri Ključne Metrike

      ### 1. LCP (Largest Contentful Paint)
      - Meri vreme učitavanja glavnog sadržaja
      - Cilj: < 2.5 sekundi
      - Kako poboljšati: optimizujte slike, koristite CDN

      ### 2. FID (First Input Delay)
      - Meri interaktivnost stranice
      - Cilj: < 100ms
      - Kako poboljšati: smanjite JavaScript, koristite code splitting

      ### 3. CLS (Cumulative Layout Shift)
      - Meri vizuelnu stabilnost
      - Cilj: < 0.1
      - Kako poboljšati: definišite dimenzije slika, rezervišite prostor

      ## Testiranje

      Koristite Chrome DevTools Lighthouse ili PageSpeed Insights:

      \`\`\`bash
      # DevTools > Lighthouse > Generate Report
      \`\`\`

      ## Optimizacija u Next.js

      Next.js automatski pomaže sa svim ovim metrikama kroz:
      - Automatic code splitting
      - Image optimization
      - Font optimization
      - Prefetching
    `,
    image: '/images/blog/post-1.jpg',
    author: 'Jelena Jovanović',
    date: '2025-01-28',
    readTime: '7 min',
    category: 'Performance'
  }
]

// ============================================
// HELPER FUNKCIJE
// ============================================

/**
 * Vraća sve blog postove
 * @returns {Array} Svi blog postovi
 */
export function getAllPosts() {
  return blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Vraća blog post po slug-u
 * @param {string} slug - Jedinstveni identifikator posta
 * @returns {Object|undefined} Blog post ili undefined ako ne postoji
 */
export function getPost(slug) {
  return blogPosts.find(post => post.slug === slug)
}

/**
 * Vraća sledeća 3 posta (za "Related Posts" sekciju)
 * @param {string} currentSlug - Slug trenutnog posta
 * @returns {Array} Niz od max 3 posta
 */
export function getRelatedPosts(currentSlug) {
  return blogPosts
    .filter(post => post.slug !== currentSlug)
    .slice(0, 3)
}

/**
 * Vraća sve kategorije
 * @returns {Array} Jedinstvene kategorije
 */
export function getCategories() {
  const categories = blogPosts.map(post => post.category)
  return [...new Set(categories)]
}

/**
 * Vraća postove po kategoriji
 * @param {string} category - Naziv kategorije
 * @returns {Array} Blog postovi iz te kategorije
 */
export function getPostsByCategory(category) {
  return blogPosts.filter(post => post.category === category)
}
