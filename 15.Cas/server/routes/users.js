const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return res.status(401).json({ message: 'Pogresili ste lozinku' });

  res.json({ message: 'Ulogovani ste!' });
});

module.exports = router;
