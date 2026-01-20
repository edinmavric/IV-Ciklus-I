/**
 * Demo: useFormStatus hook
 *
 * Ovaj primjer pokazuje kako koristiti useFormStatus za
 * praćenje stanja forme i prikaz loading indikatora.
 *
 * KLJUČNO: useFormStatus mora biti u CHILD komponenti forme,
 * ne u istoj komponenti gdje je <form> element!
 */

import Link from "next/link";
import { simpleLogin } from "../../actions";
import SubmitButton from "../../components/SubmitButton";

export default function FormStatusDemo() {
  return (
    <div className="container">
      <Link href="/" className="back-link">
        ← Nazad na početnu
      </Link>

      <div className="form-container">
        <h1>useFormStatus Demo</h1>

        {/*
          Forma sa Server Action

          Razlika od prethodnog primjera:
          - Koristimo SubmitButton komponentu koja ima useFormStatus
          - Dugme se automatski disable-uje i prikazuje spinner
        */}
        <form action={simpleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="user@test.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="password123"
              required
            />
          </div>

          {/*
            SubmitButton komponenta

            Ova komponenta interno koristi useFormStatus hook
            i automatski prikazuje loading stanje.

            Mora biti CHILD komponenta forme!
          */}
          <SubmitButton loadingText="Prijavljivanje...">
            Prijavi se
          </SubmitButton>
        </form>

        <div className="demo-credentials">
          <strong>Probaj:</strong> Unesi bilo koje podatke i klikni dugme.
          <br />
          Primijeti loading indikator dok se forma šalje!
        </div>
      </div>

      {/* Objašnjenje */}
      <div className="output-display" style={{ marginTop: "2rem" }}>
        <h4>Zašto useFormStatus mora biti u child komponenti?</h4>
        <pre>
          {`// ❌ NEĆE RADITI - u istoj komponenti kao forma
function Form() {
  const { pending } = useFormStatus(); // Uvijek false!

  return (
    <form action={action}>
      <button disabled={pending}>Submit</button>
    </form>
  );
}

// ✅ RADI - u child komponenti
function SubmitButton() {
  const { pending } = useFormStatus(); // Radi!

  return (
    <button disabled={pending}>
      {pending ? 'Šaljem...' : 'Submit'}
    </button>
  );
}

function Form() {
  return (
    <form action={action}>
      <SubmitButton /> {/* Child komponenta */}
    </form>
  );
}`}
        </pre>
      </div>

      <div className="output-display" style={{ marginTop: "1rem" }}>
        <h4>SubmitButton komponenta (components/SubmitButton.js)</h4>
        <pre>
          {`"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ children, loadingText }) {
  // useFormStatus vraća objekat sa:
  // - pending: boolean (da li je forma u slanju)
  // - data: FormData | null
  // - method: string | null
  // - action: function | null
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? (
        <>
          <span className="spinner"></span>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}`}
        </pre>
      </div>
    </div>
  );
}
