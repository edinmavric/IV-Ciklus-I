import Product from '../models/Product.js';

/**
 * ═══════════════════════════════════════════════════════════════════
 * GET ALL PRODUCTS - Sa filtriranjem i sortiranjem
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Query parametri (primeri):
 * ---------------------------
 * GET /products?search=phone
 * GET /products?minPrice=100&maxPrice=500
 * GET /products?category=tech
 * GET /products?sort=price (rastuće)
 * GET /products?sort=-price (opadajuće)
 * GET /products?search=iphone&minPrice=100&maxPrice=300&category=tech&sort=-price
 * 
 * Kako radi?
 * ----------
 * 1. Uzima query parametre iz req.query (npr. ?search=phone&minPrice=100)
 * 2. Gradi MongoDB query objekat polako (dodaje filtere samo ako postoje)
 * 3. Izvršava query sa sortiranjem (ako je zadato)
 * 4. Vraća rezultate
 */
export const getProducts = async (req, res, next) => {
  try {
    // Uzmi query parametre iz URL-a
    // Primer: /products?search=phone&minPrice=100 → req.query = { search: 'phone', minPrice: '100' }
    const { search, category, minPrice, maxPrice, sort } = req.query;

    // Kreiraj početni query objekat (prazan = svi proizvodi)
    // deleted: false se automatski dodaje iz productSchema.pre(/^find/)
    let query = {};

    // ═══════════════════════════════════════════════════════════════════
    // 1. PRETRAGA PO IMENU (SEARCH)
    // ═══════════════════════════════════════════════════════════════════
    /**
     * $regex - regex pretraga (kao SQL LIKE)
     * $options: 'i' - case-insensitive (ne razlikuje velika/mala slova)
     * 
     * Primer:
     * search = "phone"
     * query.name = { $regex: "phone", $options: "i" }
     * 
     * Naći će: "iPhone", "Samsung Phone", "phone case", "Phone Charger"...
     */
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // case-insensitive
    }

    // ═══════════════════════════════════════════════════════════════════
    // 2. FILTRIRANJE PO KATEGORIJI
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Primer:
     * category = "tech"
     * query.category = "tech"
     * 
     * Naći će samo proizvode gde je category === "tech"
     */
    if (category) {
      query.category = category;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 3. FILTRIRANJE PO CENI (MIN I MAX)
    // ═══════════════════════════════════════════════════════════════════
    /**
     * MongoDB operatori:
     * $gte - greater than or equal (>=)
     * $lte - less than or equal (<=)
     * $gt - greater than (>)
     * $lt - less than (<)
     * 
     * Primer:
     * minPrice = 100, maxPrice = 500
     * query.price = { $gte: 100, $lte: 500 }
     * 
     * Naći će proizvode sa cenom između 100 i 500 (uključujući 100 i 500)
     */
    if (minPrice || maxPrice) {
      query.price = {};
      
      if (minPrice) {
        query.price.$gte = Number(minPrice); // >= minPrice
      }
      
      if (maxPrice) {
        query.price.$lte = Number(maxPrice); // <= maxPrice
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 4. IZVRŠAVANJE UPITA
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Product.find(query) - nađe sve proizvode koji odgovaraju query-ju
     * deleted: false se automatski dodaje iz pre middleware-a
     */
    let mongoQuery = Product.find(query);

    // ═══════════════════════════════════════════════════════════════════
    // 5. SORTIRANJE (ako je zadato)
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Sort sintaksa:
     * sort=price → rastuće (1, 2, 3...)
     * sort=-price → opadajuće (10, 9, 8...)
     * sort=name → po abecedi
     * sort=-createdAt → najnoviji prvo
     * 
     * Možeš kombinovati: sort=category,name → prvo po kategoriji, pa po imenu
     */
    if (sort) {
      // sort može biti "price", "-price", "name,-price" itd.
      // Mongoose automatski razume - kao opadajuće
      mongoQuery = mongoQuery.sort(sort);
    }

    // Izvrši query i vrati rezultate
    const products = await mongoQuery;

    // Vrati odgovor
    res.json({
      count: products.length,
      products: products,
    });
  } catch (err) {
    // Proslijedi grešku globalnom error handleru
    next(err);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * GET SINGLE PRODUCT - Jedan proizvod po ID-u
 * ═══════════════════════════════════════════════════════════════════
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    // Ako proizvod ne postoji (ili je obrisan - soft delete)
    if (!product) {
      const err = new Error('Proizvod nije pronađen');
      err.status = 404;
      return next(err);
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * CREATE PRODUCT - Kreiranje novog proizvoda
 * ═══════════════════════════════════════════════════════════════════
 */
export const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      message: 'Proizvod uspešno kreiran',
      product: product,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * UPDATE PRODUCT - Ažuriranje proizvoda
 * ═══════════════════════════════════════════════════════════════════
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // new: true → vrati AŽURIRANI dokument (ne stari)
    // runValidators: true → pokreni validacije šeme
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      const err = new Error('Proizvod nije pronađen');
      err.status = 404;
      return next(err);
    }

    res.json({
      message: 'Proizvod uspešno ažuriran',
      product: product,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * SOFT DELETE PRODUCT - "Brisanje" proizvoda (soft delete)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Šta ovo radi?
 * -------------
 * Umesto da obriše proizvod ZAUVEK iz baze (hard delete),
 * samo označi deleted: true
 * 
 * Hard delete (NE radimo ovde):
 * -----------------------------
 * await Product.findByIdAndDelete(id);
 * → Dokument se TRAJNO briše iz baze, ne može se vratiti
 * 
 * Soft delete (RADIMO OVO):
 * -------------------------
 * await Product.findByIdAndUpdate(id, { deleted: true });
 * → Dokument OSTAJE u bazi, ali se ne prikazuje u normalnim upitima
 * → Može se vratiti promenom deleted: false
 * 
 * Zašto soft delete?
 * -------------------
 * - Možeš povratiti greškom obrisane proizvode
 * - Čuvaš istoriju
 * - Admin može videti sve obrisane proizvode
 * - Bezbednije
 */
export const softDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // findByIdAndUpdate neće pronaći obrisane proizvode (zbog pre middleware-a)
    // Zato koristimo findOneAndUpdate sa ručnim filterom
    const product = await Product.findOneAndUpdate(
      { _id: id, deleted: false }, // Nađi samo neobrisane
      { deleted: true },
      { new: true }
    );

    if (!product) {
      const err = new Error('Proizvod nije pronađen');
      err.status = 404;
      return next(err);
    }

    res.json({
      message: 'Proizvod je soft deleted (obrisan, ali ostaje u bazi)',
      product: product,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * HARD DELETE PRODUCT - Trajno brisanje (opciono, za admina)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * OVO TRAJNO BRIŠE PROIZVOD IZ BAZE!
 * Koristi pažljivo - možda ti ne treba u produkciji.
 */
export const hardDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      const err = new Error('Proizvod nije pronađen');
      err.status = 404;
      return next(err);
    }

    res.json({
      message: 'Proizvod je TRAJNO obrisan iz baze',
      product: product,
    });
  } catch (err) {
    next(err);
  }
};
