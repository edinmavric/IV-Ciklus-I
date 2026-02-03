// ============================================
// POST MODEL - Mongoose Schema za blog postove
// ============================================
// Ovaj model definise strukturu blog posta.
// Ukljucuje auto-generisanje slug-a, virtuale i indexe za pretragu.

import mongoose from 'mongoose';

/**
 * Post Schema
 * Definise sva polja blog posta sa validacijom
 */
const postSchema = new mongoose.Schema(
  {
    // Naslov posta
    naslov: {
      type: String,
      required: [true, 'Naslov je obavezno polje'],
      trim: true,
      minlength: [5, 'Naslov mora imati najmanje 5 karaktera'],
      maxlength: [150, 'Naslov moze imati maksimalno 150 karaktera'],
    },

    // Slug - URL-friendly verzija naslova (auto-generise se u pre-save hook)
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      // NAPOMENA: Nema required jer se slug generise u pre-save middleware
      // Validacija se izvrsava PRE pre-save hook-a, pa bi required prouzrokovao gresku
    },

    // Glavni sadrzaj posta (moze biti HTML ili Markdown)
    sadrzaj: {
      type: String,
      required: [true, 'Sadrzaj je obavezno polje'],
      minlength: [50, 'Sadrzaj mora imati najmanje 50 karaktera'],
    },

    // Kratak izvod/opis za prikaz u listi
    izvod: {
      type: String,
      required: [true, 'Izvod je obavezno polje'],
      maxlength: [300, 'Izvod moze imati maksimalno 300 karaktera'],
    },

    // Glavna slika posta
    slika: {
      type: String,
      default: '/images/default-post.jpg',
    },

    // Kategorija posta
    kategorija: {
      type: String,
      required: [true, 'Kategorija je obavezno polje'],
      enum: {
        values: ['tehnologija', 'programiranje', 'web-razvoj', 'novosti', 'tutorial'],
        message: 'Kategorija mora biti jedna od: tehnologija, programiranje, web-razvoj, novosti, tutorial',
      },
    },

    // Tagovi za dodatno kategorizovanje
    tagovi: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Referenca na autora (User model)
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Autor je obavezno polje'],
    },

    // Status posta
    status: {
      type: String,
      enum: {
        values: ['draft', 'objavljen', 'arhiviran'],
        message: 'Status mora biti: draft, objavljen ili arhiviran',
      },
      default: 'draft',
    },

    // Broj pregleda
    brojPregleda: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Da li je post istaknut (featured)
    istaknut: {
      type: Boolean,
      default: false,
    },

    // Procenjeno vreme citanja
    vremeZaCitanje: {
      type: String,
      default: '5 min',
    },

    // Datum kada je post objavljen
    datumObjave: {
      type: Date,
      default: null,
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
 * Virtual za broj komentara na postu
 */
postSchema.virtual('brojKomentara', {
  ref: 'Komentar',
  localField: '_id',
  foreignField: 'post',
  count: true,
});

/**
 * Virtual za komentare posta
 */
postSchema.virtual('komentari', {
  ref: 'Komentar',
  localField: '_id',
  foreignField: 'post',
});

/**
 * Virtual za URL posta
 */
postSchema.virtual('url').get(function () {
  return `/blog/${this.slug}`;
});

// ============================================
// INDEXI
// ============================================

// NAPOMENA: slug vec ima unique: true, tako da se index automatski kreira
postSchema.index({ kategorija: 1 }); // Za filtriranje po kategoriji
postSchema.index({ autor: 1 }); // Za pronalazenje postova autora
postSchema.index({ status: 1, datumObjave: -1 }); // Za sortiranje objavljenih postova
postSchema.index({ tagovi: 1 }); // Za pretragu po tagovima
postSchema.index({ istaknut: 1, status: 1 }); // Za istaknuté postove
// Text index za full-text pretragu
postSchema.index({ naslov: 'text', sadrzaj: 'text', izvod: 'text' });

// ============================================
// MIDDLEWARE (Hooks)
// ============================================

/**
 * Pre-save middleware za generisanje slug-a
 * Automatski kreira URL-friendly slug od naslova
 * NAPOMENA: Async funkcije u Mongoose NE koriste next() - automatski se ceka na resolve
 */
postSchema.pre('save', async function () {
  // Generiši slug samo ako nema slug-a i ima naslov (za nove dokumente)
  // Slug se primarno generiše u akcijama, ovo je fallback
  if (!this.slug && this.naslov) {
    let baseSlug = this.naslov
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đ]/g, 'dj')
      .replace(/[ć]/g, 'c')
      .replace(/[č]/g, 'c')
      .replace(/[š]/g, 's')
      .replace(/[ž]/g, 'z')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;

    // Proveri da li slug vec postoji
    const existingPost = await mongoose.models.Post.findOne({
      slug: slug,
      _id: { $ne: this._id },
    });

    if (existingPost) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    this.slug = slug;
  }

  // Postavi datum objave kad se status promeni u 'objavljen'
  if (this.isModified('status') && this.status === 'objavljen' && !this.datumObjave) {
    this.datumObjave = new Date();
  }

  // Izracunaj vreme za citanje
  if (this.isModified('sadrzaj')) {
    const words = this.sadrzaj.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    this.vremeZaCitanje = `${minutes} min`;
  }
});

// ============================================
// STATIC METODE
// ============================================

/**
 * Pronalazi sve objavljene postove
 * @param {Object} options - Opcije za paginaciju i sortiranje
 * @returns {Promise<Post[]>}
 */
postSchema.statics.findObjavljene = function (options = {}) {
  const { page = 1, limit = 10, kategorija, tag } = options;
  const skip = (page - 1) * limit;

  let query = this.find({ status: 'objavljen' });

  if (kategorija) {
    query = query.where('kategorija').equals(kategorija);
  }

  if (tag) {
    query = query.where('tagovi').in([tag]);
  }

  return query
    .populate('autor', 'ime slika')
    .sort({ datumObjave: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Pronalazi istaknute postove
 * @param {number} limit - Broj postova za vracanje
 * @returns {Promise<Post[]>}
 */
postSchema.statics.findIstaknute = function (limit = 3) {
  return this.find({ status: 'objavljen', istaknut: true })
    .populate('autor', 'ime slika')
    .sort({ datumObjave: -1 })
    .limit(limit);
};

/**
 * Pronalazi post po slug-u
 * @param {string} slug - Slug posta
 * @returns {Promise<Post|null>}
 */
postSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, status: 'objavljen' })
    .populate('autor', 'ime slika biografija');
};

/**
 * Povecava broj pregleda posta
 * @param {string} postId - ID posta
 * @returns {Promise<Post>}
 */
postSchema.statics.incrementPregledi = function (postId) {
  return this.findByIdAndUpdate(
    postId,
    { $inc: { brojPregleda: 1 } },
    { new: true }
  );
};

// ============================================
// INSTANCE METODE
// ============================================

/**
 * Proverava da li je autor vlasnik posta
 * @param {string} userId - ID korisnika
 * @returns {boolean}
 */
postSchema.methods.jeVlasnik = function (userId) {
  return this.autor.toString() === userId.toString();
};

/**
 * Objavljuje post
 * @returns {Promise<Post>}
 */
postSchema.methods.objavi = async function () {
  this.status = 'objavljen';
  this.datumObjave = new Date();
  return this.save();
};

// ============================================
// EXPORT MODELA
// ============================================

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
