/**
 * Server Actions
 *
 * "use server" direktiva na vrhu fajla označava da su SVE funkcije
 * u ovom fajlu Server Actions - izvršavaju se na SERVERU.
 *
 * Prednosti:
 * - Nema potrebe za API endpointima
 * - Direktan pristup bazi podataka
 * - Sigurno čuvanje API ključeva i environment varijabli
 * - Automatska serijalizacija FormData
 */

'use server';

/**
 * Jednostavna login akcija
 *
 * Ovo je najjednostavniji primjer Server Action-a.
 * Prima FormData objekat automatski iz forme.
 *
 * @param {FormData} formData - Podaci iz forme
 * @returns {Object} - Rezultat akcije
 */
export async function simpleLogin(formData) {
  // Dohvatamo vrijednosti iz FormData
  // VAŽNO: formData.get() vraća string ili null
  const email = formData.get('email');
  const password = formData.get('password');

  // Simulacija delay-a (kao da radimo s bazom)
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Pravo:
  // await db.user.find(email === email)

  // Jednostavna provjera (u pravoj aplikaciji - provjera u bazi)
  if (email === 'user@test.com' && password === 'password123') {
    return {
      success: true,
      message: 'Uspješna prijava!',
    };
  }

  return {
    success: false,
    message: 'Pogrešan email ili password',
  };
}

/**
 * Login akcija sa validacijom (za useActionState)
 *
 * Kada koristimo useActionState, Server Action MORA primiti
 * previousState kao PRVI argument!
 *
 * @param {Object} previousState - Prethodno stanje (od useActionState)
 * @param {FormData} formData - Podaci iz forme
 * @returns {Object} - Novo stanje
 */
export async function loginWithValidation(previousState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const rememberMe = formData.get('rememberMe') === 'on';

  console.log('=== LOGIN SA VALIDACIJOM ===');
  console.log('Email:', email);
  console.log('Remember me:', rememberMe);

  // Objekt za greške po poljima
  const errors = {};

  // Validacija email-a
  if (!email) {
    errors.email = 'Email je obavezan';
  } else if (!email.includes('@')) {
    errors.email = 'Unesite validan email';
  }

  // Validacija password-a
  if (!password) {
    errors.password = 'Password je obavezan';
  } else if (password.length < 6) {
    errors.password = 'Password mora imati bar 6 karaktera';
  }

  // Ako ima grešaka, vrati ih
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Molimo ispravite greške u formi',
      errors,
    };
  }

  // Simulacija provjere u bazi
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Demo kredencijali
  if (email === 'user@test.com' && password === 'password123') {
    return {
      success: true,
      message: `Dobrodošli! Uspješno ste prijavljeni.`,
      errors: {},
    };
  }

  return {
    success: false,
    message:
      'Pogrešan email ili password. Probajte: user@test.com / password123',
    errors: {},
  };
}

/**
 * Kreiranje posta
 *
 * Kompletniji primjer sa validacijom više polja.
 *
 * @param {Object} previousState - Prethodno stanje
 * @param {FormData} formData - Podaci iz forme
 * @returns {Object} - Rezultat sa novim postom ili greškama
 */
export async function createPost(previousState, formData) {
  const title = formData.get('title')?.trim();
  const category = formData.get('category');
  const content = formData.get('content')?.trim();

  console.log('=== KREIRANJE POSTA ===');
  console.log('Naslov:', title);
  console.log('Kategorija:', category);
  console.log('Sadržaj:', content?.substring(0, 50) + '...');

  // Validacija
  const errors = {};

  // Validacija naslova
  if (!title) {
    errors.title = 'Naslov je obavezan';
  } else if (title.length < 5) {
    errors.title = 'Naslov mora imati bar 5 karaktera';
  } else if (title.length > 100) {
    errors.title = 'Naslov može imati maksimalno 100 karaktera';
  }

  // Validacija kategorije
  const validCategories = ['tech', 'lifestyle', 'news'];
  if (!category) {
    errors.category = 'Odaberite kategoriju';
  } else if (!validCategories.includes(category)) {
    errors.category = 'Nevalidna kategorija';
  }

  // Validacija sadržaja
  if (!content) {
    errors.content = 'Sadržaj je obavezan';
  } else if (content.length < 20) {
    errors.content = `Sadržaj mora imati bar 20 karaktera (trenutno: ${content.length})`;
  }

  // Ako ima grešaka
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Molimo ispravite greške',
      errors,
      post: null,
    };
  }

  // Simulacija čuvanja u bazu
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Kreiraj post
  const newPost = {
    id: Date.now(),
    title,
    category,
    content,
    createdAt: new Date().toISOString(),
  };

  console.log('Post kreiran:', newPost);

  return {
    success: true,
    message: 'Post je uspješno kreiran!',
    errors: {},
    post: newPost,
  };
}

/**
 * Slanje kontakt poruke
 *
 * Primjer forme za kontakt.
 *
 * @param {Object} previousState
 * @param {FormData} formData
 */
export async function sendContactMessage(previousState, formData) {
  const name = formData.get('name')?.trim();
  const email = formData.get('email')?.trim();
  const subject = formData.get('subject')?.trim();
  const message = formData.get('message')?.trim();

  console.log('=== KONTAKT PORUKA ===');
  console.log('Od:', name, `<${email}>`);
  console.log('Predmet:', subject);

  const errors = {};

  if (!name || name.length < 2) {
    errors.name = 'Ime mora imati bar 2 karaktera';
  }

  if (!email || !email.includes('@')) {
    errors.email = 'Unesite validan email';
  }

  if (!subject || subject.length < 3) {
    errors.subject = 'Predmet mora imati bar 3 karaktera';
  }

  if (!message || message.length < 10) {
    errors.message = 'Poruka mora imati bar 10 karaktera';
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Molimo popunite sva polja ispravno',
      errors,
    };
  }

  // Simulacija slanja
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    success: true,
    message: `Hvala ${name}! Vaša poruka je poslana.`,
    errors: {},
  };
}

/**
 * Newsletter pretplata
 *
 * Jednostavan primjer sa jednim poljem.
 */
export async function subscribeNewsletter(previousState, formData) {
  const email = formData.get('email')?.trim();

  console.log('=== NEWSLETTER PRETPLATA ===');
  console.log('Email:', email);

  if (!email) {
    return {
      success: false,
      message: 'Email je obavezan',
    };
  }

  if (!email.includes('@')) {
    return {
      success: false,
      message: 'Unesite validan email',
    };
  }

  // Simulacija
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulacija da email već postoji
  if (email === 'existing@test.com') {
    return {
      success: false,
      message: 'Ovaj email je već pretplaćen na newsletter',
    };
  }

  return {
    success: true,
    message: `Uspješno ste se pretplatili sa ${email}!`,
  };
}
