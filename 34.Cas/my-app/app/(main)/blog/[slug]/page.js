// ============================================
// BLOG POST PAGE - Pojedinacni post (SSG)
// ============================================
// Koristi Static Site Generation (SSG) sa generateStaticParams
// za pre-renderovanje svih postova u build time.
// Demonstrira dynamic metadata i JSON-LD structured data.

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dbConnect from '@/lib/db/mongoose';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User'; // Potrebno za populate('autor')
import Komentar from '@/lib/models/Komentar';

// ============================================
// GENERATE STATIC PARAMS (SSG)
// ============================================
// Ova funkcija generise sve moguce slug-ove u build time.
// Next.js ce pre-renderovati stranicu za svaki slug.

export async function generateStaticParams() {
  try {
    await dbConnect();
    const postovi = await Post.find({ status: 'objavljen' }).select('slug').lean();

    return postovi.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Greska pri generisanju static params:', error);
    return [];
  }
}

// ============================================
// DYNAMIC METADATA
// ============================================
// Generise SEO metadata dinamicki na osnovu sadrzaja posta.

export async function generateMetadata({ params }) {
  try {
    await dbConnect();
    const { slug } = await params;
    const post = await Post.findOne({ slug, status: 'objavljen' })
      .populate('autor', 'ime')
      .lean();

    if (!post) {
      return {
        title: 'Post nije pronadjen',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return {
      title: post.naslov,
      description: post.izvod,
      keywords: [post.kategorija, ...post.tagovi],
      authors: [{ name: post.autor?.ime }],

      openGraph: {
        title: post.naslov,
        description: post.izvod,
        type: 'article',
        publishedTime: post.datumObjave,
        modifiedTime: post.updatedAt,
        authors: [post.autor?.ime],
        tags: post.tagovi,
        images: [
          {
            url: post.slika?.startsWith('http') ? post.slika : `${baseUrl}${post.slika}`,
            width: 1200,
            height: 630,
            alt: post.naslov,
          },
        ],
      },

      twitter: {
        card: 'summary_large_image',
        title: post.naslov,
        description: post.izvod,
        images: [post.slika?.startsWith('http') ? post.slika : `${baseUrl}${post.slika}`],
      },
    };
  } catch (error) {
    return { title: 'Blog Post' };
  }
}

// ============================================
// DATA FETCHING
// ============================================
async function getPost(slug) {
  try {
    await dbConnect();

    const post = await Post.findOne({ slug, status: 'objavljen' })
      .populate('autor', 'ime slika biografija')
      .lean();

    if (!post) return null;

    // Povecaj broj pregleda (ne cekamo na ovo)
    Post.findByIdAndUpdate(post._id, { $inc: { brojPregleda: 1 } }).exec();

    return JSON.parse(JSON.stringify(post));
  } catch (error) {
    console.error('Greska pri dohvatanju posta:', error);
    return null;
  }
}

async function getKomentari(postId) {
  try {
    await dbConnect();

    const komentari = await Komentar.find({
      post: postId,
      odobren: true,
      roditeljKomentar: null,
    })
      .populate('autor', 'ime slika')
      .populate({
        path: 'odgovori',
        match: { odobren: true },
        populate: { path: 'autor', select: 'ime slika' },
      })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(komentari));
  } catch (error) {
    console.error('Greska pri dohvatanju komentara:', error);
    return [];
  }
}

async function getSlicniPostovi(kategorija, currentSlug) {
  try {
    await dbConnect();

    const postovi = await Post.find({
      status: 'objavljen',
      kategorija,
      slug: { $ne: currentSlug },
    })
      .populate('autor', 'ime slika')
      .sort({ datumObjave: -1 })
      .limit(3)
      .lean();

    return JSON.parse(JSON.stringify(postovi));
  } catch (error) {
    return [];
  }
}

// ============================================
// PAGE KOMPONENTA
// ============================================
export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const [komentari, slicniPostovi] = await Promise.all([
    getKomentari(post._id),
    getSlicniPostovi(post.kategorija, slug),
  ]);

  // Formatiranje datuma
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.naslov,
    description: post.izvod,
    image: post.slika,
    datePublished: post.datumObjave,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.autor?.ime,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BlogMaster',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog/${slug}`,
    },
  };

  return (
    <article className="min-h-screen bg-gray-50">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero slika */}
      <div className="relative h-[50vh] min-h-100 bg-gray-900">
        <Image
          src={post.slika || '/images/default-post.jpg'}
          alt={post.naslov}
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 text-center text-white">
            {/* Kategorija */}
            <Link
              href={`/blog?kategorija=${post.kategorija}`}
              className="inline-block px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full mb-4 hover:bg-blue-700 transition-colors"
            >
              {post.kategorija}
            </Link>

            {/* Naslov */}
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {post.naslov}
            </h1>

            {/* Meta info */}
            <div className="flex items-center justify-center space-x-4 text-gray-300">
              <span>{formatDate(post.datumObjave)}</span>
              <span>•</span>
              <span>{post.vremeZaCitanje}</span>
              <span>•</span>
              <span>{post.brojPregleda} pregleda</span>
            </div>
          </div>
        </div>
      </div>

      {/* Glavni sadrzaj */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Autor box */}
        <div className="flex items-center mb-8 p-4 bg-white rounded-lg shadow-sm">
          {post.autor?.slika ? (
            <img
              src={post.autor.slika}
              alt={post.autor.ime}
              className="w-16 h-16 rounded-full mr-4"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl mr-4">
              {post.autor?.ime?.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{post.autor?.ime}</p>
            {post.autor?.biografija && (
              <p className="text-sm text-gray-600">{post.autor.biografija}</p>
            )}
          </div>
        </div>

        {/* Izvod */}
        <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <p className="text-lg text-gray-700 italic">{post.izvod}</p>
        </div>

        {/* Sadrzaj */}
        <div
          className="prose prose-lg prose-gray max-w-none mb-12 prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800 prose-a:text-blue-600 prose-code:text-gray-900 prose-pre:bg-gray-900"
          dangerouslySetInnerHTML={{ __html: post.sadrzaj }}
        />

        {/* Tagovi */}
        {post.tagovi && post.tagovi.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tagovi.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Share dugmad */}
        <div className="flex items-center space-x-4 py-6 border-t border-b border-gray-200 mb-12">
          <span className="text-gray-600 font-medium">Podeli:</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.naslov)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/blog/${slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Podeli na Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/blog/${slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Podeli na Facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/blog/${slug}`)}&title=${encodeURIComponent(post.naslov)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Podeli na LinkedIn"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>

        {/* Komentari sekcija */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Komentari ({komentari.length})
          </h2>

          {komentari.length > 0 ? (
            <div className="space-y-6">
              {komentari.map((komentar) => (
                <div key={komentar._id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-start space-x-4">
                    {komentar.autor?.slika ? (
                      <img
                        src={komentar.autor.slika}
                        alt={komentar.autor.ime}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {komentar.autor?.ime?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {komentar.autor?.ime}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(komentar.createdAt)}
                        </span>
                        {komentar.editovan && (
                          <span className="text-xs text-gray-400">(izmenjen)</span>
                        )}
                      </div>
                      <p className="text-gray-700">{komentar.sadrzaj}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 bg-white rounded-lg">
              Nema komentara. Budite prvi koji ce komentarisati!
            </p>
          )}

          <p className="mt-6 text-center text-gray-600">
            <Link href="/login" className="text-blue-600 hover:underline">
              Prijavite se
            </Link>{' '}
            da biste ostavili komentar.
          </p>
        </section>

        {/* Slicni postovi */}
        {slicniPostovi.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Slicni postovi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {slicniPostovi.map((slican) => (
                <Link
                  key={slican._id}
                  href={`/blog/${slican.slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40">
                    <Image
                      src={slican.slika || '/images/default-post.jpg'}
                      alt={slican.naslov}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {slican.naslov}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(slican.datumObjave)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
