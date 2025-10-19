const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;

// omogućava Expressu da čita podatke iz body-ja (POST)
// app.use(express.urlencoded({ extended: true }));

// GLOBALNI MIDDLEWARE PRIMER:
app.use(express.json());

// GLOBALNI MIDDLEWARE PRIMER:
// app.use((req, res, next) => {
//   console.log('Middleware funkcija je pozvana');
//   next();
// });

app.use((req, res, next) => {
  const student = req.header('X-Student');
  if (!student) {
    return res.status(400).send('Morate poslati X-Student');
  } else {
    console.log(`Student: ${student}`);
  }
});

// Napraviti middleware koji loguje metodu (req.method) i URL (req.url) svake pristigle zahteve

app.use((req, res, next) => {
  console.log(`Metoda: ${req.method}, URL: ${req.url}`);
  next();
});

// statički fajlovi (ako imate HTML formu)
// app.use(express.static('public'));

// osnovna GET ruta
app.get('/', (req, res) => {
  res.send('Dobrodošli na Express server!');
});

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.get('/data', (req, res) => {
  res.send(`
    <h1>Ovo je GET ruta!</h1>
    <p>Ovom rutom samo prikazujemo podatke, ne unosimo ih.</p>
  `);
});

app.post('/data', (req, res) => {
  const { name, age } = req.body;
  res.json({ message: `Primljeni podaci - Ime: ${name}, Godine: ${age}` });
});

const checkAuth = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  if (apiKey == 'tajna123') {
    console.log('Uspesno ste ulogovani!');
    next();
  } else {
    console.log('Nemate pristup!');
    res.status(401).send('Niste autorizovani');
  }
};

// PRIVATNI MIDDLEWARE PRIMER:
app.get('/protected', checkAuth, (req, res) => {
  res.send('imate pristup!');
});

const checkRole = (req, res, next) => {
  const { role } = req.query;
  if (role === 'admin') {
    next();
  } else {
    res.status(403).send('Nemate pristup!');
  }
};

app.get('/admin', checkRole, (req, res) => {
  res.send('Admin Stranica!');
});

app.get('/profile', (req, res) => {
  res.send('Vas licni profil!');
});

// pokretanje servera
app.listen(PORT, () => {
  console.log(`Server radi na http://localhost:${PORT}`);
});

// Napraviti middleware koji proverava da li korisnik salje header X-Student
// sa svojim imenom, Ako postoji ispisati to njegovo ime, a ako ne
// error 400 sa opisom da je X-Student header obavezan. Globalna ruta.

// Napraviti middleware za dve rute, /admin i /profile.
// /admin ruti moze pristupiti samo korisnik koji ima (role === 'admin').
// /profile ruti svi imaju pristup.
// Ovako se salju req: /admin?role=admin, /admin?role=user
