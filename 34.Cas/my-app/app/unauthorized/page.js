// ============================================
// UNAUTHORIZED PAGE - Neovlascen pristup
// ============================================

import Link from 'next/link';

export const metadata = {
  title: 'Neovlascen pristup',
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center">
        {/* Ikonica */}
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Naslov */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Neovlascen pristup
        </h1>

        {/* Opis */}
        <p className="text-gray-600 mb-8">
          Nemate dozvolu za pristup ovoj stranici.
          Ova stranica je dostupna samo korisnicima sa odgovarajucim pravima.
        </p>

        {/* Akcije */}
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Idi na Dashboard
          </Link>

          <Link
            href="/"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Vrati se na pocetnu
          </Link>
        </div>

        {/* Info */}
        <p className="mt-8 text-sm text-gray-500">
          Ako mislite da je ovo greska, kontaktirajte administratora.
        </p>
      </div>
    </div>
  );
}
