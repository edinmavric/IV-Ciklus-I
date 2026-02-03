// ============================================
// BLOG LIST PAGE - Lista svih postova (ISR)
// ============================================
// Koristi Incremental Static Regeneration (ISR) za optimalno
// balansiranje izmedju performansi i svezine podataka.
// Stranica se revalidira svakih 60 sekundi.

import Link from 'next/link';
import dbConnect from '@/lib/db/mongoose';
import Post from '@/lib/models/Post';
import '@/lib/models/User'; // Potrebno za populate('autor')
import PostCard from '@/app/components/blog/PostCard';

// ============================================
// METADATA
// ============================================
export const metadata = {
  title: 'Blog',
  description: 'Procitajte najnovije clanke o tehnologiji, programiranju i web razvoju.',
  openGraph: {
    title: 'Blog | BlogMaster',
    description: 'Procitajte najnovije clanke o tehnologiji, programiranju i web razvoju.',
  },
};

// ============================================
// ISR KONFIGURACIJA
// ============================================
// revalidate: 60 znaci da ce se stranica regenerisati
// u pozadini najvise jednom u 60 sekundi
export const revalidate = 60;

// ============================================
// DATA FETCHING
// ============================================
async function getPostovi(searchParams) {
  try {
    await dbConnect();

    const page = parseInt(searchParams?.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;
    const kategorija = searchParams?.kategorija;
    const search = searchParams?.search;

    // Gradimo query
    let query = { status: 'objavljen' };

    if (kategorija) {
      query.kategorija = kategorija;
    }

    if (search) {
      query.$or = [
        { naslov: { $regex: search, $options: 'i' } },
        { izvod: { $regex: search, $options: 'i' } },
        { sadrzaj: { $regex: search, $options: 'i' } },
      ];
    }

    const [postovi, ukupno] = await Promise.all([
      Post.find(query)
        .populate('autor', 'ime slika')
        .sort({ datumObjave: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    return {
      postovi: JSON.parse(JSON.stringify(postovi)),
      ukupno,
      stranica: page,
      ukupnoStranica: Math.ceil(ukupno / limit),
    };
  } catch (error) {
    console.error('Greska pri dohvatanju postova:', error);
    return { postovi: [], ukupno: 0, stranica: 1, ukupnoStranica: 0 };
  }
}

// ============================================
// KATEGORIJE
// ============================================
const kategorije = [
  { slug: 'tehnologija', name: 'Tehnologija' },
  { slug: 'programiranje', name: 'Programiranje' },
  { slug: 'web-razvoj', name: 'Web Razvoj' },
  { slug: 'novosti', name: 'Novosti' },
  { slug: 'tutorial', name: 'Tutorial' },
];

// ============================================
// PAGE KOMPONENTA
// ============================================
export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const { postovi, ukupno, stranica, ukupnoStranica } = await getPostovi(params);
  const aktivnaKategorija = params?.kategorija;
  const searchQuery = params?.search;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {aktivnaKategorija
              ? kategorije.find((k) => k.slug === aktivnaKategorija)?.name || 'Blog'
              : searchQuery
              ? `Rezultati pretrage: "${searchQuery}"`
              : 'Blog'}
          </h1>
          <p className="text-xl text-gray-600">
            {ukupno} {ukupno === 1 ? 'post' : ukupno < 5 ? 'posta' : 'postova'}
          </p>
        </div>

        {/* Filteri */}
        <div className="mb-8">
          {/* Kategorije */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !aktivnaKategorija
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Sve
            </Link>
            {kategorije.map((kat) => (
              <Link
                key={kat.slug}
                href={`/blog?kategorija=${kat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  aktivnaKategorija === kat.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {kat.name}
              </Link>
            ))}
          </div>

          {/* Search forma */}
          <form action="/blog" method="GET" className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder="Pretrazite postove..."
                defaultValue={searchQuery}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
        </div>

        {/* Lista postova */}
        {postovi.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {postovi.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Paginacija */}
            {ukupnoStranica > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  {/* Prethodna */}
                  {stranica > 1 && (
                    <Link
                      href={`/blog?page=${stranica - 1}${aktivnaKategorija ? `&kategorija=${aktivnaKategorija}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Prethodna
                    </Link>
                  )}

                  {/* Brojevi stranica */}
                  {Array.from({ length: ukupnoStranica }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === ukupnoStranica || Math.abs(p - stranica) <= 1)
                    .map((p, i, arr) => (
                      <span key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && <span className="px-2">...</span>}
                        <Link
                          href={`/blog?page=${p}${aktivnaKategorija ? `&kategorija=${aktivnaKategorija}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                          className={`px-4 py-2 text-sm font-medium rounded-md ${
                            p === stranica
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </Link>
                      </span>
                    ))}

                  {/* Sledeca */}
                  {stranica < ukupnoStranica && (
                    <Link
                      href={`/blog?page=${stranica + 1}${aktivnaKategorija ? `&kategorija=${aktivnaKategorija}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Sledeca
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">Nema postova</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery
                ? `Nema rezultata za "${searchQuery}"`
                : aktivnaKategorija
                ? 'Nema postova u ovoj kategoriji'
                : 'Trenutno nema objavljenih postova.'}
            </p>
            {(searchQuery || aktivnaKategorija) && (
              <Link
                href="/blog"
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Pogledaj sve postove
              </Link>
            )}
          </div>
        )}

        {/* ISR info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Ova stranica koristi ISR (Incremental Static Regeneration).
            Podaci se osvezavaju svakih 60 sekundi.
          </p>
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'BlogMaster Blog',
            description: 'Blog o tehnologiji, programiranju i web razvoju',
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog`,
            blogPost: postovi.slice(0, 10).map((post) => ({
              '@type': 'BlogPosting',
              headline: post.naslov,
              description: post.izvod,
              datePublished: post.datumObjave,
              author: {
                '@type': 'Person',
                name: post.autor?.ime,
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog/${post.slug}`,
            })),
          }),
        }}
      />
    </div>
  );
}
