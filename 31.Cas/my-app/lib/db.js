// ===========================================
// MongoDB Konekcija sa Mongoose
// ===========================================
// Ovaj fajl demonstrira kako se povezati sa MongoDB
// NAPOMENA: Za čas ćemo koristiti in-memory podatke
// ===========================================

import mongoose from "mongoose";

// Connection string - u produkciji koristiti .env
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/nextjs-demo";

// Cached konekcija za development (hot reload)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// ===========================================
// Funkcija za povezivanje
// ===========================================
export async function connectDB() {
  // Ako već imamo konekciju, vrati je
  if (cached.conn) {
    console.log("✅ Koristim postojeću MongoDB konekciju");
    return cached.conn;
  }

  // Ako nemamo pending promise, kreiraj novi
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("🔄 Povezujem se na MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ Uspješno povezan na MongoDB!");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ Greška pri povezivanju na MongoDB:", e);
    throw e;
  }

  return cached.conn;
}

// ===========================================
// Zašto ovakav pattern?
// ===========================================
// U developmentu, Next.js koristi hot reload
// Svaki put kad se fajl promijeni, modul se ponovo učitava
// Bez cache-iranja, dobili bismo previše konekcija
// "global" object ostaje isti između hot reload-a
// ===========================================
