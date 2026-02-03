// ============================================
// FOOTER - Podnozje stranice
// ============================================

import Link from 'next/link';

/**
 * Footer komponenta
 * Prikazuje linkove, kontakt informacije i copyright
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brend */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold text-blue-400">Blog</span>
              <span className="text-2xl font-bold text-white">Master</span>
            </Link>
            <p className="text-gray-400 max-w-md">
              BlogMaster je full-stack Next.js aplikacija koja demonstrira
              moderne web development tehnike ukljucujuci Server Actions,
              NextAuth autentifikaciju i MongoDB integraciju.
            </p>
          </div>

          {/* Brzi linkovi */}
          <div>
            <h3 className="text-white font-semibold mb-4">Brzi linkovi</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Pocetna
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-blue-400 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Kategorije */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kategorije</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog?kategorija=tehnologija" className="hover:text-blue-400 transition-colors">
                  Tehnologija
                </Link>
              </li>
              <li>
                <Link href="/blog?kategorija=programiranje" className="hover:text-blue-400 transition-colors">
                  Programiranje
                </Link>
              </li>
              <li>
                <Link href="/blog?kategorija=web-razvoj" className="hover:text-blue-400 transition-colors">
                  Web razvoj
                </Link>
              </li>
              <li>
                <Link href="/blog?kategorija=tutorial" className="hover:text-blue-400 transition-colors">
                  Tutorijali
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Donja linija */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} BlogMaster. Sva prava zadrzana.
          </p>
          <p className="text-gray-500 text-sm mt-2 md:mt-0">
            Napravljeno sa Next.js, MongoDB i NextAuth
          </p>
        </div>
      </div>
    </footer>
  );
}
