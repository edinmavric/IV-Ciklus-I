// ============================================
// HOME PAGE - SEO Optimized
// ============================================

import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/lib/data'
import styles from './page.module.css'

// METADATA
// Definiše se u layout.js, ali možemo ga override-ovati ovde
export const metadata = {
  title: 'Home - Next.js SEO & Performance Demo',
  description: 'Naučite kako da optimizujete Next.js aplikacije za SEO i performance. Kompletni vodič za Metadata API, Image Optimization i Core Web Vitals.'
}

export default function Home() {
  const latestPosts = getAllPosts().slice(0, 3)

  return (
    <main className={styles.main}>
      {/* Hero sekcija */}
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Next.js Performance & SEO Optimization
        </h1>
        <p className={styles.subtitle}>
          Naučite kako da kreirate brze, pristupačne i SEO optimizovane aplikacije
        </p>
        <div className={styles.ctas}>
          <Link href="/blog" className={styles.primaryBtn}>
            Čitaj Blog
          </Link>
          <Link href="/about" className={styles.secondaryBtn}>
            O Nama
          </Link>
        </div>
      </section>

      {/* Ključne funkcionalnosti */}
      <section className={styles.features}>
        <h2>Šta Učimo?</h2>
        <div className={styles.featureGrid}>
          {/* Feature 1 */}
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔍</div>
            <h3>SEO Optimization</h3>
            <p>
              Metadata API, Open Graph tagovi, structured data i sitemap generacija
              za najbolje rangiranje na Google-u.
            </p>
            <Link href="/blog/seo-best-practices">
              Saznaj više →
            </Link>
          </div>

          {/* Feature 2 */}
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🖼️</div>
            <h3>Image Optimization</h3>
            <p>
              Automatska optimizacija slika sa next/image: lazy loading, WebP format,
              responsive images i više.
            </p>
            <Link href="/gallery">
              Pogledaj Demo →
            </Link>
          </div>

          {/* Feature 3 */}
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔤</div>
            <h3>Font Optimization</h3>
            <p>
              Self-hosting Google Fonts sa next/font: zero layout shift,
              automatski subsetting i nema dodatnih network zahteva.
            </p>
            <Link href="/blog/uvod-u-nextjs">
              Pročitaj Članak →
            </Link>
          </div>

          {/* Feature 4 */}
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Core Web Vitals</h3>
            <p>
              Razumite LCP, FID i CLS metrike i naučite kako da optimizujete
              performance vaše aplikacije.
            </p>
            <Link href="/blog/core-web-vitals">
              Detaljnije →
            </Link>
          </div>
        </div>
      </section>

      {/* Najnoviji blog postovi */}
      <section className={styles.latestPosts}>
        <div className={styles.postsHeader}>
          <h2>📝 Najnoviji Članci</h2>
          <Link href="/blog" className={styles.viewAll}>
            Pogledaj sve →
          </Link>
        </div>

        <div className={styles.postsGrid}>
          {latestPosts.map(post => (
            <article key={post.slug} className={styles.postCard}>
              {/* Thumbnail */}
              <div className={styles.postThumbnail}>
                {/* Napomena: Koristimo obični img ovde za demonstraciju
                    U produkciji, koristite <Image /> */}
                <img src={post.image} alt={post.title} loading="lazy" />
              </div>

              {/* Content */}
              <div className={styles.postContent}>
                <span className={styles.postCategory}>{post.category}</span>
                <h3>
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                <p>{post.excerpt.substring(0, 120)}...</p>
                <div className={styles.postMeta}>
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Statistika */}
      <section className={styles.stats}>
        <h2>Zašto Next.js?</h2>
        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <div className={styles.statNumber}>100</div>
            <div className={styles.statLabel}>Lighthouse Score</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>90%</div>
            <div className={styles.statLabel}>Brže Učitavanje</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>3x</div>
            <div className={styles.statLabel}>Bolje SEO</div>
          </div>
        </div>
      </section>

      {/* CTA sekcija */}
      <section className={styles.cta}>
        <h2>Spremni za početak?</h2>
        <p>Započnite vaše Next.js putovanje danas</p>
        <div className={styles.ctaButtons}>
          <Link href="/blog" className={styles.ctaPrimary}>
            Počnite da Učite
          </Link>
          <Link href="/gallery" className={styles.ctaSecondary}>
            Pogledajte Demo
          </Link>
        </div>
      </section>

      {/* SEO - Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Next.js SEO & Performance Demo',
            description: 'Naučite SEO i Performance optimizaciju u Next.js',
            url: 'https://example.com',
            publisher: {
              '@type': 'Organization',
              name: 'Next.js Demo'
            }
          })
        }}
      />
    </main>
  )
}
