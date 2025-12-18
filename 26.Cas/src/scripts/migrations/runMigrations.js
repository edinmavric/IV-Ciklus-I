/**
 * ═══════════════════════════════════════════════════════════════════
 * MIGRATION RUNNER
 * ═══════════════════════════════════════════════════════════════════
 * Pokreće sve pending migracije redosledom po verziji.
 *
 * Pokreni sa: npm run migrate
 * Rollback:   npm run migrate:down
 * ═══════════════════════════════════════════════════════════════════
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../../.env") });

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNKCIJE
// ═══════════════════════════════════════════════════════════════════

const getMigrationsCollection = (db) => db.collection("_migrations");

const getCompletedMigrations = async (db) => {
  const collection = getMigrationsCollection(db);
  const completed = await collection.find({}).toArray();
  return completed.map((m) => m.version);
};

const markMigrationComplete = async (db, migration) => {
  const collection = getMigrationsCollection(db);
  await collection.insertOne({
    version: migration.version,
    name: migration.name,
    description: migration.description,
    executedAt: new Date(),
  });
};

const removeMigrationRecord = async (db, version) => {
  const collection = getMigrationsCollection(db);
  await collection.deleteOne({ version });
};

const loadMigrations = async () => {
  const migrationsDir = __dirname;
  const files = await fs.readdir(migrationsDir);

  const migrations = [];

  for (const file of files) {
    if (file.startsWith("runMigrations")) continue;
    if (!file.endsWith(".js")) continue;

    const migration = await import(path.join(migrationsDir, file));

    if (migration.version && migration.up) {
      migrations.push({
        file,
        version: migration.version,
        name: migration.name || file,
        description: migration.description || "",
        up: migration.up,
        down: migration.down,
      });
    }
  }

  return migrations.sort((a, b) => a.version - b.version);
};

// ═══════════════════════════════════════════════════════════════════
// MIGRATE UP
// ═══════════════════════════════════════════════════════════════════

const migrateUp = async () => {
  console.log("\n" + "═".repeat(60));
  console.log("  RUNNING MIGRATIONS");
  console.log("═".repeat(60) + "\n");

  const conn = await mongoose.connect(process.env.MONGODB_URI);
  const db = conn.connection.db;

  console.log("✓ Povezano sa MongoDB\n");

  try {
    const migrations = await loadMigrations();
    const completed = await getCompletedMigrations(db);

    console.log(`Pronađeno migracija:  ${migrations.length}`);
    console.log(`Izvršeno migracija:   ${completed.length}`);
    console.log();

    const pending = migrations.filter((m) => !completed.includes(m.version));

    if (pending.length === 0) {
      console.log("✓ Nema pending migracija.\n");
      return;
    }

    console.log(`Pending migracija:    ${pending.length}\n`);
    console.log("─".repeat(60));

    for (const migration of pending) {
      console.log(`\n📦 Migration ${migration.version}: ${migration.name}`);
      if (migration.description) {
        console.log(`   ${migration.description}`);
      }
      console.log();

      try {
        await migration.up(db);
        await markMigrationComplete(db, migration);
        console.log(`\n✅ Migration ${migration.version} complete!\n`);
      } catch (error) {
        console.error(`\n❌ Migration ${migration.version} FAILED!`);
        console.error(`   Error: ${error.message}`);
        console.error("\n   Aborting migrations. Fix the error and try again.");
        throw error;
      }
    }

    console.log("─".repeat(60));
    console.log("\n✅ All migrations complete!\n");

  } finally {
    await mongoose.disconnect();
    console.log("✓ Diskonektovano sa MongoDB\n");
  }
};

// ═══════════════════════════════════════════════════════════════════
// MIGRATE DOWN (Rollback poslednje migracije)
// ═══════════════════════════════════════════════════════════════════

const migrateDown = async () => {
  console.log("\n" + "═".repeat(60));
  console.log("  ROLLBACK LAST MIGRATION");
  console.log("═".repeat(60) + "\n");

  const conn = await mongoose.connect(process.env.MONGODB_URI);
  const db = conn.connection.db;

  console.log("✓ Povezano sa MongoDB\n");

  try {
    const migrations = await loadMigrations();
    const completed = await getCompletedMigrations(db);

    if (completed.length === 0) {
      console.log("⚠️  Nema izvršenih migracija za rollback.\n");
      return;
    }

    // Pronađi poslednju izvršenu
    const lastVersion = Math.max(...completed);
    const lastMigration = migrations.find((m) => m.version === lastVersion);

    if (!lastMigration) {
      console.log(`⚠️  Migration ${lastVersion} nije pronađena u fajlovima.\n`);
      return;
    }

    if (!lastMigration.down) {
      console.log(`⚠️  Migration ${lastVersion} nema down() funkciju.\n`);
      return;
    }

    console.log(`📦 Rolling back Migration ${lastMigration.version}: ${lastMigration.name}\n`);

    try {
      await lastMigration.down(db);
      await removeMigrationRecord(db, lastMigration.version);
      console.log(`\n✅ Rollback complete!\n`);
    } catch (error) {
      console.error(`\n❌ Rollback FAILED!`);
      console.error(`   Error: ${error.message}`);
      throw error;
    }

  } finally {
    await mongoose.disconnect();
    console.log("✓ Diskonektovano sa MongoDB\n");
  }
};

// ═══════════════════════════════════════════════════════════════════
// STATUS
// ═══════════════════════════════════════════════════════════════════

const migrateStatus = async () => {
  console.log("\n" + "═".repeat(60));
  console.log("  MIGRATION STATUS");
  console.log("═".repeat(60) + "\n");

  const conn = await mongoose.connect(process.env.MONGODB_URI);
  const db = conn.connection.db;

  try {
    const migrations = await loadMigrations();
    const completed = await getCompletedMigrations(db);

    console.log("┌" + "─".repeat(8) + "┬" + "─".repeat(30) + "┬" + "─".repeat(10) + "┐");
    console.log("│ Version │ Name".padEnd(30) + " │ Status".padEnd(10) + " │");
    console.log("├" + "─".repeat(8) + "┼" + "─".repeat(30) + "┼" + "─".repeat(10) + "┤");

    for (const m of migrations) {
      const status = completed.includes(m.version) ? "✓ Done" : "Pending";
      const name = m.name.length > 28 ? m.name.substring(0, 25) + "..." : m.name;
      console.log(
        `│ ${String(m.version).padStart(6)} │ ${name.padEnd(28)} │ ${status.padEnd(8)} │`
      );
    }

    console.log("└" + "─".repeat(8) + "┴" + "─".repeat(30) + "┴" + "─".repeat(10) + "┘\n");

  } finally {
    await mongoose.disconnect();
  }
};

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

const command = process.argv[2] || "up";

switch (command) {
  case "up":
    migrateUp().catch(console.error);
    break;
  case "down":
    migrateDown().catch(console.error);
    break;
  case "status":
    migrateStatus().catch(console.error);
    break;
  default:
    console.log("Usage: node runMigrations.js [up|down|status]");
    console.log("  up     - Run all pending migrations");
    console.log("  down   - Rollback last migration");
    console.log("  status - Show migration status");
}
