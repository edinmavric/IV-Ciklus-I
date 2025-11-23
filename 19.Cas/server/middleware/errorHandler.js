// Global Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      error: `${field} već postoji u bazi.`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token nevažeći.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token je istekao.' });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Serverska greška.',
  });
};

// 404 Not Found Handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Ruta nije pronađena.',
    path: req.originalUrl,
  });
};
