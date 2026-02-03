// ============================================
// SERVER ACTIONS - Postovi (CRUD operacije)
// ============================================
// Ove server akcije se koriste za kreiranje, azuriranje i brisanje postova.
// Demonstriraju integraciju Server Actions sa MongoDB i autentifikacijom.

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongoose';
import Post from '@/lib/models/Post';
import '@/lib/models/User'; // Potrebno za populate('autor')
import Komentar from '@/lib/models/Komentar';

/**
 * Pomocna funkcija za generisanje URL-friendly slug-a
 * @param {string} naslov - Naslov posta
 * @returns {string} - URL-friendly slug
 */
function generateSlug(naslov) {
  return naslov
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Ukloni dijakritike
    .replace(/[đ]/g, 'dj')
    .replace(/[ć]/g, 'c')
    .replace(/[č]/g, 'c')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[^a-z0-9\s-]/g, '') // Ukloni specijalne karaktere
    .replace(/\s+/g, '-') // Zameni razmake sa -
    .replace(/-+/g, '-') // Ukloni visestruke -
    .trim();
}

/**
 * Kreira novi post
 *
 * @param {Object} prevState - Prethodno stanje forme
 * @param {FormData} formData - Podaci iz forme
 * @returns {Object} - { success, message, errors, data }
 *
 * @example
 * // U komponenti:
 * const [state, formAction] = useActionState(kreirajPost, initialState);
 */
export async function kreirajPost(prevState, formData) {
  // Provera autentifikacije
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: 'Morate biti prijavljeni',
      errors: {},
    };
  }

  // Provera uloge
  if (!['autor', 'admin'].includes(session.user.role)) {
    return {
      success: false,
      message: 'Nemate dozvolu za kreiranje postova',
      errors: {},
    };
  }

  // Izvlacenje podataka iz forme
  const naslov = formData.get('naslov')?.trim();
  const sadrzaj = formData.get('sadrzaj')?.trim();
  const izvod = formData.get('izvod')?.trim();
  const kategorija = formData.get('kategorija');
  const tagovi = formData.get('tagovi')?.trim();
  const slika = formData.get('slika')?.trim();
  const status = formData.get('status') || 'draft';

  // Validacija
  const errors = {};

  if (!naslov) {
    errors.naslov = 'Naslov je obavezno polje';
  } else if (naslov.length < 5) {
    errors.naslov = 'Naslov mora imati najmanje 5 karaktera';
  } else if (naslov.length > 150) {
    errors.naslov = 'Naslov moze imati maksimalno 150 karaktera';
  }

  if (!sadrzaj) {
    errors.sadrzaj = 'Sadrzaj je obavezno polje';
  } else if (sadrzaj.length < 50) {
    errors.sadrzaj = `Sadrzaj mora imati najmanje 50 karaktera (trenutno: ${sadrzaj.length})`;
  }

  if (!izvod) {
    errors.izvod = 'Izvod je obavezno polje';
  } else if (izvod.length < 10) {
    errors.izvod = 'Izvod mora imati najmanje 10 karaktera';
  } else if (izvod.length > 300) {
    errors.izvod = 'Izvod moze imati maksimalno 300 karaktera';
  }

  if (!kategorija) {
    errors.kategorija = 'Odaberite kategoriju';
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Molimo ispravite greske u formi',
      errors,
    };
  }

  try {
    await dbConnect();

    // Parsiranje tagova (comma-separated string u array)
    const tagoviArray = tagovi
      ? tagovi.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    // Generisi slug od naslova
    let slug = generateSlug(naslov);

    // Proveri da li slug vec postoji i dodaj timestamp ako treba
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    // Kreiranje posta
    const noviPost = await Post.create({
      naslov,
      slug,
      sadrzaj,
      izvod,
      kategorija,
      tagovi: tagoviArray,
      slika: slika || '/images/default-post.jpg',
      status,
      autor: session.user.id,
    });

    // Populate autor za response
    await noviPost.populate('autor', 'ime slika');

    console.log('=> Kreiran novi post:', noviPost.naslov);

    // Revalidacija kesiranih stranica
    revalidatePath('/blog');
    revalidatePath('/dashboard/postovi');
    revalidatePath('/');

    return {
      success: true,
      message: status === 'objavljen' ? 'Post je uspesno objavljen!' : 'Post je sacuvan kao draft',
      errors: {},
      data: JSON.parse(JSON.stringify(noviPost)),
    };
  } catch (error) {
    console.error('Greska pri kreiranju posta:', error);

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
      message: 'Doslo je do greske pri kreiranju posta',
      errors: {},
    };
  }
}

/**
 * Azurira postojeci post
 *
 * @param {Object} prevState - Prethodno stanje forme
 * @param {FormData} formData - Podaci iz forme
 * @returns {Object} - { success, message, errors, data }
 */
export async function azurirajPost(prevState, formData) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: 'Morate biti prijavljeni',
      errors: {},
    };
  }

  const postId = formData.get('postId');

  if (!postId) {
    return {
      success: false,
      message: 'ID posta je obavezan',
      errors: {},
    };
  }

  try {
    await dbConnect();

    // Pronadi post
    const post = await Post.findById(postId);

    if (!post) {
      return {
        success: false,
        message: 'Post nije pronadjen',
        errors: {},
      };
    }

    // Provera autorizacije
    const isOwner = post.autor.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return {
        success: false,
        message: 'Nemate dozvolu za izmenu ovog posta',
        errors: {},
      };
    }

    // Izvlacenje podataka
    const naslov = formData.get('naslov')?.trim();
    const sadrzaj = formData.get('sadrzaj')?.trim();
    const izvod = formData.get('izvod')?.trim();
    const kategorija = formData.get('kategorija');
    const tagovi = formData.get('tagovi')?.trim();
    const slika = formData.get('slika')?.trim();
    const status = formData.get('status');

    // Validacija
    const errors = {};

    if (!naslov || naslov.length < 5) {
      errors.naslov = 'Naslov mora imati najmanje 5 karaktera';
    }

    if (!sadrzaj || sadrzaj.length < 50) {
      errors.sadrzaj = 'Sadrzaj mora imati najmanje 50 karaktera';
    }

    if (!izvod || izvod.length < 10) {
      errors.izvod = 'Izvod mora imati najmanje 10 karaktera';
    }

    if (!kategorija) {
      errors.kategorija = 'Odaberite kategoriju';
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: 'Molimo ispravite greske',
        errors,
      };
    }

    // Parsiranje tagova
    const tagoviArray = tagovi
      ? tagovi.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    // Azuriranje posta
    const naslovPromenjen = post.naslov !== naslov;
    post.naslov = naslov;
    post.sadrzaj = sadrzaj;
    post.izvod = izvod;
    post.kategorija = kategorija;
    post.tagovi = tagoviArray;
    if (slika) post.slika = slika;
    if (status) post.status = status;

    // Regenerisi slug ako je naslov promenjen
    if (naslovPromenjen) {
      let newSlug = generateSlug(naslov);
      const existingPost = await Post.findOne({ slug: newSlug, _id: { $ne: post._id } });
      if (existingPost) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      post.slug = newSlug;
    }

    await post.save();
    await post.populate('autor', 'ime slika');

    // Revalidacija
    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath('/dashboard/postovi');

    return {
      success: true,
      message: 'Post uspesno azuriran',
      errors: {},
      data: JSON.parse(JSON.stringify(post)),
    };
  } catch (error) {
    console.error('Greska pri azuriranju posta:', error);
    return {
      success: false,
      message: 'Doslo je do greske pri azuriranju posta',
      errors: {},
    };
  }
}

/**
 * Brise post
 *
 * @param {string} postId - ID posta za brisanje
 * @returns {Object} - { success, message }
 */
export async function obrisiPost(postId) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: 'Morate biti prijavljeni',
    };
  }

  try {
    await dbConnect();

    const post = await Post.findById(postId);

    if (!post) {
      return {
        success: false,
        message: 'Post nije pronadjen',
      };
    }

    // Provera autorizacije
    const isOwner = post.autor.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return {
        success: false,
        message: 'Nemate dozvolu za brisanje ovog posta',
      };
    }

    // Obrisi sve komentare posta
    await Komentar.deleteMany({ post: post._id });

    // Obrisi post
    await post.deleteOne();

    // Revalidacija
    revalidatePath('/blog');
    revalidatePath('/dashboard/postovi');

    return {
      success: true,
      message: 'Post i svi komentari su obrisani',
    };
  } catch (error) {
    console.error('Greska pri brisanju posta:', error);
    return {
      success: false,
      message: 'Doslo je do greske pri brisanju posta',
    };
  }
}

/**
 * Menja status posta (draft/objavljen/arhiviran)
 *
 * @param {string} postId - ID posta
 * @param {string} noviStatus - Novi status
 * @returns {Object} - { success, message, data }
 */
export async function promeniStatusPosta(postId, noviStatus) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: 'Morate biti prijavljeni',
    };
  }

  if (!['draft', 'objavljen', 'arhiviran'].includes(noviStatus)) {
    return {
      success: false,
      message: 'Nevalidan status',
    };
  }

  try {
    await dbConnect();

    const post = await Post.findById(postId);

    if (!post) {
      return {
        success: false,
        message: 'Post nije pronadjen',
      };
    }

    const isOwner = post.autor.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return {
        success: false,
        message: 'Nemate dozvolu za izmenu ovog posta',
      };
    }

    post.status = noviStatus;
    await post.save();

    // Revalidacija
    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath('/dashboard/postovi');

    return {
      success: true,
      message: `Status posta promenjen u "${noviStatus}"`,
      data: JSON.parse(JSON.stringify(post)),
    };
  } catch (error) {
    console.error('Greska pri promeni statusa:', error);
    return {
      success: false,
      message: 'Greska pri promeni statusa',
    };
  }
}

/**
 * Oznacava post kao istaknut (samo admin)
 *
 * @param {string} postId - ID posta
 * @param {boolean} istaknut - Da li je istaknut
 * @returns {Object} - { success, message }
 */
export async function postaviIstaknut(postId, istaknut) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return {
      success: false,
      message: 'Samo admin moze istaknuti post',
    };
  }

  try {
    await dbConnect();

    await Post.findByIdAndUpdate(postId, { istaknut });

    revalidatePath('/');
    revalidatePath('/blog');

    return {
      success: true,
      message: istaknut ? 'Post je istaknut' : 'Post vise nije istaknut',
    };
  } catch (error) {
    console.error('Greska:', error);
    return {
      success: false,
      message: 'Greska pri azuriranju',
    };
  }
}
