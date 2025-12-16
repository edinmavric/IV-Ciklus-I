import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Učitaj .env iz root foldera projekta
dotenv.config({ path: path.join(__dirname, "../.env") });

import express from "express";
import connectDB from "./config/database.js";
import Product from "./models/Product.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// DATABASE KONEKCIJA
// ============================================================
connectDB();

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// HELPER: Format explain rezultata
// ============================================================
const formatExplainResult = (explain) => {
  const stats = explain.executionStats;
  const plan = explain.queryPlanner.winningPlan;

  // Pronađi stage type (može biti ugnježđen)
  const findStage = (stage) => {
    if (stage.stage === "IXSCAN" || stage.stage === "COLLSCAN") {
      return stage;
    }
    if (stage.inputStage) {
      return findStage(stage.inputStage);
    }
    return stage;
  };

  const scanStage = findStage(plan);

  return {
    stage: scanStage.stage,
    indexUsed: scanStage.indexName || "NONE (Collection Scan)",
    documentsReturned: stats.nReturned,
    documentsExamined: stats.totalDocsExamined,
    keysExamined: stats.totalKeysExamined,
    executionTimeMs: stats.executionTimeMillis,
    efficiency: stats.totalDocsExamined > 0
      ? `${((stats.nReturned / stats.totalDocsExamined) * 100).toFixed(2)}%`
      : "N/A",
  };
};

// ============================================================
// ROUTES - INDEX MANAGEMENT
// ============================================================

/**
 * GET /indexes
 * Vraća listu svih indeksa na Product kolekciji
 */
app.get("/indexes", async (req, res) => {
  try {
    const indexes = await Product.collection.getIndexes();

    const formattedIndexes = Object.entries(indexes).map(([name, index]) => ({
      name: name,
      keys: index.key,
      unique: index.unique || false,
      sparse: index.sparse || false,
      partial: index.partialFilterExpression || null,
      textIndexVersion: index.textIndexVersion || null,
    }));

    res.json({
      success: true,
      count: formattedIndexes.length,
      indexes: formattedIndexes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /indexes
 * Kreira novi indeks
 * Body: { keys: { field: 1 }, options: { unique: true, name: "custom_name" } }
 */
app.post("/indexes", async (req, res) => {
  try {
    const { keys, options = {} } = req.body;

    if (!keys || Object.keys(keys).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Morate proslediti 'keys' objekat sa poljima za indeksiranje",
        example: {
          keys: { fieldName: 1 },
          options: { unique: true, name: "custom_index_name" },
        },
      });
    }

    const result = await Product.collection.createIndex(keys, options);

    res.status(201).json({
      success: true,
      message: "Indeks uspešno kreiran",
      indexName: result,
      keys,
      options,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * DELETE /indexes/:name
 * Briše indeks po imenu
 */
app.delete("/indexes/:name", async (req, res) => {
  try {
    const { name } = req.params;

    if (name === "_id_") {
      return res.status(400).json({
        success: false,
        message: "Ne možete obrisati default _id indeks",
      });
    }

    await Product.collection.dropIndex(name);

    res.json({
      success: true,
      message: `Indeks '${name}' uspešno obrisan`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /indexes/stats
 * Vraća statistiku korišćenja indeksa
 */
app.get("/indexes/stats", async (req, res) => {
  try {
    const stats = await Product.collection.aggregate([
      { $indexStats: {} }
    ]).toArray();

    const formattedStats = stats.map(s => ({
      name: s.name,
      timesUsed: s.accesses.ops,
      lastUsed: s.accesses.since,
    }));

    res.json({
      success: true,
      stats: formattedStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================================
// ROUTES - EXPLAIN EXAMPLES
// ============================================================

/**
 * GET /explain/category/:category
 * Demonstrira pretragu po kategoriji sa explain()
 */
app.get("/explain/category/:category", async (req, res) => {
  try {
    const { category } = req.params;

    const explain = await Product.find({ category })
      .explain("executionStats");

    const products = await Product.find({ category }).limit(5);

    res.json({
      success: true,
      query: { category },
      explain: formatExplainResult(explain),
      sampleResults: products,
      interpretation: explain.queryPlanner.winningPlan.inputStage?.stage === "IXSCAN"
        ? "✅ Upit koristi indeks - EFIKASNO"
        : "❌ Upit NE koristi indeks - Collection Scan",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /explain/category-price
 * Demonstrira compound indeks (category + price sort)
 */
app.get("/explain/category-price", async (req, res) => {
  try {
    const { category = "electronics", minPrice = 0, maxPrice = 1000 } = req.query;

    const query = {
      category,
      price: { $gte: Number(minPrice), $lte: Number(maxPrice) },
    };

    const explain = await Product.find(query)
      .sort({ price: -1 })
      .explain("executionStats");

    const products = await Product.find(query)
      .sort({ price: -1 })
      .limit(5);

    res.json({
      success: true,
      query,
      sort: { price: -1 },
      explain: formatExplainResult(explain),
      sampleResults: products,
      tip: "Compound indeks { category: 1, price: -1 } optimizuje i filtriranje i sortiranje",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /explain/text-search
 * Demonstrira text search
 */
app.get("/explain/text-search", async (req, res) => {
  try {
    const { q = "wireless" } = req.query;

    const explain = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .explain("executionStats");

    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5);

    res.json({
      success: true,
      searchQuery: q,
      explain: formatExplainResult(explain),
      sampleResults: products,
      tip: "Text indeks omogućava full-text pretragu sa relevance scoring",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /explain/no-index
 * Demonstrira upit BEZ indeksa (COLLSCAN)
 */
app.get("/explain/no-index", async (req, res) => {
  try {
    const { rating = 4 } = req.query;

    // Rating polje NEMA indeks, pa će biti COLLSCAN
    const explain = await Product.find({ rating: { $gte: Number(rating) } })
      .explain("executionStats");

    const products = await Product.find({ rating: { $gte: Number(rating) } })
      .limit(5);

    res.json({
      success: true,
      query: { rating: { $gte: Number(rating) } },
      explain: formatExplainResult(explain),
      sampleResults: products,
      warning: "⚠️ Ovaj upit koristi COLLSCAN jer nema indeks na 'rating' polju",
      solution: "Kreirajte indeks: db.products.createIndex({ rating: 1 })",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /explain/sku/:sku
 * Demonstrira unique indeks pretragu
 */
app.get("/explain/sku/:sku", async (req, res) => {
  try {
    const { sku } = req.params;

    const explain = await Product.findOne({ sku: sku.toUpperCase() })
      .explain("executionStats");

    const product = await Product.findOne({ sku: sku.toUpperCase() });

    res.json({
      success: true,
      query: { sku: sku.toUpperCase() },
      explain: formatExplainResult(explain),
      result: product,
      tip: "Unique indeks garantuje da vraćamo maksimalno 1 dokument",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /explain/tags/:tag
 * Demonstrira pretragu po array polju
 */
app.get("/explain/tags/:tag", async (req, res) => {
  try {
    const { tag } = req.params;

    const explain = await Product.find({ tags: tag })
      .explain("executionStats");

    const products = await Product.find({ tags: tag }).limit(5);

    res.json({
      success: true,
      query: { tags: tag },
      explain: formatExplainResult(explain),
      sampleResults: products,
      tip: "Indeks na array polju omogućava efikasnu pretragu po bilo kom elementu niza",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /explain/featured
 * Demonstrira compound indeks za featured proizvode
 */
app.get("/explain/featured", async (req, res) => {
  try {
    const { category = "electronics" } = req.query;

    const query = { isFeatured: true, category };

    const explain = await Product.find(query)
      .sort({ rating: -1 })
      .explain("executionStats");

    const products = await Product.find(query)
      .sort({ rating: -1 })
      .limit(5);

    res.json({
      success: true,
      query,
      sort: { rating: -1 },
      explain: formatExplainResult(explain),
      sampleResults: products,
      tip: "Compound indeks { isFeatured: 1, category: 1, rating: -1 } pokriva ceo upit",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /explain/covered-query
 * Demonstrira covered query (sve iz indeksa, bez čitanja dokumenata)
 */
app.get("/explain/covered-query", async (req, res) => {
  try {
    const { category = "electronics" } = req.query;

    // Covered query - vraćamo SAMO polja koja su u indeksu
    // Indeks: { category: 1, price: -1 }
    const explain = await Product.find(
      { category },
      { category: 1, price: 1, _id: 0 }  // Projekcija samo indeksiranih polja
    )
      .sort({ price: -1 })
      .explain("executionStats");

    const products = await Product.find(
      { category },
      { category: 1, price: 1, _id: 0 }
    )
      .sort({ price: -1 })
      .limit(5);

    const isCovered = explain.executionStats.totalDocsExamined === 0;

    res.json({
      success: true,
      query: { category },
      projection: { category: 1, price: 1, _id: 0 },
      explain: formatExplainResult(explain),
      sampleResults: products,
      isCoveredQuery: isCovered,
      tip: isCovered
        ? "✅ COVERED QUERY - MongoDB nije morao da čita dokumente, sve je dobio iz indeksa!"
        : "Nije covered query - potrebno je pročitati dokumente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================================
// ROUTES - PRODUCTS CRUD (za testiranje)
// ============================================================

/**
 * GET /products
 * Lista proizvoda sa filterima i sortiranjem
 */
app.get("/products", async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      isActive,
      isFeatured,
      brand,
      tag,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (isFeatured !== undefined) query.isFeatured = isFeatured === "true";
    if (brand) query.brand = brand;
    if (tag) query.tags = tag;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /products/:id
 */
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Proizvod nije pronađen",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /products
 */
app.post("/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /products/:id
 */
app.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Proizvod nije pronađen",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * DELETE /products/:id
 */
app.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Proizvod nije pronađen",
      });
    }

    res.json({
      success: true,
      message: "Proizvod uspešno obrisan",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================================
// ROOT ROUTE
// ============================================================
app.get("/", (req, res) => {
  res.json({
    message: "MongoDB Indexes Demo API",
    description: "API za demonstraciju indeksa u MongoDB",
    endpoints: {
      indexes: {
        "GET /indexes": "Lista svih indeksa",
        "POST /indexes": "Kreiraj novi indeks",
        "DELETE /indexes/:name": "Obriši indeks",
        "GET /indexes/stats": "Statistika korišćenja indeksa",
      },
      explain: {
        "GET /explain/category/:category": "Demonstrira single field index",
        "GET /explain/category-price": "Demonstrira compound index",
        "GET /explain/text-search?q=term": "Demonstrira text search",
        "GET /explain/no-index?rating=4": "Demonstrira COLLSCAN (bez indeksa)",
        "GET /explain/sku/:sku": "Demonstrira unique index",
        "GET /explain/tags/:tag": "Demonstrira array field index",
        "GET /explain/featured": "Demonstrira compound index za featured",
        "GET /explain/covered-query": "Demonstrira covered query",
      },
      products: {
        "GET /products": "Lista proizvoda",
        "GET /products/:id": "Detalji proizvoda",
        "POST /products": "Kreiraj proizvod",
        "PUT /products/:id": "Ažuriraj proizvod",
        "DELETE /products/:id": "Obriši proizvod",
      },
    },
    scripts: {
      "npm run seed": "Popuni bazu test podacima",
      "npm run indexes": "Pokreni primere u terminalu",
      "npm run benchmark": "Pokreni benchmark testove",
    },
  });
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} ne postoji`,
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Interna greska servera",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║              MONGODB INDEXES DEMO SERVER                   ║
╠════════════════════════════════════════════════════════════╣
║  Server:        http://localhost:${PORT}                      ║
║  Indexes:       http://localhost:${PORT}/indexes              ║
║  Products:      http://localhost:${PORT}/products             ║
║  Explain:       http://localhost:${PORT}/explain/...          ║
╚════════════════════════════════════════════════════════════╝

  Pokrenite 'npm run seed' da popunite bazu test podacima.
  `);
});
