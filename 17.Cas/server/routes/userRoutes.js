import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Samo admin može brisati user-e
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronađen.' });
    }
    res.json({ message: 'Korisnik obrisan.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Svaki user može videti samo sebe ili sve ako je admin
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Nemaš pristup tuđem profilu.' });
    }

    const user = await User.findById(req.params.id).select(
      '-password -refreshToken'
    );

    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronađen.' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
