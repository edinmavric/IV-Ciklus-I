// ============================================
// DASHBOARD PAGE - Korisnicki dashboard
// ============================================
// Server komponenta koja prikazuje pregled korisnickog naloga.
// Zasticena ruta - zahteva prijavu.

import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/mongoose';
import Post from '@/lib/models/Post';
import Komentar from '@/lib/models/Komentar';

export const metadata = {
  title: 'Dashboard',
};

// Data fetching
async function getStatistike(userId) {
  try {
    await dbConnect();

    const [ukupnoPostova, objavljeniPostovi, draftPostovi, ukupnoPregleda, ukupnoKomentara] =
      await Promise.all([
        Post.countDocuments({ autor: userId }),
        Post.countDocuments({ autor: userId, status: 'objavljen' }),
        Post.countDocuments({ autor: userId, status: 'draft' }),
        Post.aggregate([
          { $match: { autor: userId } },
          { $group: { _id: null, total: { $sum: '$brojPregleda' } } },
        ]),
        Komentar.countDocuments({
          post: { $in: await Post.find({ autor: userId }).distinct('_id') },
        }),
      ]);

    return {
      ukupnoPostova,
      objavljeniPostovi,
      draftPostovi,
      ukupnoPregleda: ukupnoPregleda[0]?.total || 0,
      ukupnoKomentara,
    };
  } catch (error) {
    console.error('Greska pri dohvatanju statistika:', error);
    return {
      ukupnoPostova: 0,
      objavljeniPostovi: 0,
      draftPostovi: 0,
      ukupnoPregleda: 0,
      ukupnoKomentara: 0,
    };
  }
}

async function getPoslednjihPostova(userId, limit = 5) {
  try {
    await dbConnect();
    const postovi = await Post.find({ autor: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return JSON.parse(JSON.stringify(postovi));
  } catch (error) {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const [statistike, poslednjihPostova] = await Promise.all([
    getStatistike(session.user.id),
    getPoslednjihPostova(session.user.id),
  ]);

  // Formatiranje datuma
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dobrodosli, {session.user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Pregled vaseg naloga i aktivnosti
          </p>
        </div>

        {/* Statistike */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Ukupno postova</p>
                <p className="text-2xl font-bold text-gray-900">{statistike.ukupnoPostova}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Objavljeni</p>
                <p className="text-2xl font-bold text-gray-900">{statistike.objavljeniPostovi}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pregleda</p>
                <p className="text-2xl font-bold text-gray-900">{statistike.ukupnoPregleda}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Komentara</p>
                <p className="text-2xl font-bold text-gray-900">{statistike.ukupnoKomentara}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Brze akcije i poslednji postovi */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Brze akcije */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Brze akcije
              </h2>
              <div className="space-y-3">
                <Link
                  href="/dashboard/postovi/novi"
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-blue-700 font-medium">Novi post</span>
                </Link>

                <Link
                  href="/dashboard/postovi"
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="text-gray-700 font-medium">Moji postovi</span>
                </Link>

                <Link
                  href="/dashboard/profil"
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-700 font-medium">Uredi profil</span>
                </Link>
              </div>
            </div>

            {/* Info o ulozi */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Vas nalog
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Uloga:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.user.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : session.user.role === 'autor'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.user.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900">{session.user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Poslednji postovi */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Poslednji postovi
                </h2>
                <Link href="/dashboard/postovi" className="text-blue-600 hover:text-blue-700 text-sm">
                  Pogledaj sve
                </Link>
              </div>

              {poslednjihPostova.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3">Naslov</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Datum</th>
                        <th className="pb-3">Pregledi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {poslednjihPostova.map((post) => (
                        <tr key={post._id} className="text-sm">
                          <td className="py-3">
                            <Link
                              href={`/dashboard/postovi/${post._id}/uredi`}
                              className="text-gray-900 hover:text-blue-600 font-medium line-clamp-1"
                            >
                              {post.naslov}
                            </Link>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              post.status === 'objavljen'
                                ? 'bg-green-100 text-green-800'
                                : post.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500">
                            {formatDate(post.createdAt)}
                          </td>
                          <td className="py-3 text-gray-500">
                            {post.brojPregleda}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Nemate nijedan post</p>
                  <Link
                    href="/dashboard/postovi/novi"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Kreirajte prvi post
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
