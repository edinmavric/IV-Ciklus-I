// ============================================
// NOVI POST PAGE - Kreiranje novog posta
// ============================================
// Koristi PostForm komponentu sa Server Actions

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import PostForm from '@/app/components/forms/PostForm';

export const metadata = {
  title: 'Novi post',
};

export default async function NoviPostPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Provera uloge
  if (!['autor', 'admin'].includes(session.user.role)) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kreiraj novi post</h1>
          <p className="text-gray-600 mt-1">
            Popunite formu ispod da kreirate novi blog post
          </p>
        </div>

        {/* Forma */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <PostForm mode="create" />
        </div>

        {/* Pomocne informacije */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Saveti za pisanje dobrog posta
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Koristite jasan i privlacan naslov koji opisuje sadrzaj</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Izvod treba da bude kratak sazetak koji privlaci citaoce</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Dodajte relevantne tagove za bolju pretrazivost</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Mozete sacuvati kao draft i objaviti kasnije</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
