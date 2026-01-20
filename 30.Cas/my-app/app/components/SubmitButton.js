/**
 * SubmitButton komponenta
 *
 * Ova komponenta koristi useFormStatus hook za praćenje
 * stanja forme i prikaz loading indikatora.
 *
 * VAŽNO:
 * - Mora imati "use client" jer koristi React hook
 * - Mora biti CHILD komponenta forme (ne u istoj komponenti kao forma)
 * - useFormStatus radi samo unutar <form> elementa
 */

"use client";

import { useFormStatus } from "react-dom";

/**
 * SubmitButton - Dugme za submit sa loading stanjem
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Tekst dugmeta
 * @param {string} props.loadingText - Tekst koji se prikazuje tokom slanja
 * @param {string} props.className - Dodatne CSS klase
 */
export default function SubmitButton({
  children = "Pošalji",
  loadingText = "Šaljem...",
  className = "submit-btn",
}) {
  /**
   * useFormStatus hook
   *
   * Vraća objekat sa:
   * - pending: boolean - da li je forma u procesu slanja
   * - data: FormData | null - podaci koji se šalju
   * - method: string | null - HTTP metoda ('get' ili 'post')
   * - action: function | null - referenca na action funkciju
   *
   * NAPOMENA: Ovaj hook će vratiti { pending: false } ako se
   * ne koristi unutar <form> elementa!
   */
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      aria-disabled={pending}
    >
      {pending ? (
        <>
          {/* Spinner animacija */}
          <span className="spinner" aria-hidden="true"></span>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
