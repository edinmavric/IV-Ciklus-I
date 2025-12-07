import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";

const router = Router();

// ============================================================
// SWAGGER SCHEMAS - Definicije tipova podataka
// ============================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId - automatski generisan
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Naziv proizvoda (2-100 karaktera)
 *           minLength: 2
 *           maxLength: 100
 *           example: "Laptop ASUS ROG"
 *         description:
 *           type: string
 *           description: Detaljan opis proizvoda (max 500 karaktera)
 *           maxLength: 500
 *           example: "Gaming laptop sa RTX 4080 grafickom"
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *           description: Cena proizvoda u EUR
 *           example: 2499.99
 *         category:
 *           type: string
 *           description: Kategorija proizvoda
 *           enum: [electronics, footwear, gaming, clothing, accessories]
 *           example: "electronics"
 *         stock:
 *           type: integer
 *           minimum: 0
 *           description: Kolicina na stanju
 *           example: 15
 *         isActive:
 *           type: boolean
 *           description: Da li je proizvod aktivan
 *           default: true
 *           example: true
 *         inStock:
 *           type: boolean
 *           description: Virtualno polje - da li ima na stanju (stock > 0)
 *           readOnly: true
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Datum kreiranja (automatski - Mongoose timestamps)
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Datum poslednje izmene (automatski - Mongoose timestamps)
 *           example: "2024-01-20T14:00:00Z"
 *
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           description: Naziv proizvoda
 *           example: "Novi Proizvod"
 *         description:
 *           type: string
 *           description: Detaljan opis proizvoda
 *           example: "Opis novog proizvoda"
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *           description: Cena proizvoda (mora biti pozitivan broj)
 *           example: 99.99
 *         category:
 *           type: string
 *           description: Kategorija proizvoda
 *           example: "electronics"
 *         stock:
 *           type: integer
 *           minimum: 0
 *           description: Kolicina na stanju
 *           example: 10
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operacija uspesno izvrsena"
 *         data:
 *           $ref: '#/components/schemas/Product'
 *
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: integer
 *           description: Broj proizvoda na trenutnoj stranici
 *           example: 5
 *         total:
 *           type: integer
 *           description: Ukupan broj proizvoda
 *           example: 25
 *         page:
 *           type: integer
 *           description: Trenutna stranica
 *           example: 1
 *         totalPages:
 *           type: integer
 *           description: Ukupan broj stranica
 *           example: 3
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Greska pri obradi zahteva"
 *         error:
 *           type: string
 *           example: "Detalji greske"
 *
 *     ValidationError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Validaciona greska"
 *         errors:
 *           type: array
 *           description: Lista Mongoose validacionih gresaka
 *           items:
 *             type: string
 *           example:
 *             - "Naziv proizvoda je obavezan"
 *             - "Cena mora biti veca od 0"
 *             - "Kategorija mora biti: electronics, footwear, gaming, clothing ili accessories"
 */

// ============================================================
// ROUTES SA SWAGGER DOKUMENTACIJOM
// ============================================================

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Vrati sve proizvode
 *     description: |
 *       Vraća listu svih proizvoda sa mogućnošću filtriranja, sortiranja i paginacije.
 *
 *       **Primeri korišćenja:**
 *       - `/api/products` - svi proizvodi
 *       - `/api/products?category=electronics` - samo elektronika
 *       - `/api/products?minPrice=100&maxPrice=500` - proizvodi u cenovnom rangu
 *       - `/api/products?sort=price:asc` - sortirano po ceni rastuce
 *       - `/api/products?sort=-createdAt` - sortirano po datumu (najnovije prvo)
 *       - `/api/products?page=2&limit=5` - druga stranica, 5 proizvoda
 *       - `/api/products?search=laptop` - pretraga po nazivu/opisu
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pretraga po nazivu ili opisu proizvoda (full-text search)
 *         example: laptop
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [electronics, footwear, gaming, clothing, accessories]
 *         description: Filtriraj po kategoriji
 *         example: electronics
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimalna cena
 *         example: 100
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maksimalna cena
 *         example: 1000
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Mongoose sort format: polje za rastuce, -polje za opadajuce (price, -price, -createdAt)"
 *         example: -createdAt
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Broj stranice za paginaciju
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Broj proizvoda po stranici
 *     responses:
 *       200:
 *         description: Lista proizvoda uspesno vracena
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *             example:
 *               success: true
 *               count: 5
 *               total: 5
 *               page: 1
 *               totalPages: 1
 *               data:
 *                 - id: "1"
 *                   name: "Laptop ASUS ROG"
 *                   description: "Gaming laptop sa RTX 4080 grafickom"
 *                   price: 2499.99
 *                   category: "electronics"
 *                   stock: 15
 *                   createdAt: "2024-01-15T10:30:00Z"
 *       500:
 *         description: Interna greska servera
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Vrati jedan proizvod po ID-ju
 *     description: Vraća detalje jednog proizvoda na osnovu njegovog jedinstvenog ID-ja.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId proizvoda
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Proizvod uspesno pronadjen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Laptop ASUS ROG"
 *                 description: "Gaming laptop sa RTX 4080 grafickom"
 *                 price: 2499.99
 *                 category: "electronics"
 *                 stock: 15
 *                 isActive: true
 *                 inStock: true
 *                 createdAt: "2024-01-15T10:30:00Z"
 *                 updatedAt: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Nevalidan format ID-ja
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Nevalidan format ID-ja"
 *       404:
 *         description: Proizvod nije pronadjen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Proizvod sa ID-jem 507f1f77bcf86cd799439011 nije pronadjen"
 *       500:
 *         description: Interna greska servera
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Kreiraj novi proizvod
 *     description: |
 *       Kreira novi proizvod u sistemu.
 *
 *       **Obavezna polja:** name, price, category
 *
 *       **Validacija:**
 *       - price mora biti pozitivan broj
 *       - stock mora biti >= 0
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *           examples:
 *             laptop:
 *               summary: Primer laptop proizvoda
 *               value:
 *                 name: "MacBook Pro 14"
 *                 description: "Apple laptop sa M3 Pro cipom"
 *                 price: 1999.99
 *                 category: "electronics"
 *                 stock: 25
 *             patike:
 *               summary: Primer patika
 *               value:
 *                 name: "Adidas Ultraboost"
 *                 description: "Patike za trcanje"
 *                 price: 189.99
 *                 category: "footwear"
 *                 stock: 50
 *     responses:
 *       201:
 *         description: Proizvod uspesno kreiran
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Proizvod uspesno kreiran"
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validaciona greska - nedostaju obavezna polja
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               missingFields:
 *                 summary: Nedostaju obavezna polja
 *                 value:
 *                   success: false
 *                   message: "Polja name, price i category su obavezna"
 *                   errors:
 *                     name: "Name je obavezan"
 *                     price: null
 *                     category: "Category je obavezna"
 *               invalidPrice:
 *                 summary: Nevalidna cena
 *                 value:
 *                   success: false
 *                   message: "Price mora biti pozitivan broj"
 *       401:
 *         description: Neautorizovan pristup - nedostaje ili nevalidan token
 *       500:
 *         description: Interna greska servera
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Azuriraj postojeci proizvod
 *     description: |
 *       Azurira podatke postojeceg proizvoda.
 *       Sva polja su opciona - azuriraju se samo prosledjena polja.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId proizvoda koji se azurira
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Azurirani naziv"
 *               description:
 *                 type: string
 *                 example: "Novi opis proizvoda"
 *               price:
 *                 type: number
 *                 example: 1599.99
 *               category:
 *                 type: string
 *                 example: "electronics"
 *               stock:
 *                 type: integer
 *                 example: 30
 *           example:
 *             name: "Laptop ASUS ROG - Updated"
 *             price: 2299.99
 *             stock: 20
 *     responses:
 *       200:
 *         description: Proizvod uspesno azuriran
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Proizvod uspesno azuriran"
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validaciona greska
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Price mora biti pozitivan broj"
 *       404:
 *         description: Proizvod nije pronadjen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Proizvod sa ID-jem 999 nije pronadjen"
 *       401:
 *         description: Neautorizovan pristup
 *       500:
 *         description: Interna greska servera
 */
router.put("/:id", updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Obrisi proizvod
 *     description: Trajno brise proizvod iz sistema. Ova akcija se ne moze ponistiti.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId proizvoda koji se brise
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Proizvod uspesno obrisan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Proizvod uspesno obrisan"
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *             example:
 *               success: true
 *               message: "Proizvod uspesno obrisan"
 *               data:
 *                 id: "1"
 *                 name: "Laptop ASUS ROG"
 *                 price: 2499.99
 *                 category: "electronics"
 *       404:
 *         description: Proizvod nije pronadjen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Neautorizovan pristup
 *       500:
 *         description: Interna greska servera
 */
router.delete("/:id", deleteProduct);

export default router;
