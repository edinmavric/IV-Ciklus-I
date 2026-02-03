// ============================================
// POST FORM - Forma za kreiranje/editovanje posta
// ============================================
// Client komponenta koja koristi useActionState za
// upravljanje stanjem forme i Server Actions za submit.

'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FormField, { KATEGORIJE, STATUS_OPCIJE } from './FormField';
import SubmitButton from './SubmitButton';
import { kreirajPost, azurirajPost } from '@/app/actions/post';

// Pocetno stanje forme
const initialState = {
  success: false,
  message: '',
  errors: {},
  data: null,
};

/**
 * PostForm komponenta
 * Forma za kreiranje novog posta ili editovanje postojeceg
 *
 * @param {Object} props
 * @param {Object} props.post - Postojeci post za editovanje (opciono)
 * @param {string} props.mode - 'create' | 'edit'
 *
 * @example
 * // Za kreiranje novog posta:
 * <PostForm mode="create" />
 *
 * // Za editovanje postojeceg:
 * <PostForm post={existingPost} mode="edit" />
 */
export default function PostForm({ post = null, mode = 'create' }) {
  const router = useRouter();
  const isEditMode = mode === 'edit' && post;

  // useActionState za upravljanje stanjem forme
  // Prvi argument je server action, drugi je pocetno stanje
  const [state, formAction] = useActionState(
    isEditMode ? azurirajPost : kreirajPost,
    initialState
  );

  // Efekat za redirect nakon uspesnog submit-a
  useEffect(() => {
    if (state.success) {
      // Prikaži uspešnu poruku (može se koristiti toast notification)
      console.log(state.message);

      // Redirect na listu postova nakon kratkog delay-a
      setTimeout(() => {
        router.push('/dashboard/postovi');
        router.refresh();
      }, 1000);
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Skriveno polje za ID posta (u edit modu) */}
      {isEditMode && (
        <input type="hidden" name="postId" value={post._id} />
      )}

      {/* Status poruka */}
      {state.message && (
        <div
          className={`p-4 rounded-md ${
            state.success
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
          role="alert"
        >
          <div className="flex items-center">
            {state.success ? (
              <svg className="w-5 h-5 mr-2\" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {state.message}
          </div>
        </div>
      )}

      {/* Naslov */}
      <FormField
        label="Naslov"
        name="naslov"
        type="text"
        placeholder="Unesite naslov posta"
        defaultValue={post?.naslov}
        error={state.errors?.naslov}
        required
        minLength={5}
        maxLength={150}
        helperText="Naslov mora imati izmedju 5 i 150 karaktera"
      />

      {/* Izvod (kratak opis) */}
      <FormField
        label="Izvod"
        name="izvod"
        type="textarea"
        rows={2}
        placeholder="Kratak opis posta koji ce se prikazati u listi"
        defaultValue={post?.izvod}
        error={state.errors?.izvod}
        required
        maxLength={300}
        helperText="Kratak opis za prikaz u listi (max 300 karaktera)"
      />

      {/* Sadrzaj */}
      <FormField
        label="Sadrzaj"
        name="sadrzaj"
        type="textarea"
        rows={10}
        placeholder="Unesite sadrzaj posta..."
        defaultValue={post?.sadrzaj}
        error={state.errors?.sadrzaj}
        required
        minLength={50}
        helperText="Glavni sadrzaj posta (min 50 karaktera)"
      />

      {/* Kategorija i Status u redu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kategorija */}
        <FormField
          label="Kategorija"
          name="kategorija"
          type="select"
          options={KATEGORIJE}
          defaultValue={post?.kategorija}
          error={state.errors?.kategorija}
          required
        />

        {/* Status */}
        <FormField
          label="Status"
          name="status"
          type="select"
          options={STATUS_OPCIJE}
          defaultValue={post?.status || 'draft'}
          error={state.errors?.status}
        />
      </div>

      {/* Tagovi */}
      <FormField
        label="Tagovi"
        name="tagovi"
        type="text"
        placeholder="javascript, react, nextjs"
        defaultValue={post?.tagovi?.join(', ')}
        error={state.errors?.tagovi}
        helperText="Unesite tagove razdvojene zarezom"
      />

      {/* URL slike */}
      <FormField
        label="URL slike"
        name="slika"
        type="text"
        placeholder="/images/moj-post.jpg ili https://..."
        defaultValue={post?.slika}
        error={state.errors?.slika}
        helperText="URL do slike posta (opciono)"
      />

      {/* Preview slike ako postoji */}
      {post?.slika && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">Trenutna slika:</p>
          <img
            src={post.slika}
            alt="Trenutna slika posta"
            className="max-w-xs rounded-md shadow-sm"
          />
        </div>
      )}

      {/* Dugmad */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Odustani
        </button>

        <SubmitButton
          loadingText={isEditMode ? 'Azuriranje...' : 'Kreiranje...'}
          variant="primary"
        >
          {isEditMode ? 'Sacuvaj izmene' : 'Kreiraj post'}
        </SubmitButton>
      </div>
    </form>
  );
}
