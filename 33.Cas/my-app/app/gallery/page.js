// ============================================
// GALERIJA STRANICA
// ============================================
// Demonstracija Image Optimization sa next/image

import Image from 'next/image'
import styles from './page.module.css'

// METADATA
export const metadata = {
  title: 'Galerija - Image Optimization Demo',
  description: 'Demonstracija kako Next.js optimizuje slike automatski koristeći next/image komponentu',
  keywords: ['image optimization', 'next.js', 'performance', 'web vitals']
}

// Mock galerija slika
// U pravoj aplikaciji, ovo bi dolazilo iz baze ili API-ja
const galleryImages = [
  {
    id: 1,
    src: '/images/blog/post-1.jpg',
    alt: 'Next.js Tutorial',
    title: 'Next.js Tutorial',
    width: 800,
    height: 600
  },
  {
    id: 2,
    src: '/images/blog/post-2.jpg',
    alt: 'SEO Best Practices',
    title: 'SEO Best Practices',
    width: 800,
    height: 600
  },
  {
    id: 3,
    src: '/images/blog/post-3.jpg',
    alt: 'Image Optimization',
    title: 'Image Optimization',
    width: 800,
    height: 600
  }
]

export default function Gallery() {
  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Galerija Slika</h1>
        <p>Demonstracija Image Optimization sa Next.js</p>
      </header>

      {/* Uporedni prikaz */}
      <section className={styles.comparison}>
        <h2>Uporedni Prikaz</h2>
        <p className={styles.explanation}>
          Uporedite razliku između običnog <code>&lt;img&gt;</code> taga i Next.js <code>&lt;Image /&gt;</code> komponente
        </p>

        <div className={styles.compareGrid}>
          {/* BAD: Obična img tag */}
          <div className={styles.compareCard}>
            <div className={styles.badge} style={{ background: '#e74c3c' }}>
              BAD
            </div>
            <h3>Običan &lt;img&gt; Tag</h3>
            <div className={styles.imageWrapper}>
              <img
                src="/images/blog/post-1.jpg"
                alt="Regular img tag"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <ul className={styles.issues}>
              <li>Učitava punu rezoluciju (može biti 5MB+)</li>
              <li>Nema lazy loading</li>
              <li>Nema responsive images</li>
              <li>Nema WebP/AVIF konverzije</li>
              <li>Može izazvati CLS (layout shift)</li>
            </ul>
          </div>

          {/* GOOD: Next.js Image komponenta */}
          <div className={styles.compareCard}>
            <div className={styles.badge} style={{ background: '#27ae60' }}>
              GOOD
            </div>
            <h3>Next.js &lt;Image /&gt;</h3>
            <div className={styles.imageWrapper}>
              <Image
                src="/images/blog/post-1.jpg"
                alt="Next.js Image component"
                width={800}
                height={600}
                style={{ width: '100%', height: 'auto' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <ul className={styles.benefits}>
              <li>Automatska optimizacija veličine</li>
              <li>Lazy loading (podrazumevano)</li>
              <li>Responsive images (srcset)</li>
              <li>WebP/AVIF format automatski</li>
              <li>Sprečava CLS sa width/height</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Galerija Grid */}
      <section className={styles.gallerySection}>
        <h2>Galerija sa Optimizovanim Slikama</h2>
        <p className={styles.explanation}>
          Sve slike u ovoj galeriji koriste Next.js Image komponentu i automatski se optimizuju
        </p>

        <div className={styles.gallery}>
          {galleryImages.map((image, index) => (
            <div key={image.id} className={styles.galleryItem}>
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                style={{ width: '100%', height: 'auto' }}
                // Prva slika: priority (učitaj odmah)
                // Ostale: lazy load (podrazumevano)
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className={styles.overlay}>
                <p>{image.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fill prop demo */}
      <section className={styles.fillDemo}>
        <h2>Fill Prop Demo</h2>
        <p className={styles.explanation}>
          Kada ne znate tačne dimenzije, koristite <code>fill</code> prop
        </p>

        <div className={styles.fillGrid}>
          {/* Square */}
          <div className={styles.fillItem}>
            <h3>Square (1:1)</h3>
            <div className={styles.fillContainer} style={{ aspectRatio: '1/1' }}>
              <Image
                src="/images/blog/post-1.jpg"
                alt="Square example"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>

          {/* Wide */}
          <div className={styles.fillItem}>
            <h3>Wide (16:9)</h3>
            <div className={styles.fillContainer} style={{ aspectRatio: '16/9' }}>
              <Image
                src="/images/blog/post-2.jpg"
                alt="Wide example"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>

          {/* Tall */}
          <div className={styles.fillItem}>
            <h3>Tall (9:16)</h3>
            <div className={styles.fillContainer} style={{ aspectRatio: '9/16' }}>
              <Image
                src="/images/blog/post-3.jpg"
                alt="Tall example"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className={styles.bestPractices}>
        <h2>Best Practices</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>⚡</span>
            <h3>Koristite priority za hero slike</h3>
            <p>Slike "above the fold" treba da imaju <code>priority</code> prop</p>
          </div>

          <div className={styles.tip}>
            <span className={styles.tipIcon}>📏</span>
            <h3>Definisite width i height</h3>
            <p>Ovo sprečava CLS (Cumulative Layout Shift)</p>
          </div>

          <div className={styles.tip}>
            <span className={styles.tipIcon}>♿</span>
            <h3>UVEK dodajte alt tekst</h3>
            <p>Važno za pristupačnost i SEO</p>
          </div>

          <div className={styles.tip}>
            <span className={styles.tipIcon}>🎯</span>
            <h3>Koristite sizes prop</h3>
            <p>Definiše koja veličina slike se učitava za različite viewport-e</p>
          </div>
        </div>
      </section>

      {/* DevTools tip */}
      <aside className={styles.devToolsTip}>
        <h3>Testirajte u Chrome DevTools</h3>
        <ol>
          <li>Otvorite DevTools (F12)</li>
          <li>Idite na Network tab</li>
          <li>Refresh stranicu</li>
          <li>Kliknite na bilo koju sliku</li>
          <li>Videćete da Next.js automatski generiše WebP verziju!</li>
        </ol>
      </aside>
    </main>
  )
}
