/**
 * ═══════════════════════════════════════════════════════════════════
 * SYNC INDEXES SCRIPT
 * ═══════════════════════════════════════════════════════════════════
 * Sinhronizuje indekse iz Schema definicija sa bazom podataka.
 *
 * Pokreni sa: npm run sync:indexes
 *
 * ⚠️  PAŽNJA: Ova skripta može OBRISATI indekse koji nisu u Schema!
 * ═══════════════════════════════════════════════════════════════════
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

// Import modela
import { Product, User, Order, Session } from "../models/index.js";
import { listIndexes, compareIndexes, printIndexes } from "../utils/indexHelpers.js";

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

const syncIndexes = async () => {
  console.log("\n" + "═".repeat(60));
  console.log("  SYNC INDEXES");
  console.log("═".repeat(60) + "\n");

  try {
    // Konekcija
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Povezano sa MongoDB\n");

    // Sync za svaki model
    for (const { name, model } of MODELS) {
      console.log("─".repeat(50));
      console.log(`  ${name}`);
      console.log("─".repeat(50));

      // 1. Uporedi pre sync-a
      const before = await compareIndexes(model);
      console.log("\nPre sync-a:");
      console.log(`  Schema indeksi: ${before.schemaIndexCount}`);
      console.log(`  DB indeksi:     ${before.dbIndexCount}`);

      if (before.missingInDb.length > 0) {
        console.log(`  Nedostaju u DB: ${before.missingInDb.join(", ")}`);
      }
      if (before.extraInDb.length > 0) {
        console.log(`  Extra u DB:     ${before.extraInDb.join(", ")}`);
      }

      // 2. Sync
      console.log("\n⏳ Sinhronizujem...");
      await model.syncIndexes();

      // 3. Uporedi posle sync-a
      const after = await compareIndexes(model);
      console.log("\n✓ Sync završen!");
      console.log(`  In sync: ${after.inSync ? "DA" : "NE"}`);

      // 4. Prikaži sve indekse
      const indexes = await listIndexes(model);
      printIndexes(indexes);
    }

    console.log("═".repeat(60));
    console.log("  SYNC COMPLETE");
    console.log("═".repeat(60) + "\n");

  } catch (error) {
    console.error("\n❌ Greška:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✓ Diskonektovano sa MongoDB\n");
  }
};

// Pokreni
syncIndexes();
