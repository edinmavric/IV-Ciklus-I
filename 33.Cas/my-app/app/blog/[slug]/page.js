// ============================================
// POJEDINAČAN BLOG POST STRANICA (DYNAMIC)
// ============================================
// Dinamička stranica koja se generiše za svaki blog post

import { getPost, getAllPosts, getRelatedPosts } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'

// DYNAMIC METADATA
// Ova funkcija se izvršava na serveru i generiše meta tagove
export async function generateMetadata({ params }) {
  const post = getPost(params.slug)

  // Ako post ne postoji, vraćamo generički metadata
  if (!post) {
    return {
      title: 'Post Not Found'
    }
  }

  // Generišemo meta tagove na osnovu posta
  return {
    title: `${post.title} | Blog`,
    description: post.excerpt,
    keywords: [post.category, 'next.js', 'tutorial', 'web development'],
    authors: [{ name: post.author }],

    // Open Graph meta tagovi (Facebook, LinkedIn)
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ]
    },

    // Twitter Card meta tagovi
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
      creator: `@${post.author.replace(' ', '').toLowerCase()}`
    }
  }
}

// GENERATE STATIC PARAMS
// Ova funkcija govori Next.js-u koji su sve parametri (slug-ovi)
// Tako Next.js može da pre-generiše sve stranice na build time (SSG)
export async function generateStaticParams() {
  const posts = getAllPosts()

  return posts.map(post => ({
    slug: post.slug
  }))
}

// KOMPONENTA
export default function BlogPost({ params }) {
  const post = getPost(params.slug)

  // Ako post ne postoji, prikaži 404
  if (!post) {
    notFound()
  }

  // Učitaj related posts
  const relatedPosts = getRelatedPosts(params.slug)

  // JSON-LD structured data za SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Next.js Blog'
    }
  }

  return (
    <>
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className={styles.article}>
        {/* Breadcrumbs za SEO */}
        <nav className={styles.breadcrumbs}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/blog">Blog</Link>
          <span>/</span>
          <span>{post.title}</span>
        </nav>

        {/* Header */}
        <header className={styles.header}>
          {/* Kategorija badge */}
          <span className={styles.category}>{post.category}</span>

          {/* Naslov */}
          <h1>{post.title}</h1>

          {/* Meta informacije */}
          <div className={styles.meta}>
            <span>{post.author}</span>
            <span>{new Date(post.date).toLocaleDateString('sr-RS')}</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        {/* Hero slika - OPTIMIZOVANA sa next/image */}
        <div className={styles.heroImage}>
          {/*
            NE KORISTITE: <img src={post.image} />
            KORISTITE: <Image /> za automatsku optimizaciju
          */}
          <Image
            src={post.image}
            alt={post.title}
            width={1200}
            height={600}
            priority // Učitaj odmah (jer je hero slika)
            style={{ width: '100%', height: 'auto' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* U pravoj aplikaciji, koristili biste markdown parser ili rich text editor */}
          <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <aside className={styles.related}>
            <h2>Povezani Članci</h2>
            <div className={styles.relatedGrid}>
              {relatedPosts.map(relatedPost => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className={styles.relatedCard}
                >
                  {/* Lazy load za related slike */}
                  <div className={styles.relatedThumbnail}>
                    <img src={relatedPost.image} alt={relatedPost.title} loading="lazy" />
                  </div>
                  <div className={styles.relatedContent}>
                    <h3>{relatedPost.title}</h3>
                    <p>{relatedPost.excerpt.substring(0, 100)}...</p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* Back to blog */}
        <div className={styles.backLink}>
          <Link href="/blog">Nazad na Blog</Link>
        </div>
      </article>
    </>
  )
}
