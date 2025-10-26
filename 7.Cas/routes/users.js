const express = require('express');
const router = express.Router();
const { users, books } = require('../data');

// GET /users
router.get('/', (req, res) => {
  res.json(users);
});

// GET /users/:id/borrowed
router.get('/:id/borrowed', (req, res) => {
  const userId = +req.params.id;
  const user = users.find(u => u.id === userId);

  if (!user) return res.status(404).send('Nije pronadjen');

  const borrowedBooks = books.filter(b => user.borrowedBooks.includes(b.id));
  res.json(borrowedBooks);
});

// POST /users/:id/borrowed/:bookId
router.post('/:id/borrowed/:bookId', (req, res) => {
  const userId = +req.params.id;
  const bookId = +req.params.bookId;

  const user = users.find(u => u.id === userId);
  const book = books.find(b => b.id === bookId);

  if (!user) return res.status(404).send('Korisnik ne postoji!');
  if (!book) return res.status(404).send('Knjiga ne postoji!');

  if (user.borrowedBooks.includes(bookId))
    res.status(400).send('Korisnik vec ima tu knjigu!');

  user.borrowedBooks.push(bookId);
  res.status(200).send(`${user.name} je uzeo knjigu ${book.title}`);
});

// DELETE /users/:id/return/:bookId
router.delete('/:id/return/:bookId', (req, res) => {
  const userId = +req.params.id;
  const bookId = +req.params.bookId;

  const user = users.find(u => u.id === userId);

  if (!user) return res.status(404).send('Korisnik ne postoji!');

  if (!user.borrowedBooks.includes(bookId))
    res.status(400).send('Korisnik nije pozajmio tu knjigu!');

  user.borrowedBooks = user.borrowedBooks.filter(id => id !== bookId);
  res.status(200).send(`Izbrisali ste knjigu ${bookId} kod ${user.name}`);
});

module.exports = router;
