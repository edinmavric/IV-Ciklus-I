// ============================================
// API ROUTE: /api/postovi/[id]
// ============================================
// Ova ruta obradjuje operacije nad pojedinacnim postom:
// - GET: Dohvatanje posta po ID-u ili slug-u
// - PUT: Azuriranje celog posta
// - PATCH: Delimicno azuriranje posta
// - DELETE: Brisanje posta

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/mongoose';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User'; // Potrebno za populate('autor')
import Komentar from '@/lib/models/Komentar';
import { auth } from '@/auth';

/**
 * Pomocna funkcija za pronalazenje posta po ID-u ili slug-u
 * @param {string} identifier - ID ili slug
 * @returns {Promise<Post|null>}
 */
async function findPost(identifier) {
  // Proveri da li je validan ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return Post.findById(identifier);
  }
  // Inace pretpostavi da je slug
  return Post.findOne({ slug: identifier });
}

/**
 * GET /api/postovi/[id]
 * Dohvata pojedinacni post po ID-u ili slug-u
 *
 * @param {Request} request
 * @param {Object} context - { params: { id: string } }
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    const post = await findPost(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post nije pronadjen' },
        { status: 404 }
      );
    }

    // Populate autor
    await post.populate('autor', 'ime slika biografija');

    // Dohvati broj komentara
    const brojKomentara = await Komentar.countDocuments({
      post: post._id,
      odobren: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...post.toObject(),
        brojKomentara,
      },
    });
  } catch (error) {
    console.error('GET /api/postovi/[id] greska:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Greska pri dohvatanju posta',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/postovi/[id]
 * Zamenjuje kompletan post (sva polja moraju biti poslata)
 *
 * Zahteva autentifikaciju i autorizaciju (autor posta ili admin)
 */
export async function PUT(request, { params }) {
  try {
    // Provera autentifikacije
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Niste prijavljeni' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const post = await findPost(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post nije pronadjen' },
        { status: 404 }
      );
    }

    // Provera autorizacije
    const isOwner = post.autor.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Nemate dozvolu za izmenu ovog posta' },
        { status: 403 }
      );
    }

    // Parsiranje body-a
    const body = await request.json();
    const { naslov, sadrzaj, izvod, kategorija, tagovi, slika, status, istaknut } = body;

    // Validacija
    const errors = {};

    if (!naslov || naslov.trim().length < 5) {
      errors.naslov = 'Naslov mora imati najmanje 5 karaktera';
    }

    if (!sadrzaj || sadrzaj.trim().length < 50) {
      errors.sadrzaj = 'Sadrzaj mora imati najmanje 50 karaktera';
    }

    if (!izvod || izvod.trim().length < 10) {
      errors.izvod = 'Izvod mora imati najmanje 10 karaktera';
    }

    if (!kategorija) {
      errors.kategorija = 'Kategorija je obavezna';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validacija nije uspela', errors },
        { status: 400 }
      );
    }

    // Azuriranje posta
    post.naslov = naslov.trim();
    post.sadrzaj = sadrzaj.trim();
    post.izvod = izvod.trim();
    post.kategorija = kategorija;
    post.tagovi = tagovi || [];
    post.slika = slika || post.slika;
    post.status = status || post.status;

    // Samo admin moze menjati istaknut status
    if (isAdmin && typeof istaknut === 'boolean') {
      post.istaknut = istaknut;
    }

    await post.save();
    await post.populate('autor', 'ime slika');

    return NextResponse.json({
      success: true,
      message: 'Post uspesno azuriran',
      data: post,
    });
  } catch (error) {
    console.error('PUT /api/postovi/[id] greska:', error);

    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return NextResponse.json(
        { success: false, error: 'Validacija nije uspela', errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Greska pri azuriranju posta',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/postovi/[id]
 * Delimicno azuriranje posta (samo poslata polja)
 *
 * Zahteva autentifikaciju i autorizaciju
 */
export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Niste prijavljeni' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const post = await findPost(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post nije pronadjen' },
        { status: 404 }
      );
    }

    // Provera autorizacije
    const isOwner = post.autor.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Nemate dozvolu za izmenu ovog posta' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Polja koja se mogu menjati
    const allowedFields = ['naslov', 'sadrzaj', 'izvod', 'kategorija', 'tagovi', 'slika', 'status'];
    const adminOnlyFields = ['istaknut'];

    // Azuriraj samo poslata polja
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        post[field] = body[field];
      }
    }

    // Admin-only polja
    if (isAdmin) {
      for (const field of adminOnlyFields) {
        if (body[field] !== undefined) {
          post[field] = body[field];
        }
      }
    }

    await post.save();
    await post.populate('autor', 'ime slika');

    return NextResponse.json({
      success: true,
      message: 'Post uspesno azuriran',
      data: post,
    });
  } catch (error) {
    console.error('PATCH /api/postovi/[id] greska:', error);

    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return NextResponse.json(
        { success: false, error: 'Validacija nije uspela', errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Greska pri azuriranju posta',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/postovi/[id]
 * Brise post i sve njegove komentare
 *
 * Zahteva autentifikaciju i autorizaciju
 */
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Niste prijavljeni' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const post = await findPost(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post nije pronadjen' },
        { status: 404 }
      );
    }

    // Provera autorizacije
    const isOwner = post.autor.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Nemate dozvolu za brisanje ovog posta' },
        { status: 403 }
      );
    }

    // Obrisi sve komentare posta
    await Komentar.deleteMany({ post: post._id });

    // Obrisi post
    await post.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Post i svi komentari uspesno obrisani',
      data: { id: post._id, naslov: post.naslov },
    });
  } catch (error) {
    console.error('DELETE /api/postovi/[id] greska:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Greska pri brisanju posta',
      },
      { status: 500 }
    );
  }
}
