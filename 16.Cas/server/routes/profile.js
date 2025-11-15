import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /profile - Zaštićeno
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // req.user je setovan u middleware-u
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronađen' });
    }

    res.json({
      message: 'Ovo su tvoji podaci',
      user,
    });

  } catch (error) {
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

export default router;
