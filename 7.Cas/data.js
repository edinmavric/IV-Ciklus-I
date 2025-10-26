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

// 1 Korisnik moze imati vise knjiga
// 1 -> 1

// -> // 1 -> N || N -> 1

// N -> M
