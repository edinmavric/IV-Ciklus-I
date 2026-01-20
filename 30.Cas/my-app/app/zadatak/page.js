/**
 * Zadatak: Forma za kreiranje posta
 *
 * Ovaj zadatak demonstrira kompletnu implementaciju forme sa:
 * - Server Action za procesiranje
 * - useActionState za stanje i validaciju
 * - useFormStatus za loading indikator (kroz komponente)
 * - Validacija na serveru
 * - Prikaz grešaka po poljima
 *
 * Ovo je primjer kako bismo radili forme u produkcijskoj aplikaciji.
 */

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createPost } from "../actions";
import SubmitButton from "../components/SubmitButton";
import FormField, { FormTextarea, FormSelect } from "../components/FormField";

// Početno stanje
const initialState = {
  success: false,
  message: "",
  errors: {},
  post: null,
};

export default function ZadatakPage() {
  // useActionState za praćenje stanja i rezultata
  const [state, formAction] = useActionState(createPost, initialState);

  return (
    <div className="container">
      <Link href="/" className="back-link">
        ← Nazad na početnu
      </Link>

      <div className="form-container">
        <h1>Kreiraj novi post</h1>

        {/*
          Prikaz poruke o rezultatu

          Ako je post uspješno kreiran, prikazujemo success poruku.
          Ako ima grešaka, prikazujemo error poruku.
        */}
        {state.message && (
          <div className={`alert ${state.success ? "success" : "error"}`}>
            {state.message}
          </div>
        )}

        {/*
          Prikaz kreiranog posta

          Ako je akcija uspjela, prikazujemo podatke o novom postu.
        */}
        {state.success && state.post && (
          <div
            className="alert success"
            style={{ background: "var(--success-bg)" }}
          >
            <strong>Kreiran post:</strong>
            <br />
            ID: {state.post.id}
            <br />
            Naslov: {state.post.title}
            <br />
            Kategorija: {state.post.category}
          </div>
        )}

        {/* Forma za kreiranje posta */}
        <form action={formAction}>
          {/*
            Naslov posta

            Validacija:
            - Obavezan
            - Min 5 karaktera
            - Max 100 karaktera
          */}
          <FormField
            label="Naslov"
            name="title"
            type="text"
            placeholder="Unesite naslov posta (min 5 karaktera)"
            error={state.errors?.title}
            required
          />

          {/*
            Kategorija

            Validacija:
            - Obavezna
            - Mora biti jedna od predefinisanih vrijednosti
          */}
          <FormSelect
            label="Kategorija"
            name="category"
            error={state.errors?.category}
            required
          >
            <option value="">-- Odaberite kategoriju --</option>
            <option value="tech">Tehnologija</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="news">Vijesti</option>
          </FormSelect>

          {/*
            Sadržaj posta

            Validacija:
            - Obavezan
            - Min 20 karaktera
          */}
          <FormTextarea
            label="Sadržaj"
            name="content"
            placeholder="Napišite sadržaj posta (min 20 karaktera)..."
            rows={6}
            error={state.errors?.content}
            required
          />

          {/* Submit dugme sa loading stanjem */}
          <SubmitButton loadingText="Kreiram post...">
            Objavi post
          </SubmitButton>
        </form>

        {/* Upute */}
        <div className="demo-credentials">
          <strong>Zadatak ispunjen!</strong>
          <br />
          Ova forma demonstrira:
          <ul style={{ textAlign: "left", marginTop: "0.5rem" }}>
            <li>✅ Server Action (createPost u actions.js)</li>
            <li>✅ useActionState za stanje i greške</li>
            <li>✅ useFormStatus kroz SubmitButton</li>
            <li>✅ Server-side validacija</li>
            <li>✅ Prikaz grešaka ispod svakog polja</li>
            <li>✅ Loading indikator tokom slanja</li>
            <li>✅ Prikaz kreiranog posta</li>
          </ul>
        </div>
      </div>

      {/* Prikaz trenutnog stanja */}
      <div className="output-display" style={{ marginTop: "2rem" }}>
        <h4>Trenutno stanje (state)</h4>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>

      {/* Kod Server Action-a */}
      <div className="output-display" style={{ marginTop: "1rem" }}>
        <h4>Server Action - createPost (actions.js)</h4>
        <pre>
          {`"use server";

export async function createPost(previousState, formData) {
  const title = formData.get("title")?.trim();
  const category = formData.get("category");
  const content = formData.get("content")?.trim();

  // Validacija
  const errors = {};

  if (!title || title.length < 5) {
    errors.title = "Naslov mora imati bar 5 karaktera";
  }

  const validCategories = ["tech", "lifestyle", "news"];
  if (!category || !validCategories.includes(category)) {
    errors.category = "Odaberite validnu kategoriju";
  }

  if (!content || content.length < 20) {
    errors.content = "Sadržaj mora imati bar 20 karaktera";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Molimo ispravite greške",
      errors,
      post: null,
    };
  }

  // Simulacija čuvanja
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const newPost = {
    id: Date.now(),
    title,
    category,
    content,
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    message: "Post je uspješno kreiran!",
    errors: {},
    post: newPost,
  };
}`}
        </pre>
      </div>
    </div>
  );
}
