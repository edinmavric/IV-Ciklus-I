import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

import dotenv from 'dotenv';

dotenv.config();

const app = express();

// __dirname ekvivalent za ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════
// KREIRANJE UPLOADS FOLDERA (ako ne postoji)
// ═══════════════════════════════════════════════════════════════════
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// ═══════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════

// Parsiranje JSON body-ja
app.use(express.json());

// CORS - omogućava frontend-u da pristupa API-ju
app.use(cors());

// General Rate Limiting - ograničava broj zahteva (100 zahteva u 15 minuta)
// Ovo se primenjuje na SVE rute (osim login - on ima svoj strožiji limiter)
app.use(generalLimiter);

// ═══════════════════════════════════════════════════════════════════
// RUTE
// ═══════════════════════════════════════════════════════════════════

// Auth rute (login ima svoj rate limiter u authRoutes.js)
app.use('/auth', authRoutes);

// User rute
app.use('/users', userRoutes);

// Product rute (sa filtriranjem, sortiranjem, soft delete)
app.use('/products', productRoutes);

// Upload rute (za upload slika)
app.use('/upload', uploadRoutes);

// ═══════════════════════════════════════════════════════════════════
// STATIČKI FILES - Omogućava pristup upload-ovanim slikama
// ═══════════════════════════════════════════════════════════════════
// Ovo omogućava da pristupaš upload-ovanim slikama direktno:
// GET http://localhost:3000/uploads/1704123456789-photo.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═══════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════
// VAŽNO: Error handleri moraju biti POSLEDNJI!

// 404 Handler - hvata sve rute koje nisu pronađene
app.use(notFoundHandler);

// Global Error Handler - hvata sve greške u aplikaciji
app.use(errorHandler);

// DATABASE CONNECTION I SERVER START
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
