import mongoose from "mongoose";

// ═══════════════════════════════════════════════════════════════════
// SESSION MODEL - Primer TTL indeksa
// ═══════════════════════════════════════════════════════════════════

const sessionSchema = new mongoose.Schema({
  // Session token
  token: {
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

  // User agent info
  userAgent: {
    type: String,
  },

  // IP adresa
  ipAddress: {
    type: String,
  },

  // Device info
  device: {
    type: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
    },
    os: String,
    browser: String,
  },

  // Da li je sesija aktivna
  isActive: {
    type: Boolean,
    default: true,
  },

  // Kada je kreirana (za TTL)
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Poslednja aktivnost
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },

  // Eksplicitni expiry (alternativa TTL-u)
  expiresAt: {
    type: Date,
    required: true,
  },
});

// ═══════════════════════════════════════════════════════════════════
// INDEKSI
// ═══════════════════════════════════════════════════════════════════

/**
 * TTL INDEX - Auto-brisanje isteklih sesija
 * ─────────────────────────────────────────────────────────────────
 * Svrha: MongoDB automatski briše dokumente nakon isteka
 * NAPOMENA: expireAfterSeconds: 0 znači da koristi expiresAt polje
 */
sessionSchema.index({ expiresAt: 1 }, {
  expireAfterSeconds: 0,  // Briši kada expiresAt prođe
  name: "idx_sessions_ttl",
});

/**
 * INDEX za pretragu po userId
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Pronađi sve sesije korisnika
 * Query: find({ userId: ObjectId(...) })
 */
sessionSchema.index({ userId: 1 }, {
  name: "idx_sessions_user",
});

/**
 * COMPOUND INDEX za aktivne sesije korisnika
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Pronađi aktivne sesije korisnika
 * Query: find({ userId: X, isActive: true })
 */
sessionSchema.index({ userId: 1, isActive: 1 }, {
  name: "idx_sessions_user_active",
});

/**
 * INDEX za analitiku po IP adresi
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Detekcija sumnjivih aktivnosti sa iste IP adrese
 */
sessionSchema.index({ ipAddress: 1, createdAt: -1 }, {
  name: "idx_sessions_ip_created",
});

// ═══════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════

const Session = mongoose.model("Session", sessionSchema);

export default Session;
