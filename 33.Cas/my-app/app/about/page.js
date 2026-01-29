// ============================================
// O NAMA STRANICA
// ============================================
// Primer SEO optimizovane statičke stranice

import styles from './page.module.css'

// STATIC METADATA
export const metadata = {
  title: 'O Nama - Naša Kompanija',
  description: 'Saznajte više o našoj kompaniji, našem timu i našoj misiji. Posvećeni smo kreiranju najboljih Next.js aplikacija.',
  keywords: ['o nama', 'kompanija', 'tim', 'next.js', 'web development'],

  // Open Graph
  openGraph: {
    title: 'O Nama - Naša Kompanija',
    description: 'Saznajte više o našoj kompaniji i timu',
    type: 'website',
    locale: 'sr_RS'
  },

  // Twitter Card
  twitter: {
    card: 'summary',
    title: 'O Nama - Naša Kompanija',
    description: 'Saznajte više o našoj kompaniji i timu'
  },

  // Alternativni jezici (ako imate multi-language sajt)
  alternates: {
    canonical: 'https://example.com/about',
    languages: {
      'en-US': 'https://example.com/en/about',
      'sr-RS': 'https://example.com/sr/about'
    }
  }
}

export default function About() {
  return (
    <main className={styles.main}>
      {/* Hero sekcija */}
      <section className={styles.hero}>
        <h1>O Nama</h1>
        <p className={styles.subtitle}>
          Posvećeni smo kreiranju brzih, pristupačnih i SEO optimizovanih web aplikacija
        </p>
      </section>

      {/* Naša misija */}
      <section className={styles.section}>
        <h2>Naša Misija</h2>
        <p>
          Naša misija je da pomognemo developerima da nauče Next.js i moderne web development
          prakse. Verujemo da svako može da nauči kako da kreira sjajne web aplikacije.
        </p>
        <p>
          Kroz naše blog postove, tutorijale i primere, delimo najbolje prakse i savete
          koje smo naučili kroz godine iskustva.
        </p>
      </section>

      {/* Tim */}
      <section className={styles.section}>
        <h2>Naš Tim</h2>
        <div className={styles.team}>
          {/* Team member 1 */}
          <div className={styles.member}>
            <div className={styles.avatar}>👨‍💻</div>
            <h3>Marko Marković</h3>
            <p className={styles.role}>Senior Developer</p>
            <p className={styles.bio}>
              10+ godina iskustva u React i Next.js development-u.
              Specijalizovan za performance optimizaciju.
            </p>
          </div>

          {/* Team member 2 */}
          <div className={styles.member}>
            <div className={styles.avatar}>👩‍💻</div>
            <h3>Ana Anić</h3>
            <p className={styles.role}>SEO Specialist</p>
            <p className={styles.bio}>
              Ekspert za SEO i web analytics. Pomaže kompanijama
              da postignu bolje rangiranje na Google-u.
            </p>
          </div>

          {/* Team member 3 */}
          <div className={styles.member}>
            <div className={styles.avatar}>👨‍🎨</div>
            <h3>Petar Petrović</h3>
            <p className={styles.role}>UI/UX Designer</p>
            <p className={styles.bio}>
              Dizajnira intuitivne i moderne korisničke interfejse
              koji su pristupačni svima.
            </p>
          </div>
        </div>
      </section>

      {/* Naše vrednosti */}
      <section className={styles.section}>
        <h2>Naše Vrednosti</h2>
        <div className={styles.values}>
          <div className={styles.value}>
            <span className={styles.icon}>⚡</span>
            <h3>Performance</h3>
            <p>Brze aplikacije su bolje korisničko iskustvo</p>
          </div>

          <div className={styles.value}>
            <span className={styles.icon}>♿</span>
            <h3>Accessibility</h3>
            <p>Web pristupačan svima, bez izuzetaka</p>
          </div>

          <div className={styles.value}>
            <span className={styles.icon}>🔍</span>
            <h3>SEO</h3>
            <p>Optimizacija za search engine-e</p>
          </div>

          <div className={styles.value}>
            <span className={styles.icon}>📚</span>
            <h3>Education</h3>
            <p>Delimo znanje sa zajednicom</p>
          </div>
        </div>
      </section>

      {/* Kontakt CTA */}
      <section className={styles.cta}>
        <h2>Zainteresovani za saradnju?</h2>
        <p>Kontaktirajte nas i razgovarajmo o vašem projektu</p>
        <a href="mailto:info@example.com" className={styles.button}>
          Kontaktiraj nas
        </a>
      </section>

      {/* SEO - Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Naša Kompanija',
            description: 'Next.js Development i SEO Consulting',
            url: 'https://example.com',
            logo: 'https://example.com/logo.png',
            sameAs: [
              'https://twitter.com/example',
              'https://linkedin.com/company/example'
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'info@example.com',
              contactType: 'Customer Service'
            }
          })
        }}
      />
    </main>
  )
}
