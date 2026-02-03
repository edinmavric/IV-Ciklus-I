// ============================================
// REGISTER PAGE - Stranica za registraciju
// ============================================
// Client komponenta koja koristi useActionState za
// upravljanje stanjem forme i Server Actions za registraciju.

'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registrujKorisnika } from '@/app/actions/auth';
import FormField from '@/app/components/forms/FormField';
import SubmitButton from '@/app/components/forms/SubmitButton';

// Pocetno stanje forme
const initialState = {
  success: false,
  message: '',
  errors: {},
};

export default function RegisterPage() {
  const router = useRouter();

  // useActionState hook za upravljanje formom
  const [state, formAction] = useActionState(registrujKorisnika, initialState);

  // Redirect na login nakon uspesne registracije
  useEffect(() => {
    if (state.success) {
      // Sacekaj 2 sekunde pa preusmeri
      const timeout = setTimeout(() => {
        router.push('/login');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [state.success, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Kreirajte nalog
          </h1>
          <p className="mt-2 text-gray-600">
            Vec imate nalog?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Prijavite se
            </Link>
          </p>
        </div>

        {/* Forma */}
        <div className="bg-white py-8 px-6 shadow-md rounded-lg">
          <form action={formAction} className="space-y-6">
            {/* Status poruka */}
            {state.message && (
              <div
                className={`p-4 rounded-md ${
                  state.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className={`flex items-center ${state.success ? 'text-green-800' : 'text-red-800'}`}>
                  {state.success ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{state.message}</span>
                </div>
                {state.success && (
                  <p className="mt-2 text-sm text-green-700">
                    Bicete preusmereni na stranicu za prijavu...
                  </p>
                )}
              </div>
            )}

            {/* Ime */}
            <FormField
              label="Ime"
              name="ime"
              type="text"
              placeholder="Vase ime"
              error={state.errors?.ime}
              required
              autoComplete="name"
              minLength={2}
              maxLength={50}
            />

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
              autoComplete="new-password"
              minLength={6}
              helperText="Najmanje 6 karaktera"
            />

            {/* Potvrda lozinke */}
            <FormField
              label="Potvrdite lozinku"
              name="potvrdaLozinke"
              type="password"
              placeholder="••••••••"
              error={state.errors?.potvrdaLozinke}
              required
              autoComplete="new-password"
            />

            {/* Uslovi koriscenja */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Slazem se sa{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  uslovima koriscenja
                </a>{' '}
                i{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  politikom privatnosti
                </a>
              </label>
            </div>

            {/* Submit dugme */}
            <SubmitButton loadingText="Kreiranje naloga..." fullWidth>
              Registruj se
            </SubmitButton>
          </form>
        </div>

        {/* Info o demo nalogu */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Za testiranje mozete koristiti vec postojece naloge
            navedene na stranici za prijavu.
          </p>
        </div>
      </div>
    </div>
  );
}
