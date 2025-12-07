import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Učitaj .env iz root foldera projekta
dotenv.config({ path: path.join(__dirname, "../.env") });

import express from "express";
import { swaggerSpec, swaggerUi } from "./config/swagger.js";
import connectDB from "./config/database.js";
import productsRouter from "./routes/products.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// DATABASE KONEKCIJA
// ============================================================
connectDB();

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// SWAGGER DOKUMENTACIJA
// ============================================================
// Swagger UI dostupan na: http://localhost:3000/api-docs
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Products API Documentation',
  })
);

// JSON verzija OpenAPI specifikacije
// Dostupna na: http://localhost:3000/api-docs.json
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================================
// ROUTES
// ============================================================

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Proverava da li je server aktivan i vraca osnovne informacije
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server je aktivan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 documentation:
 *                   type: string
 *                   example: "http://localhost:3000/api-docs"
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    documentation: `http://localhost:${PORT}/api-docs`,
  });
});

// Products API routes
app.use('/api/products', productsRouter);

// ============================================================
// ROOT ROUTE
// ============================================================
app.get('/', (req, res) => {
  res.json({
    message: 'Dobrodosli na Products API',
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      health: '/health',
      products: '/api/products',
      swagger: '/api-docs',
      openapi: '/api-docs.json',
    },
  });
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} ne postoji`,
    documentation: `http://localhost:${PORT}/api-docs`,
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Interna greska servera',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    PRODUCTS API SERVER                     ║
╠════════════════════════════════════════════════════════════╣
║  Server:        http://localhost:${PORT}                      ║
║  API Docs:      http://localhost:${PORT}/api-docs             ║
║  OpenAPI JSON:  http://localhost:${PORT}/api-docs.json        ║
║  Health Check:  http://localhost:${PORT}/health               ║
╚════════════════════════════════════════════════════════════╝
  `);
});
