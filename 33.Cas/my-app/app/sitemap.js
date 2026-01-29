// ============================================
// SITEMAP.XML GENERATOR
// ============================================
// Next.js automatski generiše sitemap.xml iz ovog fajla
// Pristup: http://localhost:3000/sitemap.xml

import { getAllPosts } from '@/lib/data'

export default function sitemap() {
  const baseUrl = 'https://example.com'

  // Učitaj sve blog postove
  const posts = getAllPosts()

  // Generiši URL-ove za sve blog postove
  const blogPostUrls = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly',
    priority: 0.8
  }))

  // Statičke stranice
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0 // Najviši prioritet za homepage
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6
    }
  ]

  // Kombinuj sve URL-ove
  return [...staticPages, ...blogPostUrls]
}

/*
Rezultat sitemap.xml:

<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/blog</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ...
</urlset>

VAŽNO:
- Google koristi sitemap da crawluje vaše stranice
- lastModified govori kad je stranica poslednji put ažurirana
- priority govori relativnu važnost stranica (0.0 - 1.0)
- changeFrequency je hint za crawler-e (ne garancija)
*/
