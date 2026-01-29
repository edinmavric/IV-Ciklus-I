// ============================================
// BLOG LISTA STRANICA
// ============================================
// Prikazuje sve blog postove sa link-ovima

import Link from 'next/link'
import { getAllPosts, getCategories } from '@/lib/data'
import styles from './page.module.css'

// STATIC METADATA
export const metadata = {
  title: 'Blog - Naučite Next.js',
  description: 'Čitajte naše najnovije blog postove o Next.js, React, SEO optimizaciji i web development-u.',
  keywords: ['next.js', 'react', 'blog', 'tutorial', 'web development'],
  openGraph: {
    title: 'Blog - Naučite Next.js',
    description: 'Najnoviji blog postovi o Next.js i React razvoju',
    type: 'website'
  }
}

export default function Blog() {
  const posts = getAllPosts()
  const categories = getCategories()

  return (
    <main className={styles.main}>
      {/* Header sekcija */}
      <header className={styles.header}>
        <h1>Blog</h1>
        <p>Naučite Next.js kroz praktične članke i tutorijale</p>
      </header>

      {/* Kategorije */}
      <div className={styles.categories}>
        <strong>Kategorije:</strong>
        {categories.map(category => (
          <span key={category} className={styles.category}>
            {category}
          </span>
        ))}
      </div>

      {/* Lista blog postova */}
      <div className={styles.grid}>
        {posts.map(post => (
          <article key={post.slug} className={styles.card}>
            {/* Thumbnail slika */}
            <div className={styles.thumbnail}>
              <img src={post.image} alt={post.title} />
            </div>

            {/* Sadržaj */}
            <div className={styles.content}>
              {/* Kategorija badge */}
              <span className={styles.badge}>{post.category}</span>

              {/* Naslov */}
              <h2>
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>

              {/* Excerpt */}
              <p className={styles.excerpt}>{post.excerpt}</p>

              {/* Meta informacije */}
              <div className={styles.meta}>
                <span>{post.author}</span>
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>

              {/* Pročitaj više link */}
              <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                Pročitaj više
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* SEO - Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Next.js Blog',
            description: 'Blog o Next.js i React razvoju',
            blogPost: posts.map(post => ({
              '@type': 'BlogPosting',
              headline: post.title,
              datePublished: post.date,
              author: {
                '@type': 'Person',
                name: post.author
              }
            }))
          })
        }}
      />
    </main>
  )
}
