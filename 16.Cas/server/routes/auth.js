import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    res.status(201).json({
      message: 'Korisnik uspešno registrovan',
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. da li korisnik postoji?
  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: 'Korisnik ne postoji' });

  // 2. proveri lozinku
  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return res.status(401).json({ message: 'Pogrešili ste lozinku' });

  // 3. generiši token
  const token = generateToken(user);

  res.json({
    message: 'Ulogovani ste!',
    token,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
    },
  });
});

export default router;
