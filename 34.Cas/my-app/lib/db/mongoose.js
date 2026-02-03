// ============================================
// MONGOOSE KONEKCIJA - Sa kesianjem konekcije
// ============================================
// Ovaj pattern sprecava visestruke konekcije u development modu
// jer Next.js hot reload kreira nove instance modula.
// Bez ovog patterna, svaki hot reload bi kreirao novu konekciju
// i brzo bi doslo do iscrpljivanja MongoDB connection pool-a.

import mongoose from 'mongoose';

// URI za MongoDB - koristi environment varijablu ili default localhost
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogmaster';

// Provera da li je URI definisan
if (!MONGODB_URI) {
  throw new Error(
    'Molimo definisati MONGODB_URI environment varijablu u .env.local fajlu'
  );
}

/**
 * Global varijabla za cuvanje konekcije izmedju hot reload-a.
 * U production modu ovo nije potrebno, ali u development modu
 * sprecava kreiranje novih konekcija pri svakoj promeni koda.
 *
 * @type {{ conn: mongoose.Connection | null, promise: Promise<mongoose> | null }}
 */
let cached = global.mongoose;

// Inicijalizuj cache ako ne postoji
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Funkcija za konektovanje na MongoDB
 * Koristi singleton pattern - vraca postojecu konekciju ako postoji,
 * inace kreira novu.
 *
 * @returns {Promise<mongoose>} Mongoose instanca
 *
 * @example
 * // Koriscenje u API ruti ili Server komponenti
 * import dbConnect from '@/lib/db/mongoose';
 *
 * export async function GET() {
 *   await dbConnect();
 *   // Sada mozete koristiti Mongoose modele
 * }
 */
async function dbConnect() {
  // Ako vec imamo aktivnu konekciju, vrati je
  if (cached.conn) {
    console.log('=> Koriscenje postojece MongoDB konekcije');
    return cached.conn;
  }

  // Ako nemamo pending promise, kreiraj novu konekciju
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,      // Ne cekaj na konekciju za komande
      maxPoolSize: 10,            // Maksimalan broj konekcija u pool-u
      serverSelectionTimeoutMS: 5000,  // Timeout za selekciju servera (5s)
      socketTimeoutMS: 45000,     // Timeout za socket operacije (45s)
    };

    console.log('=> Kreiranje nove MongoDB konekcije...');
    console.log(`=> Povezivanje na: ${MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`);

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('=> MongoDB uspesno konektovan!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Resetuj promise ako je doslo do greske da bi sledeci poziv pokusao ponovo
    cached.promise = null;
    console.error('=> MongoDB konekcija neuspesna:', e.message);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
