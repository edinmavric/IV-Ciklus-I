import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  createProductWithImage,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { uploadSingle } from "../config/multer.config.js";

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PRODUCT ROUTES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * GET    /products              → Svi proizvodi (sa pretraga i sortiranjem)
 * GET    /products/:id          → Jedan proizvod
 * POST   /products              → Kreiraj proizvod (bez slike)
 * POST   /products/with-image   → Kreiraj proizvod sa slikom
 * PUT    /products/:id          → Ažuriraj proizvod
 * DELETE /products/:id          → Obriši proizvod
 *
 * QUERY PARAMETRI za GET /products:
 * ----------------------------------
 * ?search=phone    → Pretraga po imenu
 * ?sort=price      → Sortiranje rastuće
 * ?sort=-price     → Sortiranje opadajuće
 */

// GET /products - Svi proizvodi sa pretragom i sortiranjem
router.get("/", getProducts);

// GET /products/:id - Jedan proizvod
router.get("/:id", getProductById);

// POST /products - Kreiraj proizvod (samo JSON, bez slike)
router.post("/", createProduct);

/**
 * POST /products/with-image - Kreiraj proizvod SA SLIKOM
 * --------------------------------------------------------
 *
 * uploadSingle je middleware koji:
 * 1. Prima multipart/form-data
 * 2. Parsira fajl
 * 3. Čuva fajl na disk
 * 4. Dodaje informacije u req.file
 *
 * Tek nakon toga se poziva createProductWithImage controller
 */
router.post("/with-image", uploadSingle, createProductWithImage);

// PUT /products/:id - Ažuriraj proizvod
router.put("/:id", updateProduct);

// DELETE /products/:id - Obriši proizvod
router.delete("/:id", deleteProduct);

export default router;
