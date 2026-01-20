/**
 * Demo: Osnovna Server Action
 *
 * Ovaj primjer pokazuje najjednostavniju upotrebu Server Actions.
 * Forma koristi action prop za direktno pozivanje server funkcije.
 *
 * NAPOMENA: Ova forma NE prikazuje rezultat akcije jer ne koristi
 * useActionState. Koristi se samo za demonstraciju osnovnog koncepta.
 */

import Link from "next/link";
import { simpleLogin } from "../../actions";

export default function ServerActionDemo() {
  return (
    <div className="container">
      {/* Navigacija nazad */}
      <Link href="/" className="back-link">
        ← Nazad na početnu
      </Link>

      <div className="form-container">
        <h1>Server Action Demo</h1>

        {/*
          KLJUČNO: action prop

          Umjesto onSubmit + fetch(), koristimo action prop
          koji direktno poziva Server Action.

          FormData se automatski proslijeđuje funkciji.
        */}
        <form action={simpleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email" // VAŽNO: name atribut za FormData
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
          <button type="submit" className="submit-btn">
            Prijavi se
          </button>
        </form>

        {/* Upute */}
        <div className="demo-credentials">
          <strong>Kako radi:</strong>
          <ol style={{ textAlign: "left", marginTop: "0.5rem" }}>
            <li>Klikni &quot;Prijavi se&quot;</li>
            <li>Pogledaj terminal - tamo se loguje server output</li>
            <li>Forma se submituje, ali nema feedback u UI-u</li>
          </ol>
          <p style={{ marginTop: "1rem" }}>
            <strong>Problem:</strong> Nema loading indikatora niti prikaza rezultata!
            <br />
            Za to nam trebaju <code>useFormStatus</code> i <code>useActionState</code>.
          </p>
        </div>
      </div>

      {/* Objašnjenje koda */}
      <div className="output-display" style={{ marginTop: "2rem" }}>
        <h4>Kod Server Action-a (actions.js)</h4>
        <pre>
          {`"use server";

export async function simpleLogin(formData) {
  // formData je automatski FormData objekat
  const email = formData.get('email');
  const password = formData.get('password');

  // Ovo se loguje na SERVERU!
  console.log('Login pokušaj za:', email);

  // Simulacija delay-a
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (email === 'user@test.com' && password === 'password123') {
    return { success: true, message: 'Uspješna prijava!' };
  }

  return { success: false, message: 'Pogrešan email ili password' };
}`}
        </pre>
      </div>
    </div>
  );
}
