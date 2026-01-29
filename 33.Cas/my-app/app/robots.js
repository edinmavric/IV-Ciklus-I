// ============================================
// ROBOTS.TXT GENERATOR
// ============================================
// Next.js automatski generiše robots.txt iz ovog fajla
// Pristup: http://localhost:3000/robots.txt

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*', // Svi bots
        allow: '/', // Dozvoli sve stranice
        disallow: [
          '/api/', // Blokiraj API rute
          '/admin/', // Blokiraj admin panel (ako postoji)
          '/private/' // Blokiraj privatne stranice
        ]
      },
      {
        userAgent: 'Googlebot', // Specifično za Google
        allow: '/',
        disallow: ['/api/', '/admin/']
      },
      {
        userAgent: 'Googlebot-Image', // Google Images crawler
        allow: '/'
      }
    ],
    sitemap: 'https://example.com/sitemap.xml' // Link do sitemap-a
  }
}

/*
Rezultat robots.txt:

User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

User-Agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/

User-Agent: Googlebot-Image
Allow: /

Sitemap: https://example.com/sitemap.xml

VAŽNO:
- robots.txt govori crawler-ima koje stranice mogu da indexuju
- User-Agent: * znači svi bots
- Allow: / znači sve stranice su dozvoljene
- Disallow: /api/ znači API rute su blokirane
- Sitemap link pomaže crawler-ima da pronađu sve stranice
*/
