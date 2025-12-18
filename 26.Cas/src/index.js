import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

import express from "express";
import connectDB from "./config/database.js";
import { Product, User, Order, Session } from "./models/index.js";
import {
  listIndexes,
  compareIndexes,
  getIndexStats,
  ensureIndex,
  dropIndexIfExists,
} from "./utils/indexHelpers.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════════════
// DATABASE
// ═══════════════════════════════════════════════════════════════════
connectDB();

// ═══════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ═══════════════════════════════════════════════════════════════════
// MODEL REGISTRY
// ═══════════════════════════════════════════════════════════════════
const MODELS = {
  products: Product,
  users: User,
  orders: Order,
  sessions: Session,
};

// ═══════════════════════════════════════════════════════════════════
// INDEX MANAGEMENT ROUTES
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /indexes/:collection
 * Lista svih indeksa za kolekciju
 */
app.get("/indexes/:collection", async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = MODELS[collection];

    if (!Model) {
      return res.status(404).json({
        success: false,
        message: `Kolekcija '${collection}' nije pronađena`,
        available: Object.keys(MODELS),
      });
    }

    const indexes = await listIndexes(Model);

    res.json({
      success: true,
      collection,
      count: indexes.length,
      indexes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /indexes/:collection/compare
 * Uporedi Schema indekse sa DB indeksima
 */
app.get("/indexes/:collection/compare", async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = MODELS[collection];

    if (!Model) {
      return res.status(404).json({
        success: false,
        message: `Kolekcija '${collection}' nije pronađena`,
      });
    }

    const comparison = await compareIndexes(Model);

    res.json({
      success: true,
      collection,
      ...comparison,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /indexes/:collection/stats
 * Statistika korišćenja indeksa
 */
app.get("/indexes/:collection/stats", async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = MODELS[collection];

    if (!Model) {
      return res.status(404).json({
        success: false,
        message: `Kolekcija '${collection}' nije pronađena`,
      });
    }

    const stats = await getIndexStats(Model);

    res.json({
      success: true,
      collection,
      stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /indexes/:collection
 * Kreiraj novi indeks
 * Body: { keys: { field: 1 }, options: { name: "...", unique: true } }
 */
app.post("/indexes/:collection", async (req, res) => {
  try {
    const { collection } = req.params;
    const { keys, options = {} } = req.body;
    const Model = MODELS[collection];

    if (!Model) {
      return res.status(404).json({
        success: false,
        message: `Kolekcija '${collection}' nije pronađena`,
      });
    }

    if (!keys || Object.keys(keys).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Morate proslediti 'keys' objekat",
        example: {
          keys: { category: 1, price: -1 },
          options: { name: "idx_category_price" },
        },
      });
    }

    const result = await ensureIndex(Model, keys, options);

    res.status(result.created ? 201 : 200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /indexes/:collection/:indexName
 * Obriši indeks
 */
app.delete("/indexes/:collection/:indexName", async (req, res) => {
  try {
    const { collection, indexName } = req.params;
    const Model = MODELS[collection];

    if (!Model) {
      return res.status(404).json({
        success: false,
        message: `Kolekcija '${collection}' nije pronađena`,
      });
    }

    const result = await dropIndexIfExists(Model, indexName);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /indexes/:collection/sync
 * Sinhronizuj indekse iz Schema
 */
app.post("/indexes/:collection/sync", async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = MODELS[collection];

    if (!Model) {
      return res.status(404).json({
        success: false,
        message: `Kolekcija '${collection}' nije pronađena`,
      });
    }

    // Pre sync
    const before = await compareIndexes(Model);

    // Sync
    await Model.syncIndexes();

    // Posle sync
    const after = await compareIndexes(Model);
    const indexes = await listIndexes(Model);

    res.json({
      success: true,
      collection,
      before: {
        inSync: before.inSync,
        missingInDb: before.missingInDb,
        extraInDb: before.extraInDb,
      },
      after: {
        inSync: after.inSync,
        indexCount: indexes.length,
      },
      indexes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ALL INDEXES SUMMARY
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /indexes
 * Rezime svih indeksa u svim kolekcijama
 */
app.get("/indexes", async (req, res) => {
  try {
    const summary = {};

    for (const [name, Model] of Object.entries(MODELS)) {
      try {
        const indexes = await listIndexes(Model);
        const comparison = await compareIndexes(Model);

        summary[name] = {
          indexCount: indexes.length,
          inSync: comparison.inSync,
          indexes: indexes.map((i) => i.name),
        };
      } catch (e) {
        summary[name] = {
          error: "Collection may not exist yet",
        };
      }
    }

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════

app.get("/", (req, res) => {
  res.json({
    message: "Index Management API",
    description: "Praktični primeri pisanja i upravljanja indeksima",
    endpoints: {
      summary: {
        "GET /indexes": "Rezime svih indeksa",
      },
      perCollection: {
        "GET /indexes/:collection": "Lista indeksa",
        "GET /indexes/:collection/compare": "Uporedi Schema vs DB",
        "GET /indexes/:collection/stats": "Statistika korišćenja",
        "POST /indexes/:collection": "Kreiraj indeks",
        "DELETE /indexes/:collection/:name": "Obriši indeks",
        "POST /indexes/:collection/sync": "Sync sa Schema",
      },
    },
    collections: Object.keys(MODELS),
    scripts: {
      "npm run check:indexes": "Proveri stanje indeksa",
      "npm run sync:indexes": "Sinhronizuj indekse",
      "npm run migrate": "Pokreni migracije",
      "npm run migrate:down": "Rollback migracije",
      "npm run migrate:status": "Status migracija",
    },
  });
});

// ═══════════════════════════════════════════════════════════════════
// ERROR HANDLERS
// ═══════════════════════════════════════════════════════════════════

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} ne postoji`,
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Interna greška servera",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ═══════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║            INDEX MANAGEMENT API SERVER                     ║
╠════════════════════════════════════════════════════════════╣
║  Server:        http://localhost:${PORT}                      ║
║  Indexes:       http://localhost:${PORT}/indexes              ║
╚════════════════════════════════════════════════════════════╝

  Skripte:
  - npm run check:indexes   Proveri stanje
  - npm run sync:indexes    Sinhronizuj
  - npm run migrate         Pokreni migracije
  `);
});
