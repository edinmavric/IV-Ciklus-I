/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UPLOAD CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Kontroler za upload fajlova
 *
 * VAŽNO: Pre ovih funkcija mora proći Multer middleware!
 * Multer dodaje:
 * - req.file (za single upload)
 * - req.files (za multiple upload)
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UPLOAD SINGLE IMAGE - Upload jedne slike
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ruta: POST /upload
 * Middleware: uploadSingle (iz multer.config.js)
 *
 * req.file sadrži:
 * {
 *   fieldname: 'image',           // Ime polja iz FormData
 *   originalname: 'slika.jpg',    // Originalno ime fajla
 *   encoding: '7bit',
 *   mimetype: 'image/jpeg',       // MIME tip
 *   destination: 'uploads',       // Folder
 *   filename: '1701234567890-slika.jpg',  // Novo ime
 *   path: 'uploads/1701234567890-slika.jpg',  // Puna putanja
 *   size: 123456                  // Veličina u bajtovima
 * }
 */
export const uploadSingleImage = (req, res, next) => {
  try {
    // Proveri da li je fajl upload-ovan
    if (!req.file) {
      const err = new Error("Nijedan fajl nije upload-ovan");
      err.status = 400;
      return next(err);
    }

    // Vrati informacije o upload-ovanom fajlu
    res.json({
      message: "Upload uspešan!",
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        // URL za pristup slici (ako koristimo express.static)
        url: `/uploads/${req.file.filename}`,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UPLOAD MULTIPLE IMAGES - Upload više slika
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ruta: POST /upload/multi
 * Middleware: uploadMultiple (iz multer.config.js)
 *
 * req.files je NIZ objekata (isti format kao req.file za svaki)
 */
export const uploadMultipleImages = (req, res, next) => {
  try {
    // Proveri da li su fajlovi upload-ovani
    if (!req.files || req.files.length === 0) {
      const err = new Error("Nijedan fajl nije upload-ovan");
      err.status = 400;
      return next(err);
    }

    // Mapiraj informacije o fajlovima
    const files = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`,
    }));

    res.json({
      message: "Upload uspešan!",
      count: files.length,
      files,
    });
  } catch (err) {
    next(err);
  }
};
