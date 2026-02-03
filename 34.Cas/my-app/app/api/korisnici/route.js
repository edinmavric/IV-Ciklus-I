// ============================================
// API ROUTE: /api/korisnici
// ============================================
// Ova ruta obradjuje operacije nad korisnicima (samo za admine):
// - GET: Dohvatanje svih korisnika sa paginacijom
// - POST: Kreiranje novog korisnika (admin)

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import { auth } from '@/auth';

/**
 * GET /api/korisnici
 * Dohvata sve korisnike (samo admin)
 *
 * Query parametri:
 * - page: Broj stranice (default: 1)
 * - limit: Broj korisnika po stranici (default: 20)
 * - uloga: Filter po ulozi
 * - search: Pretraga po imenu ili email-u
 * - aktivan: Filter po aktivnosti (true/false)
 */
export async function GET(request) {
  try {
    // Provera autentifikacije i autorizacije
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Niste prijavljeni' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Nemate dozvolu za pristup' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Parsiranje query parametara
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit')) || 20));
    const uloga = searchParams.get('uloga');
    const search = searchParams.get('search');
    const aktivan = searchParams.get('aktivan');

    // Gradimo query
    let query = {};

    if (uloga) {
      query.uloga = uloga;
    }

    if (aktivan !== null && aktivan !== undefined) {
      query.aktivan = aktivan === 'true';
    }

    if (search) {
      query.$or = [
        { ime: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Izvrsavanje upita
    const [korisnici, ukupno] = await Promise.all([
      User.find(query)
        .select('-lozinka') // Nikad ne vracaj lozinku
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const ukupnoStranica = Math.ceil(ukupno / limit);

    return NextResponse.json({
      success: true,
      data: korisnici,
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
    console.error('GET /api/korisnici greska:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Greska pri dohvatanju korisnika',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/korisnici
 * Kreira novog korisnika (samo admin)
 *
 * Body (JSON):
 * {
 *   "ime": "Ime Korisnika",
 *   "email": "korisnik@email.com",
 *   "lozinka": "lozinka123",
 *   "uloga": "korisnik" | "autor" | "admin",
 *   "biografija": "Kratka biografija",
 *   "slika": "/images/avatar.jpg"
 * }
 */
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Niste prijavljeni' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Nemate dozvolu za kreiranje korisnika' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { ime, email, lozinka, uloga, biografija, slika } = body;

    // Validacija
    const errors = {};

    if (!ime || ime.trim().length < 2) {
      errors.ime = 'Ime mora imati najmanje 2 karaktera';
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Unesite validnu email adresu';
    }

    if (!lozinka || lozinka.length < 6) {
      errors.lozinka = 'Lozinka mora imati najmanje 6 karaktera';
    }

    if (uloga && !['korisnik', 'autor', 'admin'].includes(uloga)) {
      errors.uloga = 'Uloga mora biti: korisnik, autor ili admin';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validacija nije uspela', errors },
        { status: 400 }
      );
    }

    // Proveri da li email vec postoji
    const postojeci = await User.findOne({ email: email.toLowerCase() });
    if (postojeci) {
      return NextResponse.json(
        { success: false, error: 'Korisnik sa ovim email-om vec postoji' },
        { status: 409 }
      );
    }

    // Hash lozinke
    const hashedPassword = await bcrypt.hash(lozinka, 12);

    // Kreiranje korisnika
    const noviKorisnik = await User.create({
      ime: ime.trim(),
      email: email.toLowerCase().trim(),
      lozinka: hashedPassword,
      uloga: uloga || 'korisnik',
      biografija: biografija?.trim() || '',
      slika: slika || '/images/default-avatar.png',
    });

    // Ne vracaj lozinku u responsu
    const korisnikBezLozinke = noviKorisnik.toObject();
    delete korisnikBezLozinke.lozinka;

    return NextResponse.json(
      {
        success: true,
        message: 'Korisnik uspesno kreiran',
        data: korisnikBezLozinke,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/korisnici greska:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Korisnik sa ovim email-om vec postoji' },
        { status: 409 }
      );
    }

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
        error: 'Greska pri kreiranju korisnika',
      },
      { status: 500 }
    );
  }
}
