/**
 * Demo: useActionState hook
 *
 * Ovaj primjer pokazuje kako koristiti useActionState za:
 * - Čitanje rezultata Server Action-a
 * - Prikazivanje poruka o uspjehu/grešci
 * - Prikazivanje grešaka validacije po poljima
 *
 * VAŽNO: Kada koristimo useActionState, Server Action mora
 * primiti previousState kao PRVI argument!
 */

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginWithValidation } from "../../actions";
import SubmitButton from "../../components/SubmitButton";
import FormField from "../../components/FormField";

// Početno stanje za useActionState
const initialState = {
  success: false,
  message: "",
  errors: {},
};

export default function ActionStateDemo() {
  /**
   * useActionState hook
   *
   * Sintaksa: const [state, formAction, isPending] = useActionState(action, initialState)
   *
   * Parametri:
   * - action: Server Action funkcija (mora primiti prevState kao prvi arg)
   * - initialState: Početno stanje
   *
   * Vraća:
   * - state: Trenutno stanje (rezultat zadnje akcije)
   * - formAction: Wrapper funkcija za action (koristi se u form action prop)
   * - isPending: boolean - da li je akcija u toku (React 19+)
   */
  const [state, formAction, isPending] = useActionState(
    loginWithValidation,
    initialState
  );

  return (
    <div className="container">
      <Link href="/" className="back-link">
        ← Nazad na početnu
      </Link>

      <div className="form-container">
        <h1>useActionState Demo</h1>

        {/*
          Prikaz poruke o rezultatu

          state.message sadrži poruku od Server Action-a.
          state.success određuje da li je akcija uspjela.
        */}
        {state.message && (
          <div className={`alert ${state.success ? "success" : "error"}`}>
            {state.message}
          </div>
        )}

        {/*
          VAŽNO: Koristimo formAction (ne loginWithValidation direktno)

          formAction je wrapper koji:
          1. Poziva Server Action sa previousState
          2. Ažurira state sa rezultatom
        */}
        <form action={formAction}>
          {/*
            FormField komponenta sa prikazom greške

            state.errors.email sadrži grešku za email polje
            (ako validacija nije prošla)
          */}
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="user@test.com"
            error={state.errors?.email}
            required
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            placeholder="password123"
            error={state.errors?.password}
            required
          />

          {/* Checkbox */}
          <div className="form-group checkbox">
            <input type="checkbox" id="rememberMe" name="rememberMe" />
            <label htmlFor="rememberMe">Zapamti me</label>
          </div>

          <SubmitButton loadingText="Prijavljivanje...">
            Prijavi se
          </SubmitButton>
        </form>

        <div className="demo-credentials">
          <strong>Demo kredencijali:</strong>
          <br />
          Email: user@test.com
          <br />
          Password: password123
          <br />
          <br />
          <strong>Probaj:</strong>
          <ol style={{ textAlign: "left", marginTop: "0.5rem" }}>
            <li>Ostavi prazna polja - vidjet ćeš greške validacije</li>
            <li>Unesi kratak password - vidjet ćeš specifičnu grešku</li>
            <li>Unesi pogrešne kredencijale - vidjet ćeš poruku o grešci</li>
            <li>Unesi ispravne kredencijale - vidjet ćeš uspješnu poruku</li>
          </ol>
        </div>
      </div>

      {/* Prikaz trenutnog stanja */}
      <div className="output-display" style={{ marginTop: "2rem" }}>
        <h4>Trenutno stanje (state)</h4>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>

      {/* Objašnjenje */}
      <div className="output-display" style={{ marginTop: "1rem" }}>
        <h4>Server Action sa useActionState</h4>
        <pre>
          {`// VAŽNO: previousState mora biti PRVI argument!
export async function loginWithValidation(previousState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  const errors = {};

  // Validacija
  if (!email) errors.email = 'Email je obavezan';
  if (!password) errors.password = 'Password je obavezan';

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Molimo ispravite greške',
      errors,
    };
  }

  // Provjera kredencijala...

  return {
    success: true,
    message: 'Uspješna prijava!',
    errors: {},
  };
}`}
        </pre>
      </div>
    </div>
  );
}
