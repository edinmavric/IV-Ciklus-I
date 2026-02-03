// ============================================
// SERVER ACTIONS - Autentifikacija
// ============================================
// Ove server akcije se koriste za registraciju i prijavu korisnika.
// Koriste useActionState hook za upravljanje stanjem forme.

'use server';

import bcrypt from 'bcryptjs';
import { signIn } from '@/auth';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import { redirect } from 'next/navigation';

/**
 * Registracija novog korisnika
 *
 * @param {Object} prevState - Prethodno stanje forme
 * @param {FormData} formData - Podaci iz forme
 * @returns {Object} - { success, message, errors }
 *
 * @example
 * // U komponenti:
 * const [state, formAction] = useActionState(registrujKorisnika, initialState);
 * <form action={formAction}>...</form>
 */
export async function registrujKorisnika(prevState, formData) {
  // Izvlacenje podataka iz forme
  const ime = formData.get('ime')?.trim();
  const email = formData.get('email')?.trim().toLowerCase();
  const lozinka = formData.get('lozinka');
  const potvrdaLozinke = formData.get('potvrdaLozinke');

  // Validacija
  const errors = {};

  // Validacija imena
  if (!ime) {
    errors.ime = 'Ime je obavezno polje';
  } else if (ime.length < 2) {
    errors.ime = 'Ime mora imati najmanje 2 karaktera';
  } else if (ime.length > 50) {
    errors.ime = 'Ime moze imati maksimalno 50 karaktera';
  }

  // Validacija email-a
  if (!email) {
    errors.email = 'Email je obavezno polje';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Unesite validnu email adresu';
  }

  // Validacija lozinke
  if (!lozinka) {
    errors.lozinka = 'Lozinka je obavezno polje';
  } else if (lozinka.length < 6) {
    errors.lozinka = 'Lozinka mora imati najmanje 6 karaktera';
  } else if (lozinka.length > 50) {
    errors.lozinka = 'Lozinka moze imati maksimalno 50 karaktera';
  }

  // Validacija potvrde lozinke
  if (!potvrdaLozinke) {
    errors.potvrdaLozinke = 'Potvrdite lozinku';
  } else if (lozinka !== potvrdaLozinke) {
    errors.potvrdaLozinke = 'Lozinke se ne podudaraju';
  }

  // Ako ima gresaka, vrati ih
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Molimo ispravite greske u formi',
      errors,
    };
  }

  try {
    await dbConnect();

    // Proveri da li korisnik vec postoji
    const postojeciKorisnik = await User.findOne({ email });

    if (postojeciKorisnik) {
      return {
        success: false,
        message: 'Korisnik sa ovim email-om vec postoji',
        errors: {
          email: 'Ova email adresa je vec registrovana',
        },
      };
    }

    // Hash lozinke sa bcrypt (12 rundi je dobar balans sigurnosti i brzine)
    const hashedPassword = await bcrypt.hash(lozinka, 12);

    // Kreiraj novog korisnika
    const noviKorisnik = await User.create({
      ime,
      email,
      lozinka: hashedPassword,
      uloga: 'korisnik', // Default uloga
    });

    console.log('=> Registrovan novi korisnik:', noviKorisnik.email);

    return {
      success: true,
      message: 'Registracija uspesna! Mozete se prijaviti.',
      errors: {},
    };
  } catch (error) {
    console.error('Greska pri registraciji:', error);

    // Mongoose duplicate key error
    if (error.code === 11000) {
      return {
        success: false,
        message: 'Korisnik sa ovim email-om vec postoji',
        errors: {
          email: 'Ova email adresa je vec registrovana',
        },
      };
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return {
        success: false,
        message: 'Validacija nije uspela',
        errors: validationErrors,
      };
    }

    return {
      success: false,
      message: 'Doslo je do greske. Pokusajte ponovo.',
      errors: {},
    };
  }
}

/**
 * Prijava korisnika
 *
 * @param {Object} prevState - Prethodno stanje forme
 * @param {FormData} formData - Podaci iz forme
 * @returns {Object} - { success, message, errors }
 */
export async function prijaviKorisnika(prevState, formData) {
  const email = formData.get('email')?.trim().toLowerCase();
  const lozinka = formData.get('lozinka');
  const callbackUrl = formData.get('callbackUrl') || '/dashboard';

  // Validacija
  const errors = {};

  if (!email) {
    errors.email = 'Email je obavezno polje';
  }

  if (!lozinka) {
    errors.lozinka = 'Lozinka je obavezno polje';
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Molimo unesite email i lozinku',
      errors,
    };
  }

  try {
    // Koristi NextAuth signIn funkciju
    const result = await signIn('credentials', {
      email,
      lozinka,
      redirect: false,
    });

    // signIn vraca undefined ako je uspesno, ili error objekat
    if (result?.error) {
      return {
        success: false,
        message: 'Pogresni kredencijali',
        errors: {
          email: 'Proverite email i lozinku',
        },
      };
    }

    // Uspesna prijava - redirect ce biti obradjeno na klijentu
    return {
      success: true,
      message: 'Prijava uspesna!',
      errors: {},
      redirectTo: callbackUrl,
    };
  } catch (error) {
    console.error('Greska pri prijavi:', error);

    // NextAuth baca NEXT_REDIRECT error kad je sve ok i treba redirect
    // To nije prava greska
    if (error.message?.includes('NEXT_REDIRECT')) {
      redirect(callbackUrl);
    }

    return {
      success: false,
      message: 'Pogresni kredencijali',
      errors: {
        email: 'Proverite email i lozinku',
      },
    };
  }
}

/**
 * Azuriranje profila korisnika
 *
 * @param {Object} prevState - Prethodno stanje forme
 * @param {FormData} formData - Podaci iz forme
 * @returns {Object} - { success, message, errors }
 */
export async function azurirajProfil(prevState, formData) {
  const userId = formData.get('userId');
  const ime = formData.get('ime')?.trim();
  const biografija = formData.get('biografija')?.trim();
  const slika = formData.get('slika')?.trim();

  // Validacija
  const errors = {};

  if (!ime || ime.length < 2) {
    errors.ime = 'Ime mora imati najmanje 2 karaktera';
  }

  if (biografija && biografija.length > 500) {
    errors.biografija = 'Biografija moze imati maksimalno 500 karaktera';
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Molimo ispravite greske',
      errors,
    };
  }

  try {
    await dbConnect();

    const azuriraniKorisnik = await User.findByIdAndUpdate(
      userId,
      {
        ime,
        biografija: biografija || '',
        ...(slika && { slika }),
      },
      { new: true, runValidators: true }
    ).select('-lozinka');

    if (!azuriraniKorisnik) {
      return {
        success: false,
        message: 'Korisnik nije pronadjen',
        errors: {},
      };
    }

    return {
      success: true,
      message: 'Profil uspesno azuriran',
      errors: {},
      data: JSON.parse(JSON.stringify(azuriraniKorisnik)),
    };
  } catch (error) {
    console.error('Greska pri azuriranju profila:', error);
    return {
      success: false,
      message: 'Greska pri azuriranju profila',
      errors: {},
    };
  }
}

/**
 * Promena lozinke
 *
 * @param {Object} prevState - Prethodno stanje forme
 * @param {FormData} formData - Podaci iz forme
 * @returns {Object} - { success, message, errors }
 */
export async function promeniLozinku(prevState, formData) {
  const userId = formData.get('userId');
  const trenutnaLozinka = formData.get('trenutnaLozinka');
  const novaLozinka = formData.get('novaLozinka');
  const potvrdaNoveLozinke = formData.get('potvrdaNoveLozinke');

  // Validacija
  const errors = {};

  if (!trenutnaLozinka) {
    errors.trenutnaLozinka = 'Unesite trenutnu lozinku';
  }

  if (!novaLozinka) {
    errors.novaLozinka = 'Unesite novu lozinku';
  } else if (novaLozinka.length < 6) {
    errors.novaLozinka = 'Nova lozinka mora imati najmanje 6 karaktera';
  }

  if (novaLozinka !== potvrdaNoveLozinke) {
    errors.potvrdaNoveLozinke = 'Lozinke se ne podudaraju';
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Molimo ispravite greske',
      errors,
    };
  }

  try {
    await dbConnect();

    // Dohvati korisnika sa lozinkom
    const korisnik = await User.findById(userId).select('+lozinka');

    if (!korisnik) {
      return {
        success: false,
        message: 'Korisnik nije pronadjen',
        errors: {},
      };
    }

    // Proveri trenutnu lozinku
    const isCurrentPasswordValid = await bcrypt.compare(
      trenutnaLozinka,
      korisnik.lozinka
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        message: 'Trenutna lozinka nije tacna',
        errors: {
          trenutnaLozinka: 'Pogresna trenutna lozinka',
        },
      };
    }

    // Hash nove lozinke
    korisnik.lozinka = await bcrypt.hash(novaLozinka, 12);
    await korisnik.save();

    return {
      success: true,
      message: 'Lozinka uspesno promenjena',
      errors: {},
    };
  } catch (error) {
    console.error('Greska pri promeni lozinke:', error);
    return {
      success: false,
      message: 'Greska pri promeni lozinke',
      errors: {},
    };
  }
}
