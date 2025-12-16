/**
 * ============================================================
 * SEED DATA SCRIPT
 * ============================================================
 * Popunjava bazu sa test podacima za demonstraciju indeksa
 *
 * Pokreni sa: npm run seed
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

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// ============================================================
// TEST PODACI
// ============================================================

const categories = ["electronics", "footwear", "gaming", "clothing", "accessories"];

const brands = {
  electronics: ["Samsung", "Apple", "Sony", "LG", "Philips", "Bose", "JBL"],
  footwear: ["Nike", "Adidas", "Puma", "Reebok", "New Balance", "Converse"],
  gaming: ["Sony", "Microsoft", "Nintendo", "Razer", "Logitech", "SteelSeries"],
  clothing: ["Zara", "H&M", "Levis", "Tommy Hilfiger", "Calvin Klein"],
  accessories: ["Ray-Ban", "Fossil", "Casio", "Swatch", "Oakley"],
};

const productNames = {
  electronics: [
    "Wireless Headphones",
    "Bluetooth Speaker",
    "Smart Watch",
    "4K TV",
    "Laptop",
    "Tablet",
    "Smartphone",
    "Wireless Earbuds",
    "Power Bank",
    "USB Hub",
    "Monitor",
    "Keyboard",
    "Mouse",
    "Webcam",
    "Microphone",
  ],
  footwear: [
    "Running Shoes",
    "Basketball Sneakers",
    "Casual Sneakers",
    "Hiking Boots",
    "Sandals",
    "Flip Flops",
    "Formal Shoes",
    "Sports Shoes",
    "Training Shoes",
    "Canvas Shoes",
  ],
  gaming: [
    "Gaming Console",
    "Gaming Headset",
    "Gaming Mouse",
    "Gaming Keyboard",
    "Gaming Chair",
    "Gaming Monitor",
    "Controller",
    "VR Headset",
    "Racing Wheel",
    "Arcade Stick",
  ],
  clothing: [
    "T-Shirt",
    "Jeans",
    "Hoodie",
    "Jacket",
    "Sweater",
    "Polo Shirt",
    "Shorts",
    "Dress Shirt",
    "Blazer",
    "Coat",
  ],
  accessories: [
    "Sunglasses",
    "Watch",
    "Belt",
    "Wallet",
    "Backpack",
    "Hat",
    "Scarf",
    "Gloves",
    "Tie",
    "Bracelet",
  ],
};

const tags = {
  electronics: ["wireless", "bluetooth", "smart", "portable", "rechargeable", "waterproof", "noise-cancelling"],
  footwear: ["comfortable", "lightweight", "waterproof", "breathable", "durable", "sport", "casual"],
  gaming: ["rgb", "mechanical", "wireless", "pro", "esports", "high-performance", "ergonomic"],
  clothing: ["cotton", "slim-fit", "casual", "formal", "vintage", "streetwear", "sustainable"],
  accessories: ["leather", "stainless-steel", "waterproof", "elegant", "sporty", "vintage", "unisex"],
};

const adjectives = ["Premium", "Pro", "Elite", "Ultra", "Max", "Plus", "Lite", "Classic", "Modern", "Essential"];
const colors = ["Black", "White", "Blue", "Red", "Green", "Silver", "Gold", "Gray", "Navy", "Brown"];

// ============================================================
// GENERISANJE PROIZVODA
// ============================================================

const generateProduct = (index) => {
  const category = randomElement(categories);
  const brand = randomElement(brands[category]);
  const baseName = randomElement(productNames[category]);
  const adjective = randomElement(adjectives);
  const color = randomElement(colors);

  // Kreiraj jedinstveno ime
  const name = `${brand} ${adjective} ${baseName} ${color}`;

  // SKU format: CAT-BRAND-NUMBER
  const sku = `${category.substring(0, 3).toUpperCase()}-${brand.substring(0, 3).toUpperCase()}-${String(index).padStart(5, "0")}`;

  // Random tagovi (2-4 taga)
  const productTags = [];
  const numTags = randomNumber(2, 4);
  const availableTags = [...tags[category]];
  for (let i = 0; i < numTags && availableTags.length > 0; i++) {
    const tagIndex = randomNumber(0, availableTags.length - 1);
    productTags.push(availableTags.splice(tagIndex, 1)[0]);
  }

  // Random datum u poslednjih godinu dana
  const createdAt = new Date(
    Date.now() - randomNumber(0, 365) * 24 * 60 * 60 * 1000
  );

  return {
    name,
    sku,
    description: `${adjective} ${baseName.toLowerCase()} by ${brand}. Available in ${color.toLowerCase()} color. High quality ${category} product with modern design and excellent performance.`,
    price: randomFloat(10, 2000),
    category,
    brand,
    stock: randomNumber(0, 200),
    rating: randomFloat(1, 5, 1),
    reviewCount: randomNumber(0, 500),
    tags: productTags,
    isActive: Math.random() > 0.1, // 90% aktivnih
    isFeatured: Math.random() > 0.85, // 15% featured
    createdAt,
    updatedAt: createdAt,
  };
};

// ============================================================
// MAIN FUNKCIJA
// ============================================================

const seedDatabase = async () => {
  try {
    // Konekcija na bazu
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Povezano sa MongoDB");

    // Obriši postojeće podatke
    await Product.deleteMany({});
    console.log("✓ Obrisani postojeći podaci");

    // Generiši proizvode
    const NUM_PRODUCTS = 5000;
    console.log(`\n⏳ Generisanje ${NUM_PRODUCTS} proizvoda...`);

    const products = [];
    for (let i = 1; i <= NUM_PRODUCTS; i++) {
      products.push(generateProduct(i));
    }

    // Batch insert
    const batchSize = 500;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      await Product.insertMany(batch);
      console.log(`  Ubačeno ${Math.min(i + batchSize, NUM_PRODUCTS)}/${NUM_PRODUCTS} proizvoda`);
    }

    console.log("\n✓ Svi proizvodi ubačeni uspešno!");

    // Statistika
    console.log("\n📊 STATISTIKA:");
    console.log("─".repeat(40));

    const stats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    stats.forEach((s) => {
      console.log(
        `  ${s._id.padEnd(15)} | ${String(s.count).padStart(4)} proizvoda | Avg cena: $${s.avgPrice.toFixed(2).padStart(7)} | Avg rating: ${s.avgRating.toFixed(1)}`
      );
    });

    const totalActive = await Product.countDocuments({ isActive: true });
    const totalFeatured = await Product.countDocuments({ isFeatured: true });

    console.log("─".repeat(40));
    console.log(`  UKUPNO:         | ${NUM_PRODUCTS} proizvoda`);
    console.log(`  Aktivni:        | ${totalActive} (${((totalActive / NUM_PRODUCTS) * 100).toFixed(1)}%)`);
    console.log(`  Featured:       | ${totalFeatured} (${((totalFeatured / NUM_PRODUCTS) * 100).toFixed(1)}%)`);

    // Prikaži indekse
    console.log("\n📑 KREIRANI INDEKSI:");
    console.log("─".repeat(40));

    const indexes = await Product.collection.getIndexes();
    Object.entries(indexes).forEach(([name, index]) => {
      const keyStr = JSON.stringify(index.key);
      const options = [];
      if (index.unique) options.push("unique");
      if (index.sparse) options.push("sparse");
      if (index.partialFilterExpression) options.push("partial");
      if (index.textIndexVersion) options.push("text");

      console.log(`  ${name}`);
      console.log(`    Keys: ${keyStr}`);
      if (options.length > 0) {
        console.log(`    Options: ${options.join(", ")}`);
      }
    });

    console.log("\n✅ Seed završen uspešno!");
    console.log("   Pokrenite 'npm run dev' da startujete server");

  } catch (error) {
    console.error("❌ Greška:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n✓ Diskonektovano sa MongoDB");
  }
};

// Pokreni
seedDatabase();
