// ============================================
// SUBMIT BUTTON - Dugme sa loading stanjem
// ============================================
// Koristi useFormStatus hook za prikaz loading stanja tokom
// submit-a forme. Ovo je kljucna komponenta za Server Actions.

'use client';

import { useFormStatus } from 'react-dom';

/**
 * SubmitButton komponenta
 * Prikazuje loading spinner dok je forma u pending stanju
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Tekst dugmeta
 * @param {string} props.loadingText - Tekst tokom loadinga
 * @param {string} props.className - Dodatne CSS klase
 * @param {boolean} props.disabled - Da li je dugme disabled
 * @param {string} props.variant - Varijanta: 'primary' | 'secondary' | 'danger'
 * @param {boolean} props.fullWidth - Da li zauzima punu sirinu
 *
 * @example
 * <form action={serverAction}>
 *   <SubmitButton loadingText="Cuvanje...">
 *     Sacuvaj
 *   </SubmitButton>
 * </form>
 */
export default function SubmitButton({
  children,
  loadingText = 'Ucitavanje...',
  className = '',
  disabled = false,
  variant = 'primary',
  fullWidth = false,
}) {
  // useFormStatus MORA biti koriscen unutar <form> elementa
  // Vraca { pending, data, method, action }
  const { pending } = useFormStatus();

  // Definicija varijanti
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };

  // Bazne klase
  const baseClasses = `
    inline-flex items-center justify-center
    px-4 py-2
    text-sm font-medium
    rounded-md
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${variants[variant] || variants.primary}
    ${className}
  `;

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={baseClasses}
      aria-busy={pending}
    >
      {pending ? (
        <>
          {/* Loading spinner */}
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Alternativna verzija sa custom renderom
 * Omogucava potpunu kontrolu nad renderom dugmeta
 */
export function SubmitButtonCustom({ children, render }) {
  const { pending } = useFormStatus();

  if (render) {
    return render({ pending });
  }

  return children({ pending });
}
