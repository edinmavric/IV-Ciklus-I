const express = require('express');
const router = express.Router();
const Grade = require('../models/Grade');

router.post('/', async (req, res) => {
  try {
    // Moze neka provera da li studentId postoji kao _id nekog studenta!
    const newGrade = new Grade(req.body);
    const saved = await newGrade.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.minValue) filter.value = { $gte: +req.query.minValue };
    // .populate() u prvom argumentu prima referencu na drugi model
    // drugi argument su atributi koje uzimamo da prikazemo iz tog modela
    const grades = await Grade.find(filter).populate('studentId', 'name city');
    // primer Jedne ocene nakon .populate('studentId', 'name city'):
    //  { _id: ocene, subject, value, studentId: { _id: studenta, name, city}}
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
