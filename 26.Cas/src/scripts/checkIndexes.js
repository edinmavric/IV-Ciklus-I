/**
 * ═══════════════════════════════════════════════════════════════════
 * CHECK INDEXES SCRIPT
 * ═══════════════════════════════════════════════════════════════════
 * Proverava stanje indeksa bez menjanja bilo čega.
 * Prikazuje:
 * - Sve indekse u bazi
 * - Poređenje sa Schema definicijama
 * - Statistiku korišćenja
 * - Nekorišćene indekse
 *
 * Pokreni sa: npm run check:indexes
 * ═══════════════════════════════════════════════════════════════════
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

import { Product, User, Order, Session } from "../models/index.js";
import {
  listIndexes,
  compareIndexes,
  getIndexStats,
  findUnusedIndexes,
  printIndexes,
} from "../utils/indexHelpers.js";

// ═══════════════════════════════════════════════════════════════════
// KONFIGURACIJA
// ═══════════════════════════════════════════════════════════════════

const MODELS = [
  { name: "Product", model: Product },
  { name: "User", model: User },
  { name: "Order", model: Order },
  { name: "Session", model: Session },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

const checkIndexes = async () => {
  console.log("\n" + "═".repeat(70));
  console.log("  CHECK INDEXES - Pregled stanja indeksa");
  console.log("═".repeat(70) + "\n");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Povezano sa MongoDB\n");

    for (const { name, model } of MODELS) {
      console.log("\n" + "━".repeat(70));
      console.log(`  MODEL: ${name.toUpperCase()}`);
      console.log("━".repeat(70));

      // Proveri da li kolekcija postoji
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionName = model.collection.collectionName;
      const exists = collections.some((c) => c.name === collectionName);

      if (!exists) {
        console.log(`\n  ⚠️  Kolekcija '${collectionName}' ne postoji (još uvek)`);
        console.log("     Indeksi će biti kreirani kada se doda prvi dokument.");
        continue;
      }

      // 1. Lista indeksa
      console.log("\n  📋 INDEKSI U BAZI:");
      const indexes = await listIndexes(model);
      printIndexes(indexes);

      // 2. Poređenje sa Schema
      console.log("  🔄 POREĐENJE SA SCHEMA:");
      const comparison = await compareIndexes(model);

      console.log(`     Schema indeksi:  ${comparison.schemaIndexCount}`);
      console.log(`     DB indeksi:      ${comparison.dbIndexCount}`);
      console.log(`     In sync:         ${comparison.inSync ? "✅ DA" : "❌ NE"}`);

      if (comparison.missingInDb.length > 0) {
        console.log(`\n     ⚠️  Nedostaju u bazi:`);
        comparison.missingInDb.forEach((name) => {
          console.log(`        - ${name}`);
        });
      }

      if (comparison.extraInDb.length > 0) {
        console.log(`\n     ⚠️  Extra u bazi (nisu u Schema):`);
        comparison.extraInDb.forEach((name) => {
          console.log(`        - ${name}`);
        });
      }

      // 3. Statistika korišćenja
      console.log("\n  📊 STATISTIKA KORIŠĆENJA:");
      try {
        const stats = await getIndexStats(model);

        console.log("     ┌" + "─".repeat(40) + "┬" + "─".repeat(15) + "┐");
        console.log("     │" + " Indeks".padEnd(40) + "│" + " Korišćen".padStart(14) + " │");
        console.log("     ├" + "─".repeat(40) + "┼" + "─".repeat(15) + "┤");

        stats.forEach((s) => {
          const name = s.name.length > 38 ? s.name.substring(0, 35) + "..." : s.name;
          console.log(
            "     │ " + name.padEnd(39) + "│" + s.timesUsed.toString().padStart(14) + " │"
          );
        });

        console.log("     └" + "─".repeat(40) + "┴" + "─".repeat(15) + "┘");

        // 4. Nekorišćeni indeksi
        const unused = await findUnusedIndexes(model);
        if (unused.length > 0) {
          console.log("\n  ⚠️  NEKORIŠĆENI INDEKSI:");
          unused.forEach((u) => {
            console.log(`     - ${u.name} (0 korišćenja)`);
          });
          console.log("     Razmisli o brisanju ovih indeksa.");
        }
      } catch (e) {
        console.log("     Statistika nije dostupna (možda nema dokumenata)");
      }
    }

    // Rezime
    console.log("\n" + "═".repeat(70));
    console.log("  REZIME");
    console.log("═".repeat(70));

    let totalInSync = 0;
    let totalOutOfSync = 0;

    for (const { name, model } of MODELS) {
      try {
        const comp = await compareIndexes(model);
        if (comp.inSync) {
          totalInSync++;
          console.log(`  ✅ ${name}: In sync`);
        } else {
          totalOutOfSync++;
          console.log(`  ❌ ${name}: Out of sync`);
        }
      } catch (e) {
        console.log(`  ⚠️  ${name}: Nije moguće proveriti`);
      }
    }

    console.log("\n" + "─".repeat(70));
    console.log(`  In sync: ${totalInSync}/${MODELS.length}`);

    if (totalOutOfSync > 0) {
      console.log("\n  💡 Preporuka: Pokreni 'npm run sync:indexes' za sinhronizaciju");
    }

    console.log("═".repeat(70) + "\n");

  } catch (error) {
    console.error("\n❌ Greška:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✓ Diskonektovano sa MongoDB\n");
  }
};

// Pokreni
checkIndexes();
