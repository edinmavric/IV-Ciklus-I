// ============================================
// USER MODEL - Mongoose Schema za korisnike
// ============================================
// Ovaj model definise strukturu korisnika u bazi podataka.
// Koristi Mongoose za validaciju, virtuale i middleware.

import mongoose from 'mongoose';

/**
 * User Schema
 * Definise sva polja korisnika sa validacijom
 */
const userSchema = new mongoose.Schema(
  {
    // Ime korisnika
    ime: {
      type: String,
      required: [true, 'Ime je obavezno polje'],
      trim: true,
      minlength: [2, 'Ime mora imati najmanje 2 karaktera'],
      maxlength: [50, 'Ime moze imati maksimalno 50 karaktera'],
    },

    // Email - jedinstven za svakog korisnika
    email: {
      type: String,
      required: [true, 'Email je obavezno polje'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        'Molimo unesite validnu email adresu',
      ],
    },

    // Lozinka - VAZNO: select: false znaci da se ne vraca u query-ima
    lozinka: {
      type: String,
      required: [true, 'Lozinka je obavezno polje'],
      minlength: [6, 'Lozinka mora imati najmanje 6 karaktera'],
      select: false, // Ne vracaj lozinku u rezultatima upita
    },

    // Uloga korisnika u sistemu
    uloga: {
      type: String,
      enum: {
        values: ['korisnik', 'autor', 'admin'],
        message: 'Uloga mora biti: korisnik, autor ili admin',
      },
      default: 'korisnik',
    },

    // Profilna slika
    slika: {
      type: String,
      default: '/images/default-avatar.png',
    },

    // Kratka biografija
    biografija: {
      type: String,
      maxlength: [500, 'Biografija moze imati maksimalno 500 karaktera'],
      default: '',
    },

    // Da li je nalog aktivan
    aktivan: {
      type: Boolean,
      default: true,
    },

    // Datum poslednje prijave
    zadnjaPrijava: {
      type: Date,
      default: null,
    },
  },
  {
    // Opcije Schema-e
    timestamps: true, // Automatski dodaje createdAt i updatedAt
    toJSON: { virtuals: true }, // Ukljuci virtuale u JSON
    toObject: { virtuals: true }, // Ukljuci virtuale u Object
  }
);

// ============================================
// VIRTUALI
// ============================================
// Virtuali su polja koja se izracunavaju, ne cuvaju u bazi

/**
 * Virtual za broj postova korisnika
 * Koristi populate sa count opcijom
 */
userSchema.virtual('brojPostova', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'autor',
  count: true,
});

/**
 * Virtual za puno ime (ako dodamo prezime u buducnosti)
 */
userSchema.virtual('punoIme').get(function () {
  return this.ime;
});

// ============================================
// INDEXI
// ============================================
// Indexi ubrzavaju pretrage po odredjenim poljima

// NAPOMENA: email vec ima unique: true, tako da se index automatski kreira
userSchema.index({ uloga: 1 }); // Index za filtriranje po ulozi
userSchema.index({ aktivan: 1 }); // Index za filtriranje aktivnih korisnika

// ============================================
// MIDDLEWARE (Hooks)
// ============================================

/**
 * Pre-save middleware
 * Izvrsava se pre svakog save() poziva
 * NAPOMENA: Mongoose 9+ ne koristi next() - funkcija samo treba da zavrsi
 */
userSchema.pre('save', function () {
  // Automatsko formatiranje imena - capitalize first letter
  if (this.isModified('ime')) {
    this.ime = this.ime.charAt(0).toUpperCase() + this.ime.slice(1);
  }
});

// ============================================
// INSTANCE METODE
// ============================================
// Metode dostupne na dokumentu (instanci modela)

/**
 * Metoda za proveru da li korisnik ima odredjenu ulogu
 * @param {string} uloga - Uloga za proveru
 * @returns {boolean}
 */
userSchema.methods.imaUlogu = function (uloga) {
  return this.uloga === uloga;
};

/**
 * Metoda za proveru da li je korisnik admin
 * @returns {boolean}
 */
userSchema.methods.jeAdmin = function () {
  return this.uloga === 'admin';
};

// ============================================
// STATIC METODE
// ============================================
// Metode dostupne na samom modelu

/**
 * Pronalazi korisnika po email-u i ukljucuje lozinku
 * @param {string} email - Email korisnika
 * @returns {Promise<User|null>}
 */
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email }).select('+lozinka');
};

/**
 * Pronalazi sve aktivne korisnike
 * @returns {Promise<User[]>}
 */
userSchema.statics.findActive = function () {
  return this.find({ aktivan: true });
};

// ============================================
// EXPORT MODELA
// ============================================
// Proveravamo da li model vec postoji (zbog hot reload-a u dev modu)

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
