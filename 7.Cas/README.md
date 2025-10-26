# Zadatak: Rad sa Express.js, Korisnicima i Knjigama

Ovo je zadatak koji se nastavlja na ono što ste radili danas.  
Već imate `users.js` rute, a sada treba da proširite funkcionalnost i dodate **CRUD operacije** i za `books.js` fajl.

---

## Analiza postojećeg koda

U projektu već imate sledeće fajlove:

### `data.js`
```js
const users = [
  { id: 1, name: 'Mustafa', borrowedBooks: [1, 3] },
  { id: 2, name: 'Alija', borrowedBooks: [] },
];

const books = [
  { id: 1, title: 'Moby Dick' },
  { id: 2, title: 'Starac i more' },
  { id: 3, title: 'Hari Poter' },
];

module.exports = { users, books };
```

---

### `routes/users.js`
```js
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
    return res.status(400).send('Korisnik već ima tu knjigu!');

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
    return res.status(400).send('Korisnik nije pozajmio tu knjigu!');

  user.borrowedBooks = user.borrowedBooks.filter(id => id !== bookId);
  res.status(200).send(`Izbrisali ste knjigu ${bookId} kod ${user.name}`);
});

module.exports = router;
```

---

## 2. Zadatak

### ➤ 1. Odredi relacije između entiteta
Odgovorite kratko u komentarima koda (ili u posebnom fajlu):
- Korisnik može imati više knjiga — koju relaciju to predstavlja?
- Knjiga može biti pozajmljena od više korisnika — koju relaciju to predstavlja?
- Nacrtajte **relacije između users i books** pomoću:
  ```
// 1 -> 1
// 1 -> N
// N -> 1
// N -> M
  ```

---

### ➤ 2. Napravi rute u `routes/books.js` fajlu

Napravite novi fajl `routes/books.js` i implementirajte sledeće rute:

#### GET /books
Vrati sve knjige.

#### GET /books/:id
Vrati samo jednu knjigu po ID-ju.

#### POST /books
Dodaj novu knjigu.  
Primer body-ja:
```json
{ "title": "Novi naslov" }
```

#### PUT /books/:id
Izmeni naslov knjige po ID-ju.

#### DELETE /books/:id
Obriši knjigu iz liste.

---

### ➤ 3. Napravi još 1-2 dodatne rute (po izboru)

Predlozi (izaberi barem jednu):
- `GET /books/borrowed` → vrati sve knjige koje su trenutno pozajmljene  
- `GET /books/:id/users` → vrati sve korisnike koji su pozajmili određenu knjigu

---

### ➤ 4. Testiranje pomoću curl komandi

#### Primeri
```bash
# Vrati sve knjige
curl http://localhost:3000/books

# Dodaj knjigu
curl -X POST -H "Content-Type: application/json" -d '{"title": "Romeo i Julija"}' http://localhost:3000/books

# Izmeni knjigu
curl -X PUT -H "Content-Type: application/json" -d '{"title": "Romeo i Julija (Novo Izdanje)"}' http://localhost:3000/books/1

# Obriši knjigu
curl -X DELETE http://localhost:3000/books/3
```

---

## Cilj vežbe
- Razumevanje relacija između entiteta (1:N, N:M)
- Rad sa Express.js rutama
- Uvežbavanje CRUD operacija
- Povezivanje različitih fajlova kroz `require` i `module.exports`

---

**Napomena za kraj:**  
Kada završite `books.js` rute, u `app.js` dodajte:

```js
const express = require('express');
const app = express();

app.use(express.json());

const usersRoutes = require('./routes/users');
const booksRoutes = require('./routes/books');

app.use('/users', usersRoutes);
app.use('/books', booksRoutes);

app.listen(3000, () => console.log('Server radi na portu 3000'));
```