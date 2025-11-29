/**
 * ═══════════════════════════════════════════════════════════════════
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Šta je Global Error Handler?
 * -----------------------------
 * To je middleware koji HVATA SVE greške u aplikaciji i vraća
 * konzistentan format odgovora.
 * 
 * Zašto nam treba?
 * ----------------
 * Umesto da u SVAKOM kontroleru pišeš:
 *   try {
 *     // kod
 *   } catch (err) {
 *     res.status(500).json({ error: err.message });
 *   }
 * 
 * Ovo hvata SVE greške AUTOMATSKI!
 * 
 * Kako koristiti?
 * ---------------
 * 1. U kontroleru, umesto try/catch:
 *    if (!product) {
 *      const err = new Error("Product not found");
 *      err.status = 404;
 *      return next(err); // ← Proslijedi grešku error handleru
 *    }
 * 
 * 2. Ili bacaj grešku normalno, error handler će je uhvatiti:
 *    throw new Error("Something went wrong");
 * 
 * Format odgovora:
 * ---------------
 * {
 *   status: "error",
 *   message: "Opis greške"
 * }
 */
export const errorHandler = (err, req, res, next) => {
  // Loguj grešku u konzoli (za debugging)
  console.error('Error:', err);

  // ═══════════════════════════════════════════════════════════════════
  // MONGOOSE VALIDATION ERROR
  // ═══════════════════════════════════════════════════════════════════
  // Kada validacija šeme ne prođe (npr. required polje je prazno)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: messages,
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // MONGOOSE DUPLICATE KEY ERROR
  // ═══════════════════════════════════════════════════════════════════
  // Kada pokušavaš da kreiraš dokument sa unique poljem koje već postoji
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      status: 'error',
      message: `${field} već postoji u bazi.`,
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // JWT ERRORS - Token problemi
  // ═══════════════════════════════════════════════════════════════════
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token nevažeći.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token je istekao.',
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // MULTER ERRORS - Upload greške
  // ═══════════════════════════════════════════════════════════════════
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'error',
      message: 'Fajl je prevelik. Maksimalna veličina je 5MB.',
    });
  }
  
  // Ostale multer greške
  if (err.message && err.message.includes('Samo slike su dozvoljene')) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // DEFAULT ERROR - Sve ostale greške
  // ═══════════════════════════════════════════════════════════════════
  // err.status - status kod koji je postavljen u kontroleru (npr. 404, 400)
  // Ako nije postavljen, koristi 500 (Internal Server Error)
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * 404 NOT FOUND HANDLER
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Ovo se poziva kada nijedna ruta ne odgovara zahtevu.
 * Mora biti POSLEDNJI middleware (posle svih ruta).
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta nije pronađena.',
    path: req.originalUrl,
  });
};
