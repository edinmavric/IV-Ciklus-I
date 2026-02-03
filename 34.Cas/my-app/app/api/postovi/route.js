// ============================================
// API ROUTE: /api/postovi
// ============================================
// Ova ruta obradjuje:
// - GET: Dohvatanje svih postova (sa paginacijom i filterima)
// - POST: Kreiranje novog posta (zahteva autentifikaciju)

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Post from '@/lib/models/Post';
import '@/lib/models/User'; // Potrebno za populate('autor')
import { auth } from '@/auth';

/**
 * GET /api/postovi
 * Dohvata sve objavljene postove sa paginacijom i filterima
 *
 * Query parametri:
 * - page: Broj stranice (default: 1)
 * - limit: Broj postova po stranici (default: 10, max: 50)
 * - kategorija: Filter po kategoriji
 * - tag: Filter po tagu
 * - search: Pretraga po naslovu i sadrzaju
 * - autor: Filter po autoru (ID)
 * - status: Filter po statusu (samo za autora ili admina)
 *
 * @example
 * GET /api/postovi?page=1&limit=10&kategorija=tehnologija
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Parsiranje query parametara
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit')) || 10));
    const kategorija = searchParams.get('kategorija');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const autorId = searchParams.get('autor');
    const status = searchParams.get('status');

    // Provera sesije za privatne filtere
    const session = await auth();

    // Gradimo query
    let query = {};

    // Default: samo objavljeni postovi za javnost
    // Ako je korisnik autor svojih postova ili admin, moze videti sve statuse
    if (status && session?.user) {
      // Ako trazi specificni status, proveri autorizaciju
      if (session.user.role === 'admin') {
        // Admin vidi sve
        query.status = status;
      } else if (autorId === session.user.id) {
        // Autor vidi svoje postove bilo kog statusa
        query.status = status;
        query.autor = autorId;
      } else {
        // Ostali vide samo objavljene
        query.status = 'objavljen';
      }
    } else {
      query.status = 'objavljen';
    }

    // Filter po kategoriji
    if (kategorija) {
      query.kategorija = kategorija;
    }

    // Filter po tagu
    if (tag) {
      query.tagovi = { $in: [tag.toLowerCase()] };
    }

    // Filter po autoru
    if (autorId && !query.autor) {
      query.autor = autorId;
    }

    // Full-text pretraga
    if (search) {
      query.$text = { $search: search };
    }

    // Izracunaj skip za paginaciju
    const skip = (page - 1) * limit;

    // Izvrsavanje upita
    const [postovi, ukupno] = await Promise.all([
      Post.find(query)
        .populate('autor', 'ime slika')
        .sort({ datumObjave: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // .lean() vraca obican JS objekat umesto Mongoose dokumenta (brze)
      Post.countDocuments(query),
    ]);

    // Izracunaj meta podatke za paginaciju
    const ukupnoStranica = Math.ceil(ukupno / limit);

    return NextResponse.json({
      success: true,
      data: postovi,
      meta: {
        ukupno,
        stranica: page,
        limit,
        ukupnoStranica,
        imaSledeca: page < ukupnoStranica,
        imaPrethodna: page > 1,
      },
    });
  } catch (error) {
    console.error('GET /api/postovi greska:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Greska pri dohvatanju postova',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/postovi
 * Kreira novi post
 *
 * Body (JSON):
 * {
 *   "naslov": "Naslov posta",
 *   "sadrzaj": "Sadrzaj posta...",
 *   "izvod": "Kratak opis",
 *   "kategorija": "tehnologija",
 *   "tagovi": ["javascript", "react"],
 *   "slika": "/images/post.jpg",
 *   "status": "draft" | "objavljen"
 * }
 *
 * Zahteva autentifikaciju (autor ili admin uloga)
 */
export async function POST(request) {
  try {
    // Provera autentifikacije
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Niste prijavljeni' },
        { status: 401 }
      );
    }

    // Provera uloge
    if (!['autor', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Nemate dozvolu za kreiranje postova' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Parsiranje body-a
    const body = await request.json();
    const { naslov, sadrzaj, izvod, kategorija, tagovi, slika, status } = body;

    // Validacija obaveznih polja
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

    // Kreiranje posta
    const noviPost = await Post.create({
      naslov: naslov.trim(),
      sadrzaj: sadrzaj.trim(),
      izvod: izvod.trim(),
      kategorija,
      tagovi: tagovi || [],
      slika: slika || '/images/default-post.jpg',
      status: status || 'draft',
      autor: session.user.id,
    });

    // Populate autor za response
    await noviPost.populate('autor', 'ime slika');

    return NextResponse.json(
      {
        success: true,
        message: 'Post uspesno kreiran',
        data: noviPost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/postovi greska:', error);

    // Mongoose validation error
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
        error: 'Greska pri kreiranju posta',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
