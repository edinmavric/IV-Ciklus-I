import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  hardDeleteProduct,
} from '../controllers/productsController.js';

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════════
 * PRODUCT ROUTES
 * ═══════════════════════════════════════════════════════════════════
 * 
 * GET    /products          → Svi proizvodi (sa filterima i sortiranjem)
 * GET    /products/:id      → Jedan proizvod
 * POST   /products          → Kreiraj proizvod
 * PUT    /products/:id      → Ažuriraj proizvod
 * DELETE /products/:id      → Soft delete (označi kao obrisan)
 * DELETE /products/:id/hard → Hard delete (trajno obriši)
 */

// GET /products - Svi proizvodi sa filtriranjem i sortiranjem
router.get('/', getProducts);

// GET /products/:id - Jedan proizvod
router.get('/:id', getProductById);

// POST /products - Kreiraj proizvod
router.post('/', createProduct);

// PUT /products/:id - Ažuriraj proizvod
router.put('/:id', updateProduct);

// DELETE /products/:id - Soft delete (označi kao obrisan)
router.delete('/:id', softDeleteProduct);

// DELETE /products/:id/hard - Hard delete (trajno obriši iz baze)
router.delete('/:id/hard', hardDeleteProduct);

export default router;
