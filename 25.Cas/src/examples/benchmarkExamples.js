/**
 * ============================================================
 * BENCHMARK EXAMPLES - Poređenje performansi sa/bez indeksa
 * ============================================================
 * Demonstrira razliku u performansama između upita sa i bez indeksa
 *
 * Pokreni sa: npm run benchmark
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
  console.log("\n" + "═".repeat(70));
  console.log(`  ${title}`);
  console.log("═".repeat(70));
};

const benchmark = async (name, queryFn, iterations = 100) => {
  const times = [];

  // Warmup
  await queryFn();

  // Benchmark
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint();
    await queryFn();
    const end = process.hrtime.bigint();
    times.push(Number(end - start) / 1_000_000); // Convert to ms
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const sorted = times.sort((a, b) => a - b);
  const p50 = sorted[Math.floor(times.length * 0.5)];
  const p95 = sorted[Math.floor(times.length * 0.95)];
  const p99 = sorted[Math.floor(times.length * 0.99)];

  return {
    name,
    iterations,
    avgMs: avg.toFixed(2),
    minMs: min.toFixed(2),
    maxMs: max.toFixed(2),
    p50Ms: p50.toFixed(2),
    p95Ms: p95.toFixed(2),
    p99Ms: p99.toFixed(2),
  };
};

const printBenchmark = (result) => {
  console.log(`\n  ${result.name}`);
  console.log(`  ${"─".repeat(50)}`);
  console.log(`  Iteracija:  ${result.iterations}`);
  console.log(`  Average:    ${result.avgMs}ms`);
  console.log(`  Min:        ${result.minMs}ms`);
  console.log(`  Max:        ${result.maxMs}ms`);
  console.log(`  p50:        ${result.p50Ms}ms`);
  console.log(`  p95:        ${result.p95Ms}ms`);
  console.log(`  p99:        ${result.p99Ms}ms`);
};

const compareBenchmarks = (withIndex, withoutIndex) => {
  const avgDiff = (parseFloat(withoutIndex.avgMs) / parseFloat(withIndex.avgMs));
  const p95Diff = (parseFloat(withoutIndex.p95Ms) / parseFloat(withIndex.p95Ms));

  console.log("\n  📊 POREĐENJE:");
  console.log(`  ${"─".repeat(50)}`);
  console.log(`  Sa indeksom (avg):    ${withIndex.avgMs}ms`);
  console.log(`  Bez indeksa (avg):    ${withoutIndex.avgMs}ms`);
  console.log(`  ${"─".repeat(50)}`);
  console.log(`  Ubrzanje (avg):       ${avgDiff.toFixed(1)}x brže sa indeksom`);
  console.log(`  Ubrzanje (p95):       ${p95Diff.toFixed(1)}x brže sa indeksom`);
};

// ============================================================
// BENCHMARK TESTOVI
// ============================================================

const runBenchmarks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Povezano sa MongoDB");

    const totalDocs = await Product.countDocuments();
    console.log(`📊 Ukupno dokumenata: ${totalDocs}`);

    if (totalDocs < 1000) {
      console.log("\n⚠️  Preporučujemo minimum 5000 dokumenata za benchmark.");
      console.log("   Pokrenite 'npm run seed' za generisanje test podataka.");
    }

    const ITERATIONS = 50;

    // ============================================================
    // BENCHMARK 1: Single Field Query
    // ============================================================
    separator("BENCHMARK 1: Single Field Query (category)");

    console.log("\nQuery: find({ category: 'electronics' })");
    console.log("Indeks: { category: 1 }");

    // Sa indeksom (već postoji)
    const singleWithIndex = await benchmark(
      "SA INDEKSOM",
      () => Product.find({ category: "electronics" }).lean(),
      ITERATIONS
    );
    printBenchmark(singleWithIndex);

    // Bez indeksa
    console.log("\n⏳ Brisanje indeksa za test...");
    try {
      await Product.collection.dropIndex("category_1");
    } catch (e) { /* možda ne postoji */ }

    const singleWithoutIndex = await benchmark(
      "BEZ INDEKSA",
      () => Product.find({ category: "electronics" }).lean(),
      ITERATIONS
    );
    printBenchmark(singleWithoutIndex);

    // Vrati indeks
    await Product.collection.createIndex({ category: 1 });
    console.log("\n✓ Indeks vraćen");

    compareBenchmarks(singleWithIndex, singleWithoutIndex);

    // ============================================================
    // BENCHMARK 2: Compound Query + Sort
    // ============================================================
    separator("BENCHMARK 2: Compound Query + Sort");

    console.log("\nQuery: find({ category, price range }).sort({ price: -1 })");
    console.log("Indeks: { category: 1, price: -1 }");

    const compoundQuery = {
      category: "electronics",
      price: { $gte: 100, $lte: 500 },
    };

    // Sa indeksom
    const compoundWithIndex = await benchmark(
      "SA COMPOUND INDEKSOM",
      () => Product.find(compoundQuery).sort({ price: -1 }).limit(20).lean(),
      ITERATIONS
    );
    printBenchmark(compoundWithIndex);

    // Bez indeksa
    console.log("\n⏳ Brisanje compound indeksa za test...");
    try {
      await Product.collection.dropIndex("category_1_price_-1");
    } catch (e) { /* možda ne postoji */ }

    const compoundWithoutIndex = await benchmark(
      "BEZ COMPOUND INDEKSA",
      () => Product.find(compoundQuery).sort({ price: -1 }).limit(20).lean(),
      ITERATIONS
    );
    printBenchmark(compoundWithoutIndex);

    // Vrati indeks
    await Product.collection.createIndex({ category: 1, price: -1 });
    console.log("\n✓ Compound indeks vraćen");

    compareBenchmarks(compoundWithIndex, compoundWithoutIndex);

    // ============================================================
    // BENCHMARK 3: Unique Index Lookup
    // ============================================================
    separator("BENCHMARK 3: Unique Index Lookup (SKU)");

    // Pronađi SKU za test
    const sampleProduct = await Product.findOne().select("sku").lean();
    const testSku = sampleProduct.sku;

    console.log(`\nQuery: findOne({ sku: '${testSku}' })`);
    console.log("Indeks: { sku: 1 } unique");

    // Sa unique indeksom
    const uniqueWithIndex = await benchmark(
      "SA UNIQUE INDEKSOM",
      () => Product.findOne({ sku: testSku }).lean(),
      ITERATIONS
    );
    printBenchmark(uniqueWithIndex);

    // Bez indeksa (ne možemo obrisati unique jer bi pukla schema)
    // Simuliramo sa drugim poljem
    console.log("\n📝 Za unique indeks ne možemo obrisati i uporediti,");
    console.log("   ali tipično ubrzanje je 100-1000x za velike kolekcije.");

    // ============================================================
    // BENCHMARK 4: Text Search
    // ============================================================
    separator("BENCHMARK 4: Text Search");

    console.log('\nQuery: find({ $text: { $search: "wireless" } })');
    console.log("Indeks: { name: 'text', description: 'text' }");

    const textWithIndex = await benchmark(
      "SA TEXT INDEKSOM",
      () => Product.find({ $text: { $search: "wireless" } }).limit(20).lean(),
      ITERATIONS
    );
    printBenchmark(textWithIndex);

    console.log("\n📝 Text pretraga BEZ text indeksa nije moguća u MongoDB.");
    console.log("   Alternativa bi bila regex koji je MNOGO sporiji.");

    // Regex alternativa
    const regexBenchmark = await benchmark(
      "REGEX ALTERNATIVA (sporije)",
      () => Product.find({ name: { $regex: /wireless/i } }).limit(20).lean(),
      ITERATIONS
    );
    printBenchmark(regexBenchmark);

    console.log("\n  📊 POREĐENJE TEXT vs REGEX:");
    console.log(`  ${"─".repeat(50)}`);
    console.log(`  Text indeks (avg):    ${textWithIndex.avgMs}ms`);
    console.log(`  Regex (avg):          ${regexBenchmark.avgMs}ms`);
    const textVsRegex = parseFloat(regexBenchmark.avgMs) / parseFloat(textWithIndex.avgMs);
    console.log(`  Text je ${textVsRegex.toFixed(1)}x brži od regex-a`);

    // ============================================================
    // BENCHMARK 5: Array Field
    // ============================================================
    separator("BENCHMARK 5: Array Field (tags)");

    console.log("\nQuery: find({ tags: 'wireless' })");
    console.log("Indeks: { tags: 1 }");

    // Sa indeksom
    const arrayWithIndex = await benchmark(
      "SA ARRAY INDEKSOM",
      () => Product.find({ tags: "wireless" }).limit(50).lean(),
      ITERATIONS
    );
    printBenchmark(arrayWithIndex);

    // Bez indeksa
    console.log("\n⏳ Brisanje array indeksa za test...");
    try {
      await Product.collection.dropIndex("tags_1");
    } catch (e) { /* možda ne postoji */ }

    const arrayWithoutIndex = await benchmark(
      "BEZ ARRAY INDEKSA",
      () => Product.find({ tags: "wireless" }).limit(50).lean(),
      ITERATIONS
    );
    printBenchmark(arrayWithoutIndex);

    // Vrati indeks
    await Product.collection.createIndex({ tags: 1 });
    console.log("\n✓ Array indeks vraćen");

    compareBenchmarks(arrayWithIndex, arrayWithoutIndex);

    // ============================================================
    // BENCHMARK 6: Count Operations
    // ============================================================
    separator("BENCHMARK 6: Count Operations");

    console.log("\nQuery: countDocuments({ category: 'footwear' })");

    // Sa indeksom
    const countWithIndex = await benchmark(
      "COUNT SA INDEKSOM",
      () => Product.countDocuments({ category: "footwear" }),
      ITERATIONS
    );
    printBenchmark(countWithIndex);

    // estimatedDocumentCount je brži (ne koristi filter)
    const estimatedCount = await benchmark(
      "ESTIMATED COUNT (ukupno)",
      () => Product.estimatedDocumentCount(),
      ITERATIONS
    );
    printBenchmark(estimatedCount);

    console.log("\n💡 TIP: estimatedDocumentCount() je brži za ukupan broj,");
    console.log("   ali ne podržava filtere.");

    // ============================================================
    // SUMMARY
    // ============================================================
    separator("SUMMARY - ZAKLJUČCI");

    console.log(`
  📈 TIPIČNA POBOLJŠANJA SA INDEKSIMA:

  ┌────────────────────────────────────┬─────────────────┐
  │ Tip upita                          │ Poboljšanje     │
  ├────────────────────────────────────┼─────────────────┤
  │ Single field equality              │ 10-100x         │
  │ Compound query + sort              │ 10-50x          │
  │ Unique field lookup                │ 100-1000x       │
  │ Text search vs regex               │ 5-20x           │
  │ Array field search                 │ 10-50x          │
  │ Range queries                      │ 5-20x           │
  └────────────────────────────────────┴─────────────────┘

  ⚠️  NAPOMENE:
  • Rezultati zavise od veličine kolekcije
  • Veće kolekcije = veća razlika
  • RAM keš utiče na rezultate
  • Produkcija može imati drugačije rezultate

  💡 PREPORUKE:
  • Uvek testirajte sa realističnim podacima
  • Koristite explain() za analizu upita
  • Pratite index stats za nekorišćene indekse
  • Balans između read i write performansi
`);

    console.log("✅ Benchmark završen!");

  } catch (error) {
    console.error("❌ Greška:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("\n✓ Diskonektovano sa MongoDB");
  }
};

// Pokreni
runBenchmarks();
