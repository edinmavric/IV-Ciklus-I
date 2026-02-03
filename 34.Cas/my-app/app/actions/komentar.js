// ============================================
// SERVER ACTIONS - Komentari
// ============================================
// Ove server akcije se koriste za rad sa komentarima na postovima.
// Podrzavaju ugnjezdene (nested) komentare.

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongoose';
import Komentar from '@/lib/models/Komentar';
import Post from '@/lib/models/Post';
import '@/lib/models/User'; // Potrebno za populate('autor')

/**
 * Dodaje novi komentar na post
 *
 * @param {Object} prevState - Prethodno stanje forme
 * @param {FormData} formData - Podaci iz forme
 * @returns {Object} - { success, message, errors, data }
 *
 * @example
 * // U komponenti:
 * const [state, formAction] = useActionState(dodajKomentar, initialState);
 */
export async function dodajKomentar(prevState, formData) {
  // Provera autentifikacije
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: 'Morate biti prijavljeni da biste komentarisali',
      errors: {},
    };
  }

  // Izvlacenje podataka iz forme
  const sadrzaj = formData.get('sadrzaj')?.trim();
  const postId = formData.get('postId');
  const roditeljId = formData.get('roditeljId') || null;

  // Validacija
  const errors = {};

  if (!sadrzaj) {
    errors.sadrzaj = 'Komentar ne moze biti prazan';
  } else if (sadrzaj.length < 3) {
    errors.sadrzaj = 'Komentar mora imati najmanje 3 karaktera';
  } else if (sadrzaj.length > 1000) {
    errors.sadrzaj = 'Komentar moze imati maksimalno 1000 karaktera';
  }

  if (!postId) {
    errors.postId = 'ID posta je obavezan';
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

    // Proveri da li post postoji i da li je objavljen
    const post = await Post.findById(postId);

    if (!post) {
      return {
        success: false,
        message: 'Post nije pronadjen',
        errors: {},
      };
    }

    if (post.status !== 'objavljen') {
      return {
        success: false,
        message: 'Ne mozete komentarisati neobjavljen post',
        errors: {},
      };
    }

    // Ako je odgovor na drugi komentar, proveri da li taj komentar postoji
    if (roditeljId) {
      const roditeljKomentar = await Komentar.findById(roditeljId);
      if (!roditeljKomentar) {
        return {
          success: false,
          message: 'Komentar na koji odgovarate ne postoji',
          errors: {},
        };
      }
    }

    // Kreiraj komentar
    const noviKomentar = await Komentar.create({
      sadrzaj,
      post: postId,
      autor: session.user.id,
      roditeljKomentar: roditeljId,
    });

    // Populate autor za response
    await noviKomentar.populate('autor', 'ime slika');

    console.log('=> Dodat novi komentar na post:', post.naslov);

    // Revalidacija stranice posta
    revalidatePath(`/blog/${post.slug}`);

    return {
      success: true,
      message: 'Komentar uspesno dodat',
      errors: {},
      data: JSON.parse(JSON.stringify(noviKomentar)),
    };
  } catch (error) {
    console.error('Greska pri dodavanju komentara:', error);

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
      message: 'Doslo je do greske pri dodavanju komentara',
      errors: {},
    };
  }
}

/**
 * Azurira postojeci komentar
 *
 * @param {Object} prevState - Prethodno stanje forme
 * @param {FormData} formData - Podaci iz forme
 * @returns {Object} - { success, message, errors, data }
 */
export async function azurirajKomentar(prevState, formData) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: 'Morate biti prijavljeni',
      errors: {},
    };
  }

  const komentarId = formData.get('komentarId');
  const sadrzaj = formData.get('sadrzaj')?.trim();

  // Validacija
  const errors = {};

  if (!sadrzaj || sadrzaj.length < 3) {
    errors.sadrzaj = 'Komentar mora imati najmanje 3 karaktera';
  } else if (sadrzaj.length > 1000) {
    errors.sadrzaj = 'Komentar moze imati maksimalno 1000 karaktera';
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

    const komentar = await Komentar.findById(komentarId).populate('post', 'slug');

    if (!komentar) {
      return {
        success: false,
        message: 'Komentar nije pronadjen',
        errors: {},
      };
    }

    // Provera autorizacije - samo autor ili admin
    const isAuthor = komentar.autor.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return {
        success: false,
        message: 'Nemate dozvolu za izmenu ovog komentara',
        errors: {},
      };
    }

    // Azuriraj komentar
    komentar.sadrzaj = sadrzaj;
    komentar.editovan = true;
    await komentar.save();

    // Revalidacija
    if (komentar.post?.slug) {
      revalidatePath(`/blog/${komentar.post.slug}`);
    }

    return {
      success: true,
      message: 'Komentar uspesno azuriran',
      errors: {},
      data: JSON.parse(JSON.stringify(komentar)),
    };
  } catch (error) {
    console.error('Greska pri azuriranju komentara:', error);
    return {
      success: false,
      message: 'Greska pri azuriranju komentara',
      errors: {},
    };
  }
}

/**
 * Brise komentar i sve odgovore na njega
 *
 * @param {string} komentarId - ID komentara za brisanje
 * @returns {Object} - { success, message }
 */
export async function obrisiKomentar(komentarId) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: 'Morate biti prijavljeni',
    };
  }

  try {
    await dbConnect();

    const komentar = await Komentar.findById(komentarId).populate('post', 'slug');

    if (!komentar) {
      return {
        success: false,
        message: 'Komentar nije pronadjen',
      };
    }

    // Provera autorizacije
    const isAuthor = komentar.autor.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return {
        success: false,
        message: 'Nemate dozvolu za brisanje ovog komentara',
      };
    }

    const postSlug = komentar.post?.slug;

    // Obrisi sve odgovore na komentar (rekurzivno)
    await deleteKomentarAndReplies(komentar._id);

    // Revalidacija
    if (postSlug) {
      revalidatePath(`/blog/${postSlug}`);
    }

    return {
      success: true,
      message: 'Komentar i svi odgovori su obrisani',
    };
  } catch (error) {
    console.error('Greska pri brisanju komentara:', error);
    return {
      success: false,
      message: 'Greska pri brisanju komentara',
    };
  }
}

/**
 * Pomocna funkcija za rekurzivno brisanje komentara i odgovora
 * @param {string} komentarId - ID komentara
 */
async function deleteKomentarAndReplies(komentarId) {
  // Pronadji sve odgovore
  const odgovori = await Komentar.find({ roditeljKomentar: komentarId });

  // Rekurzivno obrisi svaki odgovor
  for (const odgovor of odgovori) {
    await deleteKomentarAndReplies(odgovor._id);
  }

  // Obrisi sam komentar
  await Komentar.findByIdAndDelete(komentarId);
}

/**
 * Dohvata komentare za post (za server-side rendering)
 *
 * @param {string} postId - ID posta
 * @returns {Promise<Array>} - Lista komentara
 */
export async function dohvatiKomentare(postId) {
  try {
    await dbConnect();

    const komentari = await Komentar.findByPost(postId);

    return JSON.parse(JSON.stringify(komentari));
  } catch (error) {
    console.error('Greska pri dohvatanju komentara:', error);
    return [];
  }
}
