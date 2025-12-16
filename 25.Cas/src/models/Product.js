import mongoose from "mongoose";

// ============================================================
// PRODUCT SCHEMA SA INDEKSIMA
// ============================================================

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Naziv proizvoda je obavezan"],
      trim: true,
      minlength: [2, "Naziv mora imati najmanje 2 karaktera"],
      maxlength: [100, "Naziv ne moze imati vise od 100 karaktera"],
    },
    sku: {
      type: String,
      required: [true, "SKU je obavezan"],
      uppercase: true,
      trim: true,
      // unique: true - Možemo ovde ili dole sa schema.index()
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Opis ne moze imati vise od 1000 karaktera"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Cena je obavezna"],
      min: [0.01, "Cena mora biti veca od 0"],
    },
    category: {
      type: String,
      required: [true, "Kategorija je obavezna"],
      enum: {
        values: ["electronics", "footwear", "gaming", "clothing", "accessories"],
        message: "Kategorija mora biti: electronics, footwear, gaming, clothing ili accessories",
      },
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock ne moze biti negativan"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating ne moze biti manji od 0"],
      max: [5, "Rating ne moze biti veci od 5"],
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEKSI - Različiti tipovi
// ============================================================

// 1. SINGLE FIELD INDEX - Jednostavni indeks na jednom polju
// Koristi se za: pretrage po kategoriji
productSchema.index({ category: 1 });

// 2. UNIQUE INDEX - Garantuje jedinstvenost
// Koristi se za: SKU mora biti jedinstven
productSchema.index({ sku: 1 }, { unique: true });

// 3. COMPOUND INDEX - Složeni indeks na više polja
// Koristi se za: pretraga po kategoriji + sortiranje po ceni
// REDOSLED JE BITAN! Prati ESR pravilo (Equality, Sort, Range)
productSchema.index({ category: 1, price: -1 });
// name: category_1_price_-1

// 4. COMPOUND INDEX za listing aktivnih proizvoda
// Koristi se za: lista aktivnih proizvoda sortiranih po datumu
productSchema.index({ isActive: 1, createdAt: -1 });

// 5. TEXT INDEX - Za full-text pretragu
// Koristi se za: pretraga po imenu i opisu
productSchema.index(
  { name: "text", description: "text" },
  {
    name: "product_text_search",
    weights: {
      name: 10,        // Ime ima veći značaj
      description: 5,  // Opis ima manji značaj
    },
  }
);

// 6. COMPOUND INDEX za featured proizvode u kategoriji
// Koristi se za: homepage prikaz featured proizvoda
productSchema.index({ isFeatured: 1, category: 1, rating: -1 });

// 7. PARTIAL INDEX - Indeksira samo dokumente koji zadovoljavaju uslov
// Koristi se za: brza pretraga samo aktivnih proizvoda po brandu
productSchema.index(
  { brand: 1 },
  {
    name: "active_products_brand",
    partialFilterExpression: { isActive: true },
  }
);

// 8. INDEX na array polju
// Koristi se za: pretraga po tagovima
productSchema.index({ tags: 1 });

// 9. COMPOUND INDEX za filtriranje i sortiranje
// Koristi se za: proizvodi u kategoriji sa određenim stockom, sortirani po ratingu
productSchema.index({ category: 1, stock: 1, rating: -1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
