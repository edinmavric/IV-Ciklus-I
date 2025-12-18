import mongoose from "mongoose";

// ═══════════════════════════════════════════════════════════════════
// PRODUCT MODEL - Primer pravilnog definisanja indeksa
// ═══════════════════════════════════════════════════════════════════

const productSchema = new mongoose.Schema(
  {
    // ─────────────────────────────────────────────────────────────────
    // POLJA - bez inline indeksa (osim za jasne unique constrainte)
    // ─────────────────────────────────────────────────────────────────

    name: {
      type: String,
      required: [true, "Naziv proizvoda je obavezan"],
      trim: true,
      minlength: [2, "Naziv mora imati najmanje 2 karaktera"],
      maxlength: [200, "Naziv ne može imati više od 200 karaktera"],
    },

    sku: {
      type: String,
      required: [true, "SKU je obavezan"],
      uppercase: true,
      trim: true,
      // NAPOMENA: unique constraint definišemo dole sa schema.index()
      // da bi sve indekse imali na jednom mestu
    },

    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Opis ne može imati više od 2000 karaktera"],
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Cena je obavezna"],
      min: [0.01, "Cena mora biti veća od 0"],
    },

    salePrice: {
      type: Number,
      min: [0, "Akcijska cena ne može biti negativna"],
    },

    category: {
      type: String,
      required: [true, "Kategorija je obavezna"],
      enum: {
        values: ["electronics", "footwear", "gaming", "clothing", "accessories"],
        message: "Nevalidna kategorija",
      },
    },

    subcategory: {
      type: String,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock ne može biti negativan"],
    },

    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating ne može biti manji od 0"],
      max: [5, "Rating ne može biti veći od 5"],
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ═══════════════════════════════════════════════════════════════════
// INDEKSI - Svi na jednom mestu, organizovani i dokumentovani
// ═══════════════════════════════════════════════════════════════════

/**
 * 1. UNIQUE INDEX na SKU
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Garantuje jedinstvenost SKU koda proizvoda
 * Query: findOne({ sku: 'ABC-123' })
 */
productSchema.index({ sku: 1 }, {
  unique: true,
  name: "idx_products_sku_unique",
});

/**
 * 2. UNIQUE INDEX na slug
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Jedinstveni URL slug za SEO
 * Query: findOne({ slug: 'iphone-15-pro' })
 * NAPOMENA: sparse jer slug može biti undefined za neke proizvode
 */
productSchema.index({ slug: 1 }, {
  unique: true,
  sparse: true,
  name: "idx_products_slug_unique",
});

/**
 * 3. SINGLE FIELD INDEX na category
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Brza pretraga po kategoriji
 * Query: find({ category: 'electronics' })
 */
productSchema.index({ category: 1 }, {
  name: "idx_products_category",
});

/**
 * 4. COMPOUND INDEX za listing proizvoda
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Listing proizvoda po kategoriji, sortirano po ceni
 * Query: find({ category: 'X' }).sort({ price: -1 })
 * ESR: Equality (category) → Sort (price)
 */
productSchema.index({ category: 1, price: -1 }, {
  name: "idx_products_category_price",
});

/**
 * 5. COMPOUND INDEX za aktivne proizvode
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Lista aktivnih proizvoda, najnoviji prvi
 * Query: find({ isActive: true }).sort({ createdAt: -1 })
 */
productSchema.index({ isActive: 1, createdAt: -1 }, {
  name: "idx_products_active_newest",
});

/**
 * 6. TEXT INDEX za pretragu
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Full-text pretraga proizvoda
 * Query: find({ $text: { $search: 'wireless headphones' } })
 * Weights: name (10) > brand (5) > description (2) > tags (1)
 */
productSchema.index(
  {
    name: "text",
    brand: "text",
    description: "text",
    tags: "text",
  },
  {
    name: "idx_products_text_search",
    weights: {
      name: 10,
      brand: 5,
      description: 2,
      tags: 1,
    },
    default_language: "english",
  }
);

/**
 * 7. PARTIAL INDEX za featured proizvode
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Brzo dohvatanje featured proizvoda po kategoriji
 * Query: find({ isFeatured: true, category: 'X' }).sort({ rating: -1 })
 * NAPOMENA: Indeksira SAMO featured proizvode - manji i brži indeks
 */
productSchema.index(
  { category: 1, rating: -1 },
  {
    name: "idx_products_featured_category",
    partialFilterExpression: { isFeatured: true },
  }
);

/**
 * 8. PARTIAL INDEX za aktivne proizvode po brendu
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Filter po brendu (samo za aktivne proizvode)
 * Query: find({ brand: 'Apple', isActive: true })
 */
productSchema.index(
  { brand: 1 },
  {
    name: "idx_products_active_brand",
    partialFilterExpression: { isActive: true },
  }
);

/**
 * 9. MULTIKEY INDEX na tags
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Pretraga po tagovima
 * Query: find({ tags: 'wireless' })
 */
productSchema.index({ tags: 1 }, {
  name: "idx_products_tags",
});

/**
 * 10. COMPOUND INDEX za range query sa sortiranjem
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Proizvodi u kategoriji sa stock-om, sortirani po ratingu
 * Query: find({ category: 'X', stock: { $gt: 0 } }).sort({ rating: -1 })
 * ESR: Equality (category) → Sort (rating) → Range (stock)
 */
productSchema.index({ category: 1, rating: -1, stock: 1 }, {
  name: "idx_products_category_rating_stock",
});

/**
 * 11. INDEX za admin panel - svi proizvodi sortirani
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Admin listing svih proizvoda po datumu
 * Query: find({}).sort({ createdAt: -1 })
 */
productSchema.index({ createdAt: -1 }, {
  name: "idx_products_created_desc",
});

// ═══════════════════════════════════════════════════════════════════
// VIRTUALS
// ═══════════════════════════════════════════════════════════════════

productSchema.virtual("isOnSale").get(function () {
  return this.salePrice && this.salePrice < this.price;
});

productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

// ═══════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════

const Product = mongoose.model("Product", productSchema);

export default Product;
