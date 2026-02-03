// ============================================
// LOGIN PAGE - Stranica za prijavu
// ============================================
// Client komponenta koja koristi useActionState za
// upravljanje stanjem forme i Server Actions za prijavu.

'use client';

import { useActionState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { prijaviKorisnika } from '@/app/actions/auth';
import FormField from '@/app/components/forms/FormField';
import SubmitButton from '@/app/components/forms/SubmitButton';

// Pocetno stanje forme
const initialState = {
  success: false,
  message: '',
  errors: {},
  redirectTo: null,
};

// Metadata za ovu stranicu (mora biti u zasebnom fajlu za client komponente)
// export const metadata = { title: 'Prijava' };

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // useActionState hook za upravljanje formom
  const [state, formAction] = useActionState(prijaviKorisnika, initialState);

  // Redirect nakon uspesne prijave
  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state.success, state.redirectTo, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Prijavite se
          </h1>
          <p className="mt-2 text-gray-600">
            Nemate nalog?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Registrujte se
            </Link>
          </p>
        </div>

        {/* Forma */}
        <div className="bg-white py-8 px-6 shadow-md rounded-lg">
          <form action={formAction} className="space-y-6">
            {/* Hidden callbackUrl */}
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            {/* Status poruka */}
            {state.message && !state.success && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200">
                <div className="flex items-center text-red-800">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {state.message}
                </div>
              </div>
            )}

            {/* Email */}
            <FormField
              label="Email adresa"
              name="email"
              type="email"
              placeholder="vas@email.com"
              error={state.errors?.email}
              required
              autoComplete="email"
            />

            {/* Lozinka */}
            <FormField
              label="Lozinka"
              name="lozinka"
              type="password"
              placeholder="••••••••"
              error={state.errors?.lozinka}
              required
              autoComplete="current-password"
            />

            {/* Zapamti me i Zaboravljena lozinka */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Zapamti me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  Zaboravili ste lozinku?
                </a>
              </div>
            </div>

            {/* Submit dugme */}
            <SubmitButton loadingText="Prijavljivanje..." fullWidth>
              Prijavi se
            </SubmitButton>
          </form>

          {/* Separator */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Demo kredencijali
                </span>
              </div>
            </div>

            {/* Demo kredencijali */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                <p className="font-medium text-gray-700">Admin:</p>
                <p className="text-gray-600">admin@test.com</p>
                <p className="text-gray-600">admin123</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                <p className="font-medium text-gray-700">Korisnik:</p>
                <p className="text-gray-600">user@test.com</p>
                <p className="text-gray-600">user123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
