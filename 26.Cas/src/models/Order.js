import mongoose from "mongoose";

// ═══════════════════════════════════════════════════════════════════
// ORDER MODEL - Primer compound unique i foreign key indeksa
// ═══════════════════════════════════════════════════════════════════

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  sku: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  total: Number,
});

const orderSchema = new mongoose.Schema(
  {
    // Jedinstveni broj narudžbine
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    // Referenca na korisnika
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Stavke narudžbine
    items: [orderItemSchema],

    // Status narudžbine
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },

    // Adresa za dostavu
    shippingAddress: {
      firstName: String,
      lastName: String,
      street: String,
      city: String,
      zipCode: String,
      country: String,
      phone: String,
    },

    // Ukupna cena
    subtotal: {
      type: Number,
      required: true,
    },

    shippingCost: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },

    // Plaćanje
    paymentMethod: {
      type: String,
      enum: ["card", "paypal", "cash", "bank_transfer"],
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paidAt: Date,

    // Dostava
    shippedAt: Date,
    deliveredAt: Date,

    // Napomene
    notes: String,
    adminNotes: String,
  },
  {
    timestamps: true,
  }
);

// ═══════════════════════════════════════════════════════════════════
// INDEKSI
// ═══════════════════════════════════════════════════════════════════

/**
 * INDEX na userId (FOREIGN KEY)
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Brzo dohvatanje narudžbina korisnika
 * Query: find({ userId: ObjectId(...) })
 * NAPOMENA: UVEK indeksiraj foreign key polja!
 */
orderSchema.index({ userId: 1 }, {
  name: "idx_orders_user",
});

/**
 * COMPOUND INDEX za korisnikove narudžbine po statusu
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Dohvati narudžbine korisnika određenog statusa
 * Query: find({ userId: X, status: 'pending' })
 */
orderSchema.index({ userId: 1, status: 1 }, {
  name: "idx_orders_user_status",
});

/**
 * COMPOUND INDEX za korisnikove narudžbine sortirane po datumu
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Lista narudžbina korisnika, najnovije prvo
 * Query: find({ userId: X }).sort({ createdAt: -1 })
 */
orderSchema.index({ userId: 1, createdAt: -1 }, {
  name: "idx_orders_user_date",
});

/**
 * INDEX za admin - status + datum
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Admin pregled narudžbina po statusu
 * Query: find({ status: 'pending' }).sort({ createdAt: 1 })
 */
orderSchema.index({ status: 1, createdAt: 1 }, {
  name: "idx_orders_status_date",
});

/**
 * INDEX za payment status
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Praćenje neplaćenih narudžbina
 * Query: find({ paymentStatus: 'pending', createdAt: { $lt: oneDayAgo } })
 */
orderSchema.index({ paymentStatus: 1, createdAt: 1 }, {
  name: "idx_orders_payment_date",
});

/**
 * INDEX za date range upite
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Izveštaji po datumu
 * Query: find({ createdAt: { $gte: startDate, $lte: endDate } })
 */
orderSchema.index({ createdAt: -1 }, {
  name: "idx_orders_date",
});

/**
 * INDEX za shipping tracking
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Praćenje poslanih narudžbina
 */
orderSchema.index({ shippedAt: 1 }, {
  sparse: true,
  name: "idx_orders_shipped",
});

/**
 * COMPOUND UNIQUE - userId + productId u items (primer)
 * ─────────────────────────────────────────────────────────────────
 * NAPOMENA: Ovo je primer ako bi hteli sprečiti duplikate
 * U praksi, ovo obično nije potrebno za orders
 */
// orderSchema.index(
//   { userId: 1, 'items.productId': 1, createdAt: 1 },
//   { unique: true, name: 'idx_orders_user_product_date_unique' }
// );

// ═══════════════════════════════════════════════════════════════════
// VIRTUALS
// ═══════════════════════════════════════════════════════════════════

orderSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

orderSchema.virtual("isPaid").get(function () {
  return this.paymentStatus === "paid";
});

// ═══════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════

const Order = mongoose.model("Order", orderSchema);

export default Order;
