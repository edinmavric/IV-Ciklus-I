import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Routes
import productRoutes from "./routes/product.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

dotenv.config();

const app = express();

// __dirname za ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KREIRANJE UPLOADS FOLDERA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ako "uploads" folder ne postoji, kreiraj ga
 * Inače bi Multer bacio grešku kada pokuša da sačuva fajl
 */
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Kreiran uploads folder");
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Parsiranje JSON body-ja
app.use(express.json());

// CORS - omogućava frontend-u pristup API-ju
app.use(cors());

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVIRANJE STATIČKIH FAJLOVA - Upload-ovane slike
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ovo omogućava da klijent pristupi upload-ovanim slikama direktno:
 * http://localhost:3000/uploads/1701234567890-slika.jpg
 *
 * Kako radi:
 * ----------
 * 1. Klijent traži: GET /uploads/slika.jpg
 * 2. Express traži fajl u: ./uploads/slika.jpg
 * 3. Ako postoji, vraća fajl
 * 4. Ako ne postoji, vraća 404
 */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RUTE
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Product rute (sa pretragom, sortiranjem i upload-om)
app.use("/products", productRoutes);

// Upload rute (samo za upload slika)
app.use("/upload", uploadRoutes);

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════════════════
 */

// 404 - Ruta nije pronađena
app.use((req, res, next) => {
  const err = new Error(`Ruta ${req.originalUrl} nije pronađena`);
  err.status = 404;
  next(err);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Greška:", err.message);

  res.status(err.status || 500).json({
    error: err.message || "Interna greška servera",
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATABASE I SERVER
 * ═══════════════════════════════════════════════════════════════════════════
 */
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cas22";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB povezan");
    app.listen(PORT, () => {
      console.log(`Server pokrenut na http://localhost:${PORT}`);
      console.log("");
      console.log("Test URL-ovi:");
      console.log("─────────────");
      console.log("GET  /products              → Svi proizvodi");
      console.log("GET  /products?search=phone → Pretraga");
      console.log("GET  /products?sort=-price  → Sortiranje");
      console.log("POST /products              → Kreiraj proizvod");
      console.log("POST /upload                → Upload slike");
    });
  })
  .catch((err) => {
    console.error("MongoDB greška:", err);
    process.exit(1);
  });
