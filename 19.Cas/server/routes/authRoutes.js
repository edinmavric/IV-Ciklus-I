import express from 'express';
import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generateTokens.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    res.status(201).json({ message: 'Registrovan', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email i lozinka su obavezni.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Ne postoji user' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Pogrešna lozinka' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // sačuvaj refresh u DB
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Ulogovan',
      accessToken,
      refreshToken, // necemo ovo slati u real aplikaciji, samo za demo
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REFRESH TOKEN
router.post('/refresh', async (req, res) => {
  try {
    // radi se preko httpCookies u real aplikaciji
    const { token } = req.body;

    if (!token) return res.status(401).json({ message: 'Nema refresh tokena' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: 'Refresh token nevažeći' });
    }

    const user = await User.findById(payload.id);

    if (!user || user.refreshToken !== token)
      return res.status(403).json({ message: 'Refresh token ne postoji' });

    const newAccess = generateAccessToken(user);
    const newRefresh = generateRefreshToken(user);

    user.refreshToken = newRefresh;
    await user.save();

    res.json({
      accessToken: newAccess,
      refreshToken: newRefresh,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGOUT
router.post('/logout', async (req, res) => {
  try {
    const user = await User.findOne(req.body.email);
    if (!user) return res.json({ message: 'Već izlogovan.' });

    user.refreshToken = null;
    await user.save();

    res.json({ message: 'Uspešno izlogovani.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
