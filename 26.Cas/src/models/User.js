import mongoose from "mongoose";

// ═══════════════════════════════════════════════════════════════════
// USER MODEL - Primer sa inline i schema.index() kombinacijom
// ═══════════════════════════════════════════════════════════════════

const userSchema = new mongoose.Schema(
  {
    // ─────────────────────────────────────────────────────────────────
    // Email - unique inline jer je to očigledan unique constraint
    // ─────────────────────────────────────────────────────────────────
    email: {
      type: String,
      required: [true, "Email je obavezan"],
      unique: true,  // OK za inline jer je očigledno da mora biti unique
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email format nije validan"],
    },

    username: {
      type: String,
      required: [true, "Username je obavezan"],
      unique: true,  // OK za inline
      lowercase: true,
      trim: true,
      minlength: [3, "Username mora imati najmanje 3 karaktera"],
      maxlength: [30, "Username ne može imati više od 30 karaktera"],
    },

    password: {
      type: String,
      required: [true, "Password je obavezan"],
      minlength: [6, "Password mora imati najmanje 6 karaktera"],
      select: false,  // Ne vraćaj password u query-jima
    },

    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      // Može biti undefined - treba sparse unique
    },

    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
    },

    loginCount: {
      type: Number,
      default: 0,
    },

    preferences: {
      newsletter: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true },
    },

    address: {
      street: String,
      city: String,
      country: String,
      zipCode: String,
    },
  },
  {
    timestamps: true,
  }
);

// ═══════════════════════════════════════════════════════════════════
// DODATNI INDEKSI (unique su već definisani inline)
// ═══════════════════════════════════════════════════════════════════

/**
 * SPARSE UNIQUE na phone
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Telefon je opciono polje, ali ako postoji - mora biti jedinstven
 * NAPOMENA: sparse ignorise dokumente bez phone polja
 */
userSchema.index({ phone: 1 }, {
  unique: true,
  sparse: true,
  name: "idx_users_phone_unique",
});

/**
 * COMPOUND INDEX za admin listing
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Lista korisnika po roli, sortirano po datumu registracije
 * Query: find({ role: 'user' }).sort({ createdAt: -1 })
 */
userSchema.index({ role: 1, createdAt: -1 }, {
  name: "idx_users_role_created",
});

/**
 * COMPOUND INDEX za aktivne korisnike
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Pretraga aktivnih korisnika
 * Query: find({ isActive: true, isVerified: true })
 */
userSchema.index({ isActive: 1, isVerified: 1 }, {
  name: "idx_users_active_verified",
});

/**
 * INDEX za pretragu po imenu
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Pretraga korisnika po prezimenu i imenu
 * Query: find({ lastName: 'Petrovic' })
 */
userSchema.index({ lastName: 1, firstName: 1 }, {
  name: "idx_users_name",
});

/**
 * INDEX za lokaciju (ako je potrebno)
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Pretraga korisnika po gradu/zemlji
 */
userSchema.index({ "address.country": 1, "address.city": 1 }, {
  name: "idx_users_location",
});

/**
 * INDEX za last login analitiku
 * ─────────────────────────────────────────────────────────────────
 * Svrha: Pronađi neaktivne korisnike
 * Query: find({ lastLoginAt: { $lt: oneMonthAgo } })
 */
userSchema.index({ lastLoginAt: 1 }, {
  name: "idx_users_last_login",
});

// ═══════════════════════════════════════════════════════════════════
// VIRTUALS
// ═══════════════════════════════════════════════════════════════════

userSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || this.username;
});

// ═══════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════

const User = mongoose.model("User", userSchema);

export default User;
