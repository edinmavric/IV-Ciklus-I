# Next.js Kurs - Čas 30: Forms, Server Actions & Mutations

## Sadržaj
- [Problem klasičnih formi u Reactu](#problem-klasičnih-formi-u-reactu)
- [Server Actions](#server-actions)
- [useFormStatus hook](#useformstatus-hook)
- [useActionState hook](#useactionstate-hook)
- [Validacija podataka](#validacija-podataka)
- [Praktični primeri](#praktični-primeri)

---

# Problem klasičnih formi u Reactu

## 1. Tradicionalni pristup formama (Client-Side)

### Kako smo radili forme u React-u

```jsx
'use client';

import { useState } from 'react';

export default function TraditionalForm() {
  // Problem 1: Moramo pratiti stanje svakog polja
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();  // Problem 2: Moramo spriječiti default ponašanje
    setLoading(true);
    setError(null);

    try {
      // Problem 3: Moramo ručno slati podatke na API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      // Problem 4: Moramo ručno handlati uspjeh
      const data = await response.json();
      // redirect...

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}  {/* Problem 5: Controlled inputs */}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### Problemi tradicionalnog pristupa

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROBLEMI KLASIČNIH FORMI                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. BOILERPLATE KOD                                                 │
│     - useState za svako polje                                       │
│     - onChange handler za svako polje                               │
│     - Loading/error stanje                                          │
│                                                                     │
│  2. API ENDPOINT                                                    │
│     - Moramo kreirati poseban API route                             │
│     - Dupla validacija (client + server)                            │
│     - Više fajlova za održavanje                                    │
│                                                                     │
│  3. SIGURNOST                                                       │
│     - API ključevi mogu procuriti na client                         │
│     - CORS konfiguracija                                            │
│     - CSRF zaštita                                                  │
│                                                                     │
│  4. BUNDLE SIZE                                                     │
│     - Sav kod forme ide u client bundle                             │
│     - Validacione biblioteke povećavaju bundle                      │
│                                                                     │
│  5. HYDRATION                                                       │
│     - Forma ne radi dok se JS ne učita                              │
│     - Loše za spore konekcije                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Vizualni prikaz tradicionalnog flow-a

```
TRADICIONALNI PRISTUP:

[Browser]                    [Server]
    │                            │
    │  1. Korisnik unosi podatke │
    │  2. onChange → setState    │
    │  3. Submit → fetch()       │
    │ ─────────────────────────► │
    │     POST /api/login        │
    │                            │ 4. API route prima request
    │                            │ 5. Validacija
    │                            │ 6. Database operacije
    │ ◄───────────────────────── │
    │     JSON response          │
    │  7. Ažuriraj UI            │
    │                            │

Potrebni fajlovi:
├── app/login/page.js       (Client Component - forma)
├── app/api/login/route.js  (API endpoint)
└── lib/validation.js       (Validacija - duplirano)
```

---

# Server Actions

## 2. Šta su Server Actions?

Server Actions su **async funkcije koje se izvršavaju na serveru**. Omogućavaju nam da direktno pozivamo server-side kod iz formi i komponenti, bez potrebe za API endpointima.

### Ključne karakteristike

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVER ACTIONS                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✅ Izvršavaju se na SERVERU                                        │
│  ✅ Mogu direktno pristupiti bazi podataka                          │
│  ✅ Mogu koristiti environment varijable sigurno                    │
│  ✅ Automatski serijalizu FormData                                  │
│  ✅ Rade i BEZ JavaScript-a (Progressive Enhancement)               │
│  ✅ Integrirani sa Next.js caching sistemom                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Kako definisati Server Action

```javascript
// Način 1: "use server" direktiva na vrhu fajla
// app/actions.js

"use server";

// Sve funkcije u ovom fajlu su Server Actions
export async function login(formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  // Server-side kod - siguran pristup bazi, API ključevima, itd.
  // ...
}

export async function createPost(formData) {
  // ...
}
```

```javascript
// Način 2: "use server" unutar funkcije
// app/page.js

export default function Page() {
  // Inline Server Action
  async function handleSubmit(formData) {
    "use server";  // Ova funkcija se izvršava na serveru

    const name = formData.get('name');
    // Server-side operacije...
  }

  return (
    <form action={handleSubmit}>
      <input name="name" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Vizualni prikaz Server Actions flow-a

```
SERVER ACTIONS PRISTUP:

[Browser]                    [Server]
    │                            │
    │  1. Korisnik unosi podatke │
    │  2. Submit                 │
    │ ─────────────────────────► │
    │     FormData (automatski)  │
    │                            │ 3. Server Action se izvršava
    │                            │ 4. Direktan pristup bazi
    │                            │ 5. Validacija na serveru
    │ ◄───────────────────────── │
    │     Revalidation/Redirect  │
    │  6. UI se automatski       │
    │     ažurira                │
    │                            │

Potrebni fajlovi:
├── app/login/page.js       (Server Component - forma)
└── app/actions.js          (Server Actions)

NEMA API ENDPOINTA! 🎉
```

### Osnovna forma sa Server Action

```javascript
// app/actions.js
"use server";

export async function login(formData) {
  // formData je automatski FormData objekat
  const email = formData.get('email');
  const password = formData.get('password');

  console.log('Login attempt:', email);
  // Ovo se loguje na SERVERU, ne u browseru!

  // Simulacija provjere kredencijala
  if (email === 'test@test.com' && password === 'password') {
    // Uspješan login
    return { success: true, message: 'Logged in!' };
  }

  return { success: false, message: 'Invalid credentials' };
}
```

```javascript
// app/login/page.js
import { login } from '../actions';

export default function LoginPage() {
  return (
    <form action={login}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"   {/* VAŽNO: name atribut! */}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          required
        />
      </div>

      <button type="submit">Login</button>
    </form>
  );
}
```

### Prednosti Server Actions

| Aspekt | API Route | Server Action |
|--------|-----------|---------------|
| Fajlovi | 2+ (page + api route) | 1-2 (page + actions) |
| Boilerplate | Puno (fetch, headers, body) | Malo (samo action) |
| Tipovi | Ručno definisani | Automatski |
| Caching | Ručno | Automatski integrisano |
| Revalidation | Ručno | `revalidatePath()` |
| Redirect | Ručno | `redirect()` |
| Radi bez JS | Ne | Da |

---

## 3. FormData u Server Actions

### Rad sa FormData

```javascript
"use server";

export async function processForm(formData) {
  // Dohvatanje pojedinačnih vrijednosti
  const name = formData.get('name');           // string | null
  const email = formData.get('email');         // string | null
  const age = formData.get('age');             // string | null (uvijek string!)

  // Dohvatanje svih vrijednosti istog imena (npr. checkboxes)
  const hobbies = formData.getAll('hobbies');  // string[]

  // Provjera da li polje postoji
  const hasNewsletter = formData.has('newsletter');  // boolean

  // Iteracija kroz sve
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  // Pretvaranje u objekat
  const data = Object.fromEntries(formData);
  // { name: 'John', email: 'john@example.com', ... }
}
```

### Primjer sa različitim tipovima polja

```javascript
// app/actions.js
"use server";

export async function submitSurvey(formData) {
  // Text input
  const name = formData.get('name');

  // Number input (dolazi kao string!)
  const age = parseInt(formData.get('age'), 10);

  // Select
  const country = formData.get('country');

  // Radio buttons
  const gender = formData.get('gender');

  // Checkboxes (multiple values)
  const interests = formData.getAll('interests');

  // Textarea
  const bio = formData.get('bio');

  // File upload
  const avatar = formData.get('avatar');  // File objekt

  console.log({
    name,
    age,
    country,
    gender,
    interests,
    bio,
    avatarName: avatar?.name,
    avatarSize: avatar?.size,
  });

  return { success: true };
}
```

```jsx
// app/survey/page.js
import { submitSurvey } from '../actions';

export default function SurveyPage() {
  return (
    <form action={submitSurvey}>
      {/* Text */}
      <input type="text" name="name" placeholder="Ime" />

      {/* Number */}
      <input type="number" name="age" placeholder="Godine" />

      {/* Select */}
      <select name="country">
        <option value="rs">Srbija</option>
        <option value="hr">Hrvatska</option>
        <option value="ba">BiH</option>
      </select>

      {/* Radio */}
      <label>
        <input type="radio" name="gender" value="m" /> Muško
      </label>
      <label>
        <input type="radio" name="gender" value="f" /> Žensko
      </label>

      {/* Checkboxes */}
      <label>
        <input type="checkbox" name="interests" value="sport" /> Sport
      </label>
      <label>
        <input type="checkbox" name="interests" value="music" /> Muzika
      </label>
      <label>
        <input type="checkbox" name="interests" value="tech" /> Tehnologija
      </label>

      {/* Textarea */}
      <textarea name="bio" placeholder="O sebi..."></textarea>

      {/* File */}
      <input type="file" name="avatar" accept="image/*" />

      <button type="submit">Pošalji</button>
    </form>
  );
}
```

---

# useFormStatus hook

## 4. Praćenje stanja forme

`useFormStatus` je React hook koji daje informacije o pending stanju forme.

### Ključne karakteristike

```
┌─────────────────────────────────────────────────────────────────────┐
│                      useFormStatus                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📍 MORA biti unutar <form> elementa                                │
│  📍 MORA biti u Client Component ('use client')                     │
│  📍 MORA biti u CHILD komponenti forme (ne u istoj komponenti)      │
│                                                                     │
│  Vraća objekat sa:                                                  │
│  - pending: boolean (da li je forma u toku slanja)                  │
│  - data: FormData | null (podaci koji se šalju)                     │
│  - method: string | null ('get' ili 'post')                         │
│  - action: function | null (referenca na action)                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Zašto mora biti u child komponenti?

```jsx
// ❌ NEĆE RADITI - useFormStatus u istoj komponenti kao forma
'use client';
import { useFormStatus } from 'react-dom';

export default function Form() {
  const { pending } = useFormStatus();  // Uvijek false!

  return (
    <form action={someAction}>
      <button disabled={pending}>Submit</button>
    </form>
  );
}

// ✅ RADI - useFormStatus u child komponenti
'use client';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();  // Radi!

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Šaljem...' : 'Pošalji'}
    </button>
  );
}

export default function Form() {
  return (
    <form action={someAction}>
      <input name="email" type="email" />
      <SubmitButton />  {/* Child komponenta */}
    </form>
  );
}
```

### Praktični primjer sa useFormStatus

```jsx
// components/SubmitButton.js
'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children, loadingText = 'Šaljem...' }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        opacity: pending ? 0.7 : 1,
        cursor: pending ? 'not-allowed' : 'pointer',
      }}
    >
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
}
```

```jsx
// app/login/page.js
import { login } from '../actions';
import SubmitButton from '@/components/SubmitButton';

export default function LoginPage() {
  return (
    <form action={login}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />

      <SubmitButton loadingText="Prijavljivanje...">
        Prijavi se
      </SubmitButton>
    </form>
  );
}
```

### Disabling polja tokom submita

```jsx
// components/FormField.js
'use client';

import { useFormStatus } from 'react-dom';

export default function FormField({ label, ...props }) {
  const { pending } = useFormStatus();

  return (
    <div className="form-field">
      <label>{label}</label>
      <input
        {...props}
        disabled={pending}  // Disable tokom slanja
        style={{
          opacity: pending ? 0.5 : 1,
        }}
      />
    </div>
  );
}
```

---

# useActionState hook

## 5. Upravljanje stanjem akcije

`useActionState` (ranije `useFormState`) omogućava praćenje rezultata Server Action-a i prikazivanje povratnih informacija korisniku.

### Ključne karakteristike

```
┌─────────────────────────────────────────────────────────────────────┐
│                      useActionState                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📍 MORA biti u Client Component ('use client')                     │
│  📍 Omogućava čitanje povratne vrijednosti Server Action-a          │
│  📍 Čuva stanje između renderovanja                                 │
│                                                                     │
│  Sintaksa:                                                          │
│  const [state, formAction, isPending] = useActionState(             │
│    action,       // Server Action funkcija                          │
│    initialState  // Početno stanje                                  │
│  );                                                                 │
│                                                                     │
│  Vraća:                                                             │
│  - state: trenutno stanje (rezultat zadnje akcije)                  │
│  - formAction: wrapper funkcija za action                           │
│  - isPending: boolean (da li je akcija u toku) - NOVO u React 19    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Kako radi useActionState

```
FLOW useActionState:

1. Početno stanje (initialState)
   state = { message: '', errors: {} }
        │
        ▼
2. Korisnik submituje formu
   formAction(formData)
        │
        ▼
3. Server Action se izvršava
   action(previousState, formData)
        │
        ▼
4. Server vraća novo stanje
   return { message: 'Uspjeh!', errors: {} }
        │
        ▼
5. Komponenta se re-renderuje sa novim state-om
   state = { message: 'Uspjeh!', errors: {} }
```

### Primjer sa useActionState

```javascript
// app/actions.js
"use server";

// VAŽNO: Server Action mora primiti previousState kao prvi argument
// kada se koristi sa useActionState!
export async function createUser(previousState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');

  // Validacija
  const errors = {};

  if (!name || name.length < 2) {
    errors.name = 'Ime mora imati bar 2 karaktera';
  }

  if (!email || !email.includes('@')) {
    errors.email = 'Unesite validan email';
  }

  // Ako ima grešaka, vrati ih
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Molimo ispravite greške',
      errors,
    };
  }

  // Simulacija čuvanja u bazu
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Uspjeh
  return {
    success: true,
    message: `Korisnik ${name} je uspješno kreiran!`,
    errors: {},
  };
}
```

```jsx
// app/register/page.js
'use client';

import { useActionState } from 'react';
import { createUser } from '../actions';

// Početno stanje
const initialState = {
  success: false,
  message: '',
  errors: {},
};

export default function RegisterPage() {
  // useActionState vraća [state, formAction, isPending]
  const [state, formAction, isPending] = useActionState(createUser, initialState);

  return (
    <form action={formAction}>
      {/* Prikaz opće poruke */}
      {state.message && (
        <div className={state.success ? 'success' : 'error'}>
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="name">Ime:</label>
        <input
          type="text"
          id="name"
          name="name"
          disabled={isPending}
        />
        {/* Prikaz greške za polje */}
        {state.errors?.name && (
          <span className="field-error">{state.errors.name}</span>
        )}
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          disabled={isPending}
        />
        {state.errors?.email && (
          <span className="field-error">{state.errors.email}</span>
        )}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Kreiram...' : 'Registruj se'}
      </button>
    </form>
  );
}
```

### Kombinovanje useActionState i useFormStatus

```jsx
// components/SubmitButton.js
'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Šaljem...' : children}
    </button>
  );
}
```

```jsx
// app/contact/page.js
'use client';

import { useActionState } from 'react';
import { sendMessage } from '../actions';
import SubmitButton from '@/components/SubmitButton';

const initialState = { success: false, message: '' };

export default function ContactPage() {
  const [state, formAction] = useActionState(sendMessage, initialState);

  return (
    <form action={formAction}>
      {state.message && (
        <div className={state.success ? 'success' : 'error'}>
          {state.message}
        </div>
      )}

      <input type="text" name="name" placeholder="Ime" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Poruka" required></textarea>

      {/* SubmitButton koristi useFormStatus interno */}
      <SubmitButton>Pošalji poruku</SubmitButton>
    </form>
  );
}
```

---

# Validacija podataka

## 6. Server-side validacija

### Ručna validacija

```javascript
// app/actions.js
"use server";

export async function registerUser(prevState, formData) {
  const username = formData.get('username')?.trim();
  const email = formData.get('email')?.trim();
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  const errors = {};

  // Username validacija
  if (!username) {
    errors.username = 'Username je obavezan';
  } else if (username.length < 3) {
    errors.username = 'Username mora imati bar 3 karaktera';
  } else if (username.length > 20) {
    errors.username = 'Username može imati maksimalno 20 karaktera';
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = 'Username može sadržati samo slova, brojeve i _';
  }

  // Email validacija
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = 'Email je obavezan';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Unesite validan email';
  }

  // Password validacija
  if (!password) {
    errors.password = 'Password je obavezan';
  } else if (password.length < 8) {
    errors.password = 'Password mora imati bar 8 karaktera';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Password mora sadržati bar jedno veliko slovo';
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Password mora sadržati bar jedan broj';
  }

  // Confirm password
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwordi se ne poklapaju';
  }

  // Ako ima grešaka
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: 'Molimo ispravite greške u formi',
    };
  }

  // Sve OK - nastavi sa registracijom
  // await db.user.create({ ... })

  return {
    success: true,
    errors: {},
    message: 'Registracija uspješna!',
  };
}
```

### Validacija sa Zod bibliotekom (preporučeno)

```javascript
// lib/validations.js
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email je obavezan')
    .email('Unesite validan email'),
  password: z
    .string()
    .min(1, 'Password je obavezan')
    .min(8, 'Password mora imati bar 8 karaktera'),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username mora imati bar 3 karaktera')
    .max(20, 'Username može imati maksimalno 20 karaktera')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username može sadržati samo slova, brojeve i _'),
  email: z
    .string()
    .min(1, 'Email je obavezan')
    .email('Unesite validan email'),
  password: z
    .string()
    .min(8, 'Password mora imati bar 8 karaktera')
    .regex(/[A-Z]/, 'Password mora sadržati bar jedno veliko slovo')
    .regex(/[0-9]/, 'Password mora sadržati bar jedan broj'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwordi se ne poklapaju',
  path: ['confirmPassword'],
});

export const postSchema = z.object({
  title: z
    .string()
    .min(5, 'Naslov mora imati bar 5 karaktera')
    .max(100, 'Naslov može imati maksimalno 100 karaktera'),
  content: z
    .string()
    .min(20, 'Sadržaj mora imati bar 20 karaktera'),
  category: z.enum(['tech', 'lifestyle', 'news'], {
    errorMap: () => ({ message: 'Odaberite validnu kategoriju' }),
  }),
});
```

```javascript
// app/actions.js
"use server";

import { loginSchema, postSchema } from '@/lib/validations';

export async function login(prevState, formData) {
  // Parsiranje FormData u objekat
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Validacija sa Zod
  const validatedFields = loginSchema.safeParse(rawData);

  // Ako validacija nije uspjela
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validacija nije uspjela',
    };
  }

  // Sada imamo sigurne, validirane podatke
  const { email, password } = validatedFields.data;

  // Nastavi sa loginom...
  // const user = await db.user.findUnique({ where: { email } });

  return {
    success: true,
    errors: {},
    message: 'Uspješna prijava!',
  };
}
```

---

# Praktični primeri

## 7. Kompletna Login Forma

```javascript
// app/actions.js
"use server";

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function login(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const rememberMe = formData.get('rememberMe') === 'on';

  // Validacija
  if (!email || !password) {
    return {
      success: false,
      message: 'Email i password su obavezni',
    };
  }

  // Simulacija provjere u bazi
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Demo kredencijali
  if (email === 'user@test.com' && password === 'password123') {
    // Postavi cookie (u pravoj app bi koristili JWT ili session)
    const cookieStore = await cookies();
    cookieStore.set('user', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 dana ili 1 dan
    });

    // Redirect na dashboard
    redirect('/dashboard');
  }

  return {
    success: false,
    message: 'Pogrešan email ili password',
  };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user');
  redirect('/login');
}
```

```jsx
// app/login/page.js
'use client';

import { useActionState } from 'react';
import { login } from '../actions';
import SubmitButton from '@/components/SubmitButton';

const initialState = {
  success: false,
  message: '',
};

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <div className="login-container">
      <h1>Prijava</h1>

      <form action={formAction}>
        {state.message && (
          <div className={`alert ${state.success ? 'success' : 'error'}`}>
            {state.message}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="vas@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input type="checkbox" name="rememberMe" />
            Zapamti me
          </label>
        </div>

        <SubmitButton>Prijavi se</SubmitButton>
      </form>

      <p className="demo-credentials">
        Demo: user@test.com / password123
      </p>
    </div>
  );
}
```

## 8. Forma za kreiranje posta

```javascript
// app/actions.js
"use server";

import { revalidatePath } from 'next/cache';

// Simulirana "baza" postova
let posts = [
  { id: 1, title: 'Prvi post', content: 'Sadržaj prvog posta', category: 'tech' },
];

export async function createPost(prevState, formData) {
  const title = formData.get('title')?.trim();
  const content = formData.get('content')?.trim();
  const category = formData.get('category');

  // Validacija
  const errors = {};

  if (!title || title.length < 5) {
    errors.title = 'Naslov mora imati bar 5 karaktera';
  }

  if (!content || content.length < 20) {
    errors.content = 'Sadržaj mora imati bar 20 karaktera';
  }

  if (!category) {
    errors.category = 'Odaberite kategoriju';
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Molimo ispravite greške',
      errors,
    };
  }

  // Simulacija čuvanja
  await new Promise(resolve => setTimeout(resolve, 1000));

  const newPost = {
    id: posts.length + 1,
    title,
    content,
    category,
    createdAt: new Date().toISOString(),
  };

  posts.push(newPost);

  // Revalidiraj stranicu sa listom postova
  revalidatePath('/posts');

  return {
    success: true,
    message: 'Post je uspješno kreiran!',
    errors: {},
    post: newPost,
  };
}

export async function getPosts() {
  return posts;
}
```

```jsx
// app/posts/new/page.js
'use client';

import { useActionState } from 'react';
import { createPost } from '../../actions';
import SubmitButton from '@/components/SubmitButton';

const initialState = {
  success: false,
  message: '',
  errors: {},
};

export default function NewPostPage() {
  const [state, formAction] = useActionState(createPost, initialState);

  return (
    <div className="new-post-container">
      <h1>Kreiraj novi post</h1>

      <form action={formAction}>
        {state.message && (
          <div className={`alert ${state.success ? 'success' : 'error'}`}>
            {state.message}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">Naslov</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Unesite naslov posta"
          />
          {state.errors?.title && (
            <span className="field-error">{state.errors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="category">Kategorija</label>
          <select id="category" name="category">
            <option value="">-- Odaberite --</option>
            <option value="tech">Tehnologija</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="news">Vijesti</option>
          </select>
          {state.errors?.category && (
            <span className="field-error">{state.errors.category}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="content">Sadržaj</label>
          <textarea
            id="content"
            name="content"
            rows="6"
            placeholder="Napišite sadržaj posta..."
          ></textarea>
          {state.errors?.content && (
            <span className="field-error">{state.errors.content}</span>
          )}
        </div>

        <SubmitButton>Objavi post</SubmitButton>
      </form>
    </div>
  );
}
```

---

## Rezime

### Ključne tačke

1. **Server Actions** eliminišu potrebu za API endpointima
2. **"use server"** direktiva označava server-side kod
3. **FormData** se automatski proslijeđuje Server Action-u
4. **useFormStatus** prati pending stanje forme (mora biti u child komponenti)
5. **useActionState** omogućava čitanje rezultata akcije i prikazivanje grešaka
6. **Validacija** se radi na serveru - sigurnija i pouzdanija
7. **Progressive Enhancement** - forme rade i bez JavaScript-a

### Poređenje pristupa

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TRADICIONALNO vs SERVER ACTIONS                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TRADICIONALNO:                                                     │
│  - useState za svako polje                                          │
│  - fetch() za slanje                                                │
│  - API endpoint                                                     │
│  - Ručni loading/error state                                        │
│  - Client-side validacija (nesigurna)                               │
│                                                                     │
│  SERVER ACTIONS:                                                    │
│  - Bez useState za polja                                            │
│  - action prop na <form>                                            │
│  - Bez API endpointa                                                │
│  - useFormStatus/useActionState                                     │
│  - Server-side validacija (sigurna)                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Korisni linkovi

- [Next.js Server Actions Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [React useActionState](https://react.dev/reference/react/useActionState)
- [Zod Validation](https://zod.dev/)
