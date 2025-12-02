import Product from "../models/Product.js";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GET ALL PRODUCTS - Sa pretragom i sortiranjem
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Query parametri:
 * ----------------
 * ?search=phone     → Pretraga po imenu (case-insensitive)
 * ?sort=price       → Sortiranje rastuće
 * ?sort=-price      → Sortiranje opadajuće
 *
 * Primeri:
 * --------
 * GET /products?search=laptop
 * GET /products?sort=-price
 * GET /products?search=phone&sort=price
 */
export const getProducts = async (req, res, next) => {
  try {
    // Uzmi query parametre iz URL-a
    const { search, sort } = req.query;

    // Kreiraj prazan query objekat
    // Ako ostane prazan, find({}) vraća SVE proizvode
    let query = {};

    /**
     * ═══════════════════════════════════════════════════════════════════════
     * PRETRAGA SA REGEX-om
     * ═══════════════════════════════════════════════════════════════════════
     *
     * $regex - MongoDB operator za pretragu po pattern-u
     * $options: "i" - case-insensitive (ne razlikuje velika/mala slova)
     *
     * Primer:
     *   search = "pho"
     *   query.name = { $regex: "phone", $options: "i" }
     *
     * Rezultat: iPhone, Smartphone, Phone Case, PHONE...
     */
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════
     * KREIRANJE QUERY-ja
     * ═══════════════════════════════════════════════════════════════════════
     *
     * Product.find(query) NE izvršava upit odmah!
     * Vraća Query objekat na koji možemo chain-ovati .sort(), .limit(), itd.
     */
    let mongoQuery = Product.find(query);

    /**
     * ═══════════════════════════════════════════════════════════════════════
     * SORTIRANJE
     * ═══════════════════════════════════════════════════════════════════════
     * 
     * Mongoose razume:
     * - "price" → rastuće (1, 2, 3...)
     * - "-price" → opadajuće (10, 9, 8...)
     * - "name" → A-Z
     * - "-name" → Z-A
     */
    if (sort) {
      mongoQuery = mongoQuery.sort(sort);
    }

    // Tek sada izvršavamo query
    const products = await mongoQuery;

    res.json({
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GET SINGLE PRODUCT
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const err = new Error("Proizvod nije pronađen");
      err.status = 404;
      return next(err);
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CREATE PRODUCT
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      message: "Proizvod uspešno kreiran",
      product,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CREATE PRODUCT WITH IMAGE - Kreiranje proizvoda sa upload-om slike
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ova ruta prima i podatke o proizvodu i sliku!
 *
 * Kako se koristi sa frontend-a:
 * ------------------------------
 * const formData = new FormData();
 * formData.append("name", "Laptop");
 * formData.append("price", "999");
 * formData.append("image", selectedFile);  // Fajl
 *
 * await axios.post("/products/with-image", formData, {
 *   headers: { "Content-Type": "multipart/form-data" }
 * });
 *
 * VAŽNO:
 * ------
 * - Multer parsira FormData
 * - Tekstualni podaci (name, price) su u req.body
 * - Fajl je u req.file
 */
export const createProductWithImage = async (req, res, next) => {
  try {
    const { name, price, category, description } = req.body;

    // Kreiraj proizvod sa putanjom do slike
    const product = await Product.create({
      name,
      price: Number(price),
      category,
      description,
      // Ako postoji fajl, sačuvaj putanju
      // req.file.path = "uploads/1701234567890-slika.jpg"
      imageUrl: req.file ? req.file.path : null,
    });

    res.status(201).json({
      message: "Proizvod sa slikom uspešno kreiran",
      product,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UPDATE PRODUCT
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      const err = new Error("Proizvod nije pronađen");
      err.status = 404;
      return next(err);
    }

    res.json({
      message: "Proizvod uspešno ažuriran",
      product,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DELETE PRODUCT
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      const err = new Error("Proizvod nije pronađen");
      err.status = 404;
      return next(err);
    }

    res.json({
      message: "Proizvod uspešno obrisan",
      product,
    });
  } catch (err) {
    next(err);
  }
};
