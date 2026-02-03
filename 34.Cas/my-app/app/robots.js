// ============================================
// ROBOTS.TXT - Konfiguracija za web crawlere
// ============================================
// Definise koje stranice pretrazivaci smeju da indeksiraju.
// Pristup: /robots.txt

/**
 * Generise robots.txt
 *
 * @returns {Object} Robots.txt konfiguracija
 */
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*', // Svi botovi
        allow: '/', // Dozvoli sve
        disallow: [
          '/api/', // Blokiraj API rute
          '/dashboard/', // Blokiraj dashboard (privatna zona)
          '/admin/', // Blokiraj admin panel
          '/unauthorized', // Blokiraj unauthorized stranicu
          '/_next/', // Blokiraj Next.js interne fajlove
        ],
      },
      {
        userAgent: 'Googlebot', // Specifična pravila za Google
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/'],
      },
      {
        userAgent: 'Googlebot-Image', // Google Images bot
        allow: ['/images/', '/public/'],
      },
    ],

    // Lokacija sitemap fajla
    sitemap: `${baseUrl}/sitemap.xml`,

    // Host (opciono, ali korisno za canonical URL)
    host: baseUrl,
  };
}
