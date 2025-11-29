import express from 'express';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// __dirname ekvivalent za ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ═══════════════════════════════════════════════════════════════════
 * UPLOAD ROUTES
 * ═══════════════════════════════════════════════════════════════════
 * 
 * POST /upload - Upload JEDNE slike
 * POST /upload/multi - Upload VIŠE slika (maksimum 5)
 * GET /upload/:filename - Preuzmi upload-ovanu sliku
 */

/**
 * POST /upload - Upload jedne slike
 * 
 * Primer korišćenja (Frontend - React):
 * --------------------------------------
 * const formData = new FormData();
 * formData.append('image', selectedFile);
 * 
 * await axios.post('/upload', formData, {
 *   headers: { 'Content-Type': 'multipart/form-data' }
 * });
 * 
 * Response:
 * {
 *   message: "Upload uspešan!",
 *   file: {
 *     filename: "1704123456789-photo.jpg",
 *     originalname: "photo.jpg",
 *     path: "uploads/1704123456789-photo.jpg",
 *     size: 123456,
 *     mimetype: "image/jpeg"
 *   }
 * }
 */
router.post('/', uploadSingle, (req, res, next) => {
  try {
    // req.file se automatski dodaje od strane multer middleware-a
    if (!req.file) {
      const err = new Error('Nijedan fajl nije upload-ovan');
      err.status = 400;
      return next(err);
    }

    res.json({
      message: 'Upload uspešan!',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        // URL za pristup slici (ako želiš da je vratiš frontendu)
        url: `/upload/${req.file.filename}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /upload/multi - Upload više slika
 * 
 * Primer korišćenja (Frontend - React):
 * --------------------------------------
 * const formData = new FormData();
 * files.forEach(file => {
 *   formData.append('files', file);
 * });
 * 
 * await axios.post('/upload/multi', formData, {
 *   headers: { 'Content-Type': 'multipart/form-data' }
 * });
 * 
 * Response:
 * {
 *   message: "Upload uspešan!",
 *   files: [
 *     { filename: "...", ... },
 *     { filename: "...", ... }
 *   ]
 * }
 */
router.post('/multi', uploadMultiple, (req, res, next) => {
  try {
    // req.files je NIZ fajlova (upload.array() vraća niz)
    if (!req.files || req.files.length === 0) {
      const err = new Error('Nijedan fajl nije upload-ovan');
      err.status = 400;
      return next(err);
    }

    // Mapiraj fajlove u format koji želimo da vratimo
    const files = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: `/upload/${file.filename}`,
    }));

    res.json({
      message: 'Upload uspešan!',
      count: files.length,
      files: files,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /upload/images - Lista svih upload-ovanih slika
 *
 * Vraća listu svih slika u uploads folderu sa njihovim URL-ovima
 */
router.get('/images', (req, res, next) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');

    // Proveri da li folder postoji
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        count: 0,
        images: [],
      });
    }

    // Pročitaj sve fajlove iz uploads foldera
    const files = fs.readdirSync(uploadsDir);

    // Filtriraj samo slike
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map(filename => {
        const filePath = path.join(uploadsDir, filename);
        const stats = fs.statSync(filePath);

        return {
          filename,
          url: `/uploads/${filename}`,
          size: stats.size,
          uploadedAt: stats.mtime,
        };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); // Najnovije prvo

    res.json({
      count: images.length,
      images,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /upload/:filename - Preuzmi upload-ovanu sliku
 *
 * Ovo omogućava da direktno pristupaš upload-ovanim slikama
 * Primer: GET /upload/1704123456789-photo.jpg
 */
router.get('/:filename', (req, res, next) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Express automatski pošalje fajl
    res.sendFile(filePath, (err) => {
      if (err) {
        const error = new Error('Fajl nije pronađen');
        error.status = 404;
        return next(error);
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
