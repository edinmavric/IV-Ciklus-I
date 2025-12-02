import mongoose from "mongoose";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PRODUCT MODEL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Polja:
 * ------
 * - name: Ime proizvoda
 * - price: Cena proizvoda
 * - category: Kategorija
 * - description: Opis
 * - imageUrl: PUTANJA do slike (ne sam fajl!)
 *
 * VAŽNO za upload:
 * ----------------
 * U imageUrl čuvamo SAMO PUTANJU (npr. "uploads/123-slika.jpg")
 * Sam fajl je sačuvan na disku, ne u bazi!
 */

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ime proizvoda je obavezno"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Cena je obavezna"],
      min: [0, "Cena ne može biti negativna"],
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    /**
     * imageUrl - Putanja do slike
     * ---------------------------
     * Čuvamo SAMO putanju, npr: "uploads/1701234567890-laptop.jpg"
     *
     * Zašto ne čuvamo sam fajl?
     * -------------------------
     * 1. Baza bi postala ogromna (svaka slika 1-5MB)
     * 2. Query-ji bi bili sporiji
     * 3. Teže bi bilo servirati slike
     *
     * Ovako:
     * - Fajl je na disku (brz pristup)
     * - U bazi je samo string (mala baza, brzi query-ji)
     */
    imageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatski createdAt i updatedAt
  }
);

export default mongoose.model("Product", productSchema);
