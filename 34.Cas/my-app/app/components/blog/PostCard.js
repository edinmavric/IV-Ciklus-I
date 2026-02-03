// ============================================
// POST CARD - Kartica za prikaz posta
// ============================================
// Koristi next/image za optimizovane slike

import Link from 'next/link';
import Image from 'next/image';

/**
 * PostCard komponenta
 * Prikazuje karticu posta u listi
 *
 * @param {Object} props
 * @param {Object} props.post - Post podaci
 * @param {boolean} props.featured - Da li je featured (veca kartica)
 */
export default function PostCard({ post, featured = false }) {
  // Formatiranje datuma na srpski
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Kategorija badge boje
  const categoryColors = {
    tehnologija: 'bg-blue-100 text-blue-800',
    programiranje: 'bg-green-100 text-green-800',
    'web-razvoj': 'bg-purple-100 text-purple-800',
    novosti: 'bg-yellow-100 text-yellow-800',
    tutorial: 'bg-pink-100 text-pink-800',
  };

  if (featured) {
    // Featured layout (velika kartica)
    return (
      <article className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <Link href={`/blog/${post.slug}`} className="block">
          <div className="md:flex">
            {/* Slika */}
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <Image
                src={post.slika || '/images/default-post.jpg'}
                alt={post.naslov}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {/* Istaknut badge */}
              {post.istaknut && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Istaknuto
                </div>
              )}
            </div>

            {/* Sadrzaj */}
            <div className="md:w-1/2 p-6 flex flex-col justify-center">
              {/* Kategorija */}
              <span className={`inline-block w-fit px-3 py-1 rounded-full text-xs font-medium mb-3 ${categoryColors[post.kategorija] || 'bg-gray-100 text-gray-800'}`}>
                {post.kategorija}
              </span>

              {/* Naslov */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {post.naslov}
              </h2>

              {/* Izvod */}
              <p className="text-gray-700 mb-4 line-clamp-3">
                {post.izvod}
              </p>

              {/* Meta info */}
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                {/* Autor */}
                <div className="flex items-center">
                  {post.autor?.slika ? (
                    <img
                      src={post.autor.slika}
                      alt={post.autor.ime}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                      {post.autor?.ime?.charAt(0)}
                    </div>
                  )}
                  <span>{post.autor?.ime}</span>
                </div>

                {/* Datum */}
                <span>{formatDate(post.datumObjave)}</span>

                {/* Vreme citanja */}
                <span>{post.vremeZaCitanje}</span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Standardna kartica
  return (
    <article className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Slika */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.slika || '/images/default-post.jpg'}
            alt={post.naslov}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Kategorija badge */}
          <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${categoryColors[post.kategorija] || 'bg-gray-100 text-gray-800'}`}>
            {post.kategorija}
          </span>
        </div>

        {/* Sadrzaj */}
        <div className="p-5">
          {/* Naslov */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.naslov}
          </h3>

          {/* Izvod */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {post.izvod}
          </p>

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              {post.autor?.slika ? (
                <img
                  src={post.autor.slika}
                  alt={post.autor.ime}
                  className="w-6 h-6 rounded-full mr-2"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">
                  {post.autor?.ime?.charAt(0)}
                </div>
              )}
              <span>{post.autor?.ime}</span>
            </div>

            <div className="flex items-center space-x-3">
              <span>{formatDate(post.datumObjave)}</span>
              <span>{post.vremeZaCitanje}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
