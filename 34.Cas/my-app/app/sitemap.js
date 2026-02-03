// ============================================
// SITEMAP - Dinamicka XML mapa sajta
// ============================================
// Next.js automatski generise sitemap.xml na osnovu ove funkcije.
// Ukljucuje sve staticke stranice i dinamicki generise URL-ove
// za sve blog postove iz MongoDB baze.

import dbConnect from '@/lib/db/mongoose';
import Post from '@/lib/models/Post';

/**
 * Generise sitemap.xml
 * Pristup: /sitemap.xml
 *
 * @returns {Array} Lista URL-ova sa metadatama
 */
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Staticke stranice
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/o-nama`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dinamicke stranice - blog postovi
  let blogPostUrls = [];

  try {
    await dbConnect();

    const posts = await Post.find({ status: 'objavljen' })
      .select('slug datumObjave updatedAt')
      .lean();

    blogPostUrls = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.datumObjave || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Greska pri generisanju sitemap-a:', error);
  }

  // Kategorije
  const kategorije = ['tehnologija', 'programiranje', 'web-razvoj', 'novosti', 'tutorial'];
  const categoryUrls = kategorije.map((kat) => ({
    url: `${baseUrl}/blog?kategorija=${kat}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  return [...staticPages, ...blogPostUrls, ...categoryUrls];
}
