import mongoose from 'mongoose';

/**
 * ═══════════════════════════════════════════════════════════════════
 * PRODUCT MODEL - Šema za proizvode
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Polja:
 * ------
 * - name: Ime proizvoda (String, obavezno)
 * - price: Cena proizvoda (Number, obavezno)
 * - category: Kategorija proizvoda (String)
 * - description: Opis proizvoda (String)
 * - deleted: Soft delete flag (Boolean, default: false)
 *   └─> Ako je deleted: true, proizvod se NE prikazuje u normalnim upitima
 *       ali se NALAZI u bazi (hard delete bi ga obrisao zauvek)
 */

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ime proizvoda je obavezno'],
    trim: true, // Uklanja praznine sa početka i kraja
  },
  price: {
    type: Number,
    required: [true, 'Cena je obavezna'],
    min: [0, 'Cena ne može biti negativna'],
  },
  category: {
    type: String,
    trim: true,
    // Neki primeri kategorija: 'tech', 'electronics', 'clothing', 'food'
  },
  description: {
    type: String,
    trim: true,
  },
  /**
   * SOFT DELETE FLAG
   * ----------------
   * Hard delete → obriše dokument ZAUVEK iz baze (.findByIdAndDelete)
   * Soft delete → samo označi kao obrisano, ali dokument ostaje u bazi
   * 
   * Zašto soft delete?
   * -------------------
   * - Možeš povratiti obrisane proizvode (npr. greškom obrisani)
   * - Možeš napraviti "korpu obrisanih" za admina
   * - Čuvaš istoriju (možda ti treba za statistiku)
   * - Bezbednije - ne gubiš podatke slučajno
   */
  deleted: {
    type: Boolean,
    default: false, // Podrazumevano proizvod NIJE obrisan
  },
}, {
  // Opcije šeme
  timestamps: true, // Automatski dodaje createdAt i updatedAt
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * PRE MIDDLEWARE - Automatsko filtriranje deleted proizvoda
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Šta ovo radi?
 * -------------
 * Pre SVAKOG upita koji počinje sa "find" (find, findOne, findById...)
 * automatski dodaje filter: { deleted: false }
 * 
 * To znači da:
 * - Product.find() → automatski vrati samo { deleted: false }
 * - Product.findById() → neće pronaći obrisane proizvode
 * - Product.findOne({ name: "iPhone" }) → neće naći obrisane iPhone-ove
 * 
 * Kako pronaći obrisane proizvode?
 * ---------------------------------
 * Koristiš: Product.find({ deleted: true }) → preskače middleware
 * Ili: Product.findWithDeleted({ name: "iPhone" }) → možeš napraviti helper metodu
 * 
 * Zašto ovo?
 * -----------
 * Umesto da u SVAKOM kontroleru pišeš:
 *   const products = await Product.find({ deleted: false });
 * 
 * Ovo radi AUTOMATSKI za sve find upite!
 * 
 * Regex /^find/ znači "sve metode koje počinju sa 'find'"
 * - find
 * - findOne
 * - findById
 * - findByIdAndUpdate
 * - findOneAndUpdate
 * itd.
 */
productSchema.pre(/^find/, function(next) {
  // this je MongoDB query objekat
  // where() dodaje filter na postojeći query
  // Sada će SVI find upiti automatski filtrirati deleted: false
  this.where({ deleted: false });
  next();
});

export default mongoose.model('Product', productSchema);
