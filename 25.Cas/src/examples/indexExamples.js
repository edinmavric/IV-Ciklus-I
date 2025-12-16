/**
 * ============================================================
 * INDEX EXAMPLES - Praktični primeri u terminalu
 * ============================================================
 * Demonstrira sve aspekte rada sa indeksima u MongoDB
 *
 * Pokreni sa: npm run indexes
 * ============================================================
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

import Product from "../models/Product.js";

// ============================================================
// HELPER FUNKCIJE
// ============================================================

const separator = (title) => {
  console.log("\n" + "═".repeat(60));
  console.log(`  ${title}`);
  console.log("═".repeat(60));
};

const subsection = (title) => {
  console.log("\n" + "─".repeat(50));
  console.log(`  ${title}`);
  console.log("─".repeat(50));
};

const formatExplain = (explain) => {
  const stats = explain.executionStats;

  // Pronađi stage type
  const findStage = (stage) => {
    if (stage.stage === "IXSCAN" || stage.stage === "COLLSCAN" || stage.stage === "TEXT") {
      return stage;
    }
    if (stage.inputStage) {
      return findStage(stage.inputStage);
    }
    return stage;
  };

  const scanStage = findStage(explain.queryPlanner.winningPlan);

  return {
    stage: scanStage.stage,
    indexName: scanStage.indexName || "N/A",
    nReturned: stats.nReturned,
    totalDocsExamined: stats.totalDocsExamined,
    totalKeysExamined: stats.totalKeysExamined,
    executionTimeMillis: stats.executionTimeMillis,
  };
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// PRIMERI
// ============================================================

const runExamples = async () => {
  try {
    // Konekcija
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Povezano sa MongoDB\n");

    const totalDocs = await Product.countDocuments();
    console.log(`📊 Ukupno dokumenata u kolekciji: ${totalDocs}`);

    if (totalDocs === 0) {
      console.log("\n⚠️  Nema podataka! Pokrenite 'npm run seed' prvo.");
      return;
    }

    // ============================================================
    // 1. PREGLED INDEKSA
    // ============================================================
    separator("1. PREGLED SVIH INDEKSA - getIndexes()");

    const indexes = await Product.collection.indexes();

    console.log("\nSvi indeksi na kolekciji 'products':\n");

    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}`);
      console.log(`   Keys: ${JSON.stringify(index.key)}`);
      if (index.unique) console.log("   Unique: true");
      if (index.sparse) console.log("   Sparse: true");
      if (index.partialFilterExpression) {
        console.log(`   Partial: ${JSON.stringify(index.partialFilterExpression)}`);
      }
      if (index.weights) {
        console.log(`   Text Weights: ${JSON.stringify(index.weights)}`);
      }
      console.log();
    });

    await wait(500);

    // ============================================================
    // 2. SINGLE FIELD INDEX
    // ============================================================
    separator("2. SINGLE FIELD INDEX - Pretraga po kategoriji");

    console.log("\nQuery: db.products.find({ category: 'electronics' })");
    console.log("Indeks: { category: 1 }\n");

    const categoryExplain = await Product.find({ category: "electronics" })
      .explain("executionStats");
    const categoryResult = formatExplain(categoryExplain);

    console.log("EXPLAIN REZULTAT:");
    console.log(`  Stage:              ${categoryResult.stage}`);
    console.log(`  Index korišćen:     ${categoryResult.indexName}`);
    console.log(`  Vraćeno dokumenata: ${categoryResult.nReturned}`);
    console.log(`  Pregledano dok.:    ${categoryResult.totalDocsExamined}`);
    console.log(`  Pregledano ključeva: ${categoryResult.totalKeysExamined}`);
    console.log(`  Vreme izvršavanja:  ${categoryResult.executionTimeMillis}ms`);

    console.log(`\n${categoryResult.stage === "IXSCAN" ? "✅" : "❌"} ${
      categoryResult.stage === "IXSCAN"
        ? "Upit koristi INDEKS - efikasno!"
        : "Upit NE koristi indeks - COLLSCAN!"
    }`);

    await wait(500);

    // ============================================================
    // 3. COMPOUND INDEX
    // ============================================================
    separator("3. COMPOUND INDEX - Kategorija + Cena sortiranje");

    console.log("\nQuery: db.products.find({ category: 'gaming' }).sort({ price: -1 })");
    console.log("Indeks: { category: 1, price: -1 }\n");

    const compoundExplain = await Product.find({ category: "gaming" })
      .sort({ price: -1 })
      .explain("executionStats");
    const compoundResult = formatExplain(compoundExplain);

    console.log("EXPLAIN REZULTAT:");
    console.log(`  Stage:              ${compoundResult.stage}`);
    console.log(`  Index korišćen:     ${compoundResult.indexName}`);
    console.log(`  Vraćeno dokumenata: ${compoundResult.nReturned}`);
    console.log(`  Pregledano dok.:    ${compoundResult.totalDocsExamined}`);
    console.log(`  Vreme izvršavanja:  ${compoundResult.executionTimeMillis}ms`);

    console.log("\n💡 TIP: Compound indeks pokriva i filter (category) i sort (price)!");

    await wait(500);

    // ============================================================
    // 4. UNIQUE INDEX
    // ============================================================
    separator("4. UNIQUE INDEX - Pretraga po SKU");

    // Pronađi jedan SKU
    const sampleProduct = await Product.findOne().select("sku");
    const testSku = sampleProduct.sku;

    console.log(`\nQuery: db.products.findOne({ sku: '${testSku}' })`);
    console.log("Indeks: { sku: 1 } sa unique: true\n");

    const skuExplain = await Product.findOne({ sku: testSku })
      .explain("executionStats");
    const skuResult = formatExplain(skuExplain);

    console.log("EXPLAIN REZULTAT:");
    console.log(`  Stage:              ${skuResult.stage}`);
    console.log(`  Index korišćen:     ${skuResult.indexName}`);
    console.log(`  Vraćeno dokumenata: ${skuResult.nReturned}`);
    console.log(`  Pregledano dok.:    ${skuResult.totalDocsExamined}`);
    console.log(`  Pregledano ključeva: ${skuResult.totalKeysExamined}`);
    console.log(`  Vreme izvršavanja:  ${skuResult.executionTimeMillis}ms`);

    console.log("\n💡 TIP: Unique indeks garantuje da je keysExamined = 1 za tačno poklapanje!");

    // Test duplikata
    subsection("Test duplikata (unique constraint)");
    console.log(`\nPokušaj dodavanja proizvoda sa istim SKU: '${testSku}'`);

    try {
      await Product.create({
        name: "Test Duplicate",
        sku: testSku,
        price: 100,
        category: "electronics",
      });
      console.log("❌ Greška: Duplikat je dodat (ne bi trebalo!)");
    } catch (error) {
      console.log("✅ Očekivana greška: Duplikat je odbijen!");
      console.log(`   Error code: ${error.code} (11000 = duplicate key)`);
    }

    await wait(500);

    // ============================================================
    // 5. TEXT INDEX
    // ============================================================
    separator("5. TEXT INDEX - Full-text pretraga");

    console.log('\nQuery: db.products.find({ $text: { $search: "wireless bluetooth" } })');
    console.log("Indeks: { name: 'text', description: 'text' }\n");

    const textExplain = await Product.find(
      { $text: { $search: "wireless bluetooth" } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5)
      .explain("executionStats");

    const textResult = formatExplain(textExplain);

    console.log("EXPLAIN REZULTAT:");
    console.log(`  Stage:              ${textResult.stage}`);
    console.log(`  Index korišćen:     ${textResult.indexName}`);
    console.log(`  Vraćeno dokumenata: ${textResult.nReturned}`);
    console.log(`  Vreme izvršavanja:  ${textResult.executionTimeMillis}ms`);

    // Prikaži rezultate sa score
    const textResults = await Product.aggregate([
      { $match: { $text: { $search: "wireless bluetooth" } } },
      { $addFields: { score: { $meta: "textScore" } } },
      { $sort: { score: -1 } },
      { $limit: 5 },
      { $project: { name: 1, score: 1 } }
    ]);

    console.log("\nTop 5 rezultata po relevantnosti:");
    textResults.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}`);
      console.log(`     Score: ${p.score?.toFixed(2) || "N/A"}`);
    });

    console.log("\n💡 TIP: Text indeks podržava weights za različite važnosti polja!");

    await wait(500);

    // ============================================================
    // 6. ARRAY INDEX
    // ============================================================
    separator("6. ARRAY INDEX - Pretraga po tagovima");

    console.log("\nQuery: db.products.find({ tags: 'wireless' })");
    console.log("Indeks: { tags: 1 }\n");

    const tagsExplain = await Product.find({ tags: "wireless" })
      .explain("executionStats");
    const tagsResult = formatExplain(tagsExplain);

    console.log("EXPLAIN REZULTAT:");
    console.log(`  Stage:              ${tagsResult.stage}`);
    console.log(`  Index korišćen:     ${tagsResult.indexName}`);
    console.log(`  Vraćeno dokumenata: ${tagsResult.nReturned}`);
    console.log(`  Pregledano ključeva: ${tagsResult.totalKeysExamined}`);
    console.log(`  Vreme izvršavanja:  ${tagsResult.executionTimeMillis}ms`);

    console.log("\n💡 TIP: MongoDB automatski indeksira svaki element niza!");

    await wait(500);

    // ============================================================
    // 7. PARTIAL INDEX
    // ============================================================
    separator("7. PARTIAL INDEX - Samo aktivni proizvodi");

    console.log("\nPartial indeks: { brand: 1 } WHERE { isActive: true }");
    console.log("Query: db.products.find({ brand: 'Samsung', isActive: true })\n");

    const partialExplain = await Product.find({ brand: "Samsung", isActive: true })
      .explain("executionStats");
    const partialResult = formatExplain(partialExplain);

    console.log("EXPLAIN REZULTAT:");
    console.log(`  Stage:              ${partialResult.stage}`);
    console.log(`  Index korišćen:     ${partialResult.indexName}`);
    console.log(`  Vraćeno dokumenata: ${partialResult.nReturned}`);
    console.log(`  Vreme izvršavanja:  ${partialResult.executionTimeMillis}ms`);

    console.log("\n💡 TIP: Partial indeks je manji i brži jer indeksira samo subset dokumenata!");

    await wait(500);

    // ============================================================
    // 8. COVERED QUERY
    // ============================================================
    separator("8. COVERED QUERY - Sve iz indeksa");

    console.log("\nQuery: db.products.find({ category: 'electronics' }, { category: 1, price: 1, _id: 0 })");
    console.log("Indeks: { category: 1, price: -1 }");
    console.log("Projekcija vraća SAMO indeksirana polja!\n");

    const coveredExplain = await Product.find(
      { category: "electronics" },
      { category: 1, price: 1, _id: 0 }
    )
      .sort({ price: -1 })
      .explain("executionStats");

    const coveredResult = formatExplain(coveredExplain);

    console.log("EXPLAIN REZULTAT:");
    console.log(`  Stage:              ${coveredResult.stage}`);
    console.log(`  Index korišćen:     ${coveredResult.indexName}`);
    console.log(`  Vraćeno dokumenata: ${coveredResult.nReturned}`);
    console.log(`  Pregledano dok.:    ${coveredResult.totalDocsExamined}`);
    console.log(`  Pregledano ključeva: ${coveredResult.totalKeysExamined}`);

    const isCovered = coveredResult.totalDocsExamined === 0;
    console.log(`\n${isCovered ? "✅" : "⚠️"} ${
      isCovered
        ? "COVERED QUERY - MongoDB nije čitao dokumente, sve je iz indeksa!"
        : "Nije covered query - dokumenti su čitani"
    }`);

    await wait(500);

    // ============================================================
    // 9. COLLSCAN - Upit BEZ indeksa
    // ============================================================
    separator("9. COLLSCAN - Upit BEZ indeksa (za poređenje)");

    console.log("\nQuery: db.products.find({ rating: { $gte: 4 } })");
    console.log("Indeks na 'rating': NE POSTOJI!\n");

    const collscanExplain = await Product.find({ rating: { $gte: 4 } })
      .explain("executionStats");
    const collscanResult = formatExplain(collscanExplain);

    console.log("EXPLAIN REZULTAT:");
    console.log(`  Stage:              ${collscanResult.stage}`);
    console.log(`  Index korišćen:     ${collscanResult.indexName}`);
    console.log(`  Vraćeno dokumenata: ${collscanResult.nReturned}`);
    console.log(`  Pregledano dok.:    ${collscanResult.totalDocsExamined}`);
    console.log(`  Vreme izvršavanja:  ${collscanResult.executionTimeMillis}ms`);

    console.log(`\n❌ COLLSCAN - MongoDB je morao da pregleda SVIH ${collscanResult.totalDocsExamined} dokumenata!`);
    console.log("   Rešenje: db.products.createIndex({ rating: 1 })");

    await wait(500);

    // ============================================================
    // 10. KREIRANJE I BRISANJE INDEKSA
    // ============================================================
    separator("10. KREIRANJE I BRISANJE INDEKSA");

    subsection("Kreiranje indeksa na 'rating'");

    console.log("\nKomanda: db.products.createIndex({ rating: 1 })");

    const newIndexName = await Product.collection.createIndex(
      { rating: 1 },
      { name: "rating_1_manual" }
    );
    console.log(`✅ Indeks kreiran: ${newIndexName}`);

    // Ponovi upit
    console.log("\nPonavljamo isti upit sa novim indeksom...\n");

    const afterIndexExplain = await Product.find({ rating: { $gte: 4 } })
      .explain("executionStats");
    const afterIndexResult = formatExplain(afterIndexExplain);

    console.log("EXPLAIN REZULTAT (POSLE INDEKSA):");
    console.log(`  Stage:              ${afterIndexResult.stage}`);
    console.log(`  Index korišćen:     ${afterIndexResult.indexName}`);
    console.log(`  Vraćeno dokumenata: ${afterIndexResult.nReturned}`);
    console.log(`  Pregledano dok.:    ${afterIndexResult.totalDocsExamined}`);
    console.log(`  Pregledano ključeva: ${afterIndexResult.totalKeysExamined}`);
    console.log(`  Vreme izvršavanja:  ${afterIndexResult.executionTimeMillis}ms`);

    console.log(`\n✅ Sada koristi IXSCAN umesto COLLSCAN!`);

    subsection("Brisanje indeksa");

    console.log("\nKomanda: db.products.dropIndex('rating_1_manual')");

    await Product.collection.dropIndex("rating_1_manual");
    console.log("✅ Indeks 'rating_1_manual' obrisan");

    await wait(500);

    // ============================================================
    // 11. INDEX STATS
    // ============================================================
    separator("11. STATISTIKA KORIŠĆENJA INDEKSA");

    console.log("\nKomanda: db.products.aggregate([{ $indexStats: {} }])\n");

    const indexStats = await Product.collection.aggregate([
      { $indexStats: {} }
    ]).toArray();

    console.log("Korišćenje indeksa:");
    console.log("─".repeat(60));
    console.log(`${"Ime indeksa".padEnd(30)} | ${"Korišćen puta".padStart(15)} | Od kada`);
    console.log("─".repeat(60));

    indexStats.forEach((stat) => {
      const since = new Date(stat.accesses.since).toLocaleString("sr-RS");
      console.log(
        `${stat.name.padEnd(30)} | ${String(stat.accesses.ops).padStart(15)} | ${since}`
      );
    });

    console.log("\n💡 TIP: Indeksi sa ops=0 se ne koriste i možda ih treba obrisati!");

    // ============================================================
    // ZAVRŠETAK
    // ============================================================
    separator("ZAVRŠETAK PRIMERA");

    console.log("\n📚 REZIME:");
    console.log("─".repeat(50));
    console.log("  • getIndexes()  - Pregled svih indeksa");
    console.log("  • createIndex() - Kreiranje novog indeksa");
    console.log("  • dropIndex()   - Brisanje indeksa");
    console.log("  • explain()     - Analiza performansi upita");
    console.log("  • $indexStats   - Statistika korišćenja");
    console.log("─".repeat(50));

    console.log("\n🎯 KLJUČNI POKAZATELJI U EXPLAIN:");
    console.log("  • IXSCAN     = Koristi indeks (DOBRO)");
    console.log("  • COLLSCAN   = Ne koristi indeks (LOŠE)");
    console.log("  • totalDocsExamined ≈ nReturned = EFIKASNO");
    console.log("  • totalDocsExamined >> nReturned = NEEFIKASNO");

    console.log("\n✅ Svi primeri završeni!");
    console.log("   Pokrenite 'npm run dev' za server sa API pristupom.");

  } catch (error) {
    console.error("❌ Greška:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("\n✓ Diskonektovano sa MongoDB");
  }
};

// Pokreni
runExamples();
