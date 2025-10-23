const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Lista korisnika');
});

router.get('/:id', (req, res) => {
  res.send(`Korisnik sa ID: ${req.params.id}`);
});

module.exports = router;
