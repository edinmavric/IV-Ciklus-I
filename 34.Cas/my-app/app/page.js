// ============================================
// HOMEPAGE - Pocetna stranica
// ============================================
// Server komponenta koja prikazuje istaknute postove
// i uvod u BlogMaster aplikaciju.

import Link from 'next/link';
import dbConnect from '@/lib/db/mongoose';
import Post from '@/lib/models/Post';
import '@/lib/models/User'; // Potrebno za populate('autor')
import PostCard from './components/blog/PostCard';

// ============================================
// DATA FETCHING
// ============================================
// Dohvatamo istaknute i najnovije postove direktno u komponenti.
// Ovo je Server Component, tako da se fetch izvrsava na serveru.

async function getIstaknutiPostovi() {
  try {
    await dbConnect();
    const postovi = await Post.find({ status: 'objavljen', istaknut: true })
      .populate('autor', 'ime slika')
      .sort({ datumObjave: -1 })
      .limit(1)
      .lean();
    return JSON.parse(JSON.stringify(postovi));
  } catch (error) {
    console.error('Greska pri dohvatanju istaknutih postova:', error);
    return [];
  }
}

async function getNajnovijiPostovi() {
  try {
    await dbConnect();
    const postovi = await Post.find({ status: 'objavljen' })
      .populate('autor', 'ime slika')
      .sort({ datumObjave: -1 })
      .limit(6)
      .lean();
    return JSON.parse(JSON.stringify(postovi));
  } catch (error) {
    console.error('Greska pri dohvatanju najnovijih postova:', error);
    return [];
  }
}

// ============================================
// PAGE KOMPONENTA
// ============================================
export default async function HomePage() {
  const [istaknutiPostovi, najnovijiPostovi] = await Promise.all([
    getIstaknutiPostovi(),
    getNajnovijiPostovi(),
  ]);

  const istaknutiPost = istaknutiPostovi[0];

  return (
    <div className="min-h-screen">
      {/* Hero sekcija */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Dobrodosli na BlogMaster
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Full-stack Next.js blog aplikacija koja demonstrira moderne web
              development tehnike ukljucujuci MongoDB, NextAuth i Server Actions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Procitaj Blog
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors border border-blue-400"
              >
                Registruj se
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Istaknuti post */}
      {istaknutiPost && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Istaknuti Post
            </h2>
            <PostCard post={istaknutiPost} featured />
          </div>
        </section>
      )}

      {/* Najnoviji postovi */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Najnoviji Postovi
            </h2>
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              Svi postovi
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {najnovijiPostovi.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {najnovijiPostovi.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nema postova</h3>
              <p className="mt-2 text-gray-500">
                Budite prvi koji ce napisati post!
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Prijavite se da pisete
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Kategorije sekcija */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Istrazite Kategorije
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { slug: 'tehnologija', name: 'Tehnologija', icon: '💻', color: 'blue' },
              { slug: 'programiranje', name: 'Programiranje', icon: '👨‍💻', color: 'green' },
              { slug: 'web-razvoj', name: 'Web Razvoj', icon: '🌐', color: 'purple' },
              { slug: 'novosti', name: 'Novosti', icon: '📰', color: 'yellow' },
              { slug: 'tutorial', name: 'Tutorial', icon: '📚', color: 'pink' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog?kategorija=${cat.slug}`}
                className={`p-6 rounded-lg text-center hover:shadow-lg transition-shadow bg-${cat.color}-50 hover:bg-${cat.color}-100`}
              >
                <span className="text-4xl mb-2 block">{cat.icon}</span>
                <span className="font-medium text-gray-800">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tehnologije sekcija */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Tehnologije koje koristimo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl mb-3">⚛️</div>
              <h3 className="font-semibold text-lg">Next.js 15</h3>
              <p className="text-gray-400 text-sm mt-1">React framework sa App Router-om</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">🍃</div>
              <h3 className="font-semibold text-lg">MongoDB</h3>
              <p className="text-gray-400 text-sm mt-1">NoSQL baza podataka</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">🔐</div>
              <h3 className="font-semibold text-lg">NextAuth v5</h3>
              <p className="text-gray-400 text-sm mt-1">Autentifikacija i autorizacija</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-semibold text-lg">Tailwind CSS</h3>
              <p className="text-gray-400 text-sm mt-1">Utility-first CSS framework</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA sekcija */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Spremni da pocnete?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Registrujte se danas i pocnite da delite svoje znanje sa svetom.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Kreirajte nalog besplatno
          </Link>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'BlogMaster',
            description: 'Full-stack Next.js blog aplikacija sa MongoDB i NextAuth',
            url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            publisher: {
              '@type': 'Organization',
              name: 'BlogMaster',
            },
            potentialAction: {
              '@type': 'SearchAction',
              target: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog?search={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </div>
  );
}
