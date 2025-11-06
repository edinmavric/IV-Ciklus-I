const express = require('express');
const router = express.Router();
const Grade = require('../models/Grade');

// GET sve ocene studenta
router.get('/:id/grades', async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.id });
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
