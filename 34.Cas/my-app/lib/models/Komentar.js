// ============================================
// KOMENTAR MODEL - Mongoose Schema za komentare
// ============================================
// Ovaj model definise strukturu komentara na blog postovima.
// Podrzava nested (ugnjezdene) komentare kroz roditeljKomentar polje.

import mongoose from 'mongoose';

/**
 * Komentar Schema
 * Definise sva polja komentara sa validacijom
 */
const komentarSchema = new mongoose.Schema(
  {
    // Sadrzaj komentara
    sadrzaj: {
      type: String,
      required: [true, 'Sadrzaj komentara je obavezno polje'],
      trim: true,
      minlength: [3, 'Komentar mora imati najmanje 3 karaktera'],
      maxlength: [1000, 'Komentar moze imati maksimalno 1000 karaktera'],
    },

    // Referenca na post
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post je obavezno polje'],
    },

    // Referenca na autora komentara
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Autor je obavezno polje'],
    },

    // Referenca na roditeljski komentar (za nested komentare)
    // null znaci da je top-level komentar
    roditeljKomentar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Komentar',
      default: null,
    },

    // Da li je komentar odobren (za moderaciju)
    odobren: {
      type: Boolean,
      default: true, // Automatski odobri (moze se promeniti za striktnu moderaciju)
    },

    // Da li je komentar editovan
    editovan: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// VIRTUALI
// ============================================

/**
 * Virtual za odgovore na komentar (child komentari)
 */
komentarSchema.virtual('odgovori', {
  ref: 'Komentar',
  localField: '_id',
  foreignField: 'roditeljKomentar',
});

/**
 * Virtual za proveru da li je top-level komentar
 */
komentarSchema.virtual('jeTopLevel').get(function () {
  return this.roditeljKomentar === null;
});

// ============================================
// INDEXI
// ============================================

komentarSchema.index({ post: 1, createdAt: -1 }); // Za dohvatanje komentara posta
komentarSchema.index({ autor: 1 }); // Za dohvatanje komentara korisnika
komentarSchema.index({ roditeljKomentar: 1 }); // Za dohvatanje odgovora
komentarSchema.index({ odobren: 1 }); // Za filtriranje odobrenih

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Pre-save middleware
 * NAPOMENA: Mongoose 9+ ne koristi next()
 */
komentarSchema.pre('save', function () {
  // Oznaci kao editovan ako se menja sadrzaj postojeceg dokumenta
  if (!this.isNew && this.isModified('sadrzaj')) {
    this.editovan = true;
  }
});

/**
 * Post-remove middleware - obrisi sve odgovore kad se komentar obrise
 */
komentarSchema.pre('deleteOne', { document: true, query: false }, async function () {
  // Obrisi sve odgovore na ovaj komentar
  await mongoose.models.Komentar.deleteMany({ roditeljKomentar: this._id });
});

// ============================================
// STATIC METODE
// ============================================

/**
 * Dohvata sve komentare za post (sa populiranim podacima)
 * @param {string} postId - ID posta
 * @returns {Promise<Komentar[]>}
 */
komentarSchema.statics.findByPost = function (postId) {
  return this.find({
    post: postId,
    odobren: true,
    roditeljKomentar: null, // Samo top-level komentari
  })
    .populate('autor', 'ime slika')
    .populate({
      path: 'odgovori',
      match: { odobren: true },
      populate: {
        path: 'autor',
        select: 'ime slika',
      },
      options: { sort: { createdAt: 1 } },
    })
    .sort({ createdAt: -1 });
};

/**
 * Broji komentare za post
 * @param {string} postId - ID posta
 * @returns {Promise<number>}
 */
komentarSchema.statics.countByPost = function (postId) {
  return this.countDocuments({ post: postId, odobren: true });
};

/**
 * Dohvata poslednje komentare korisnika
 * @param {string} autorId - ID autora
 * @param {number} limit - Broj komentara
 * @returns {Promise<Komentar[]>}
 */
komentarSchema.statics.findByAutor = function (autorId, limit = 10) {
  return this.find({ autor: autorId })
    .populate('post', 'naslov slug')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// ============================================
// INSTANCE METODE
// ============================================

/**
 * Proverava da li je korisnik autor komentara
 * @param {string} userId - ID korisnika
 * @returns {boolean}
 */
komentarSchema.methods.jeAutor = function (userId) {
  return this.autor.toString() === userId.toString();
};

// ============================================
// EXPORT MODELA
// ============================================

const Komentar = mongoose.models.Komentar || mongoose.model('Komentar', komentarSchema);

export default Komentar;
