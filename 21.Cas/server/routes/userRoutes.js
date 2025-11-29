import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// GET /users - Uzmi sve korisnike (samo admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    // Vrati sve korisnike bez password i refreshToken polja
    const users = await User.find().select('-password -refreshToken');

    res.json({
      count: users.length,
      users: users
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:id - Uzmi jednog korisnika po ID-u
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

// PUT /users/:id - Azuriraj korisnika
// User može azurirati samo sebe, admin može sve
router.put('/:id', auth, async (req, res) => {
  try {
    // Proveri dozvole
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Nemaš dozvolu da menjaš tuđe podatke.' });
    }

    // Ne dozvoljavamo menjanje password-a i refreshToken-a ovim endpoint-om
    const { password, refreshToken, role, ...updateData } = req.body;

    // Ako postoji pokušaj menjanja role-a, samo admin može
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Samo admin može menjati role.' });
    }

    // Ako je admin i šalje role, dozvoli mu
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }

    // Azuriraj korisnika
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronađen.' });
    }

    res.json({
      message: 'Korisnik uspešno azuriran.',
      user: user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /users/:id - Obriši korisnika (samo admin)
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

export default router;
