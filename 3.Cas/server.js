const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

app.get('/', (req, res) => {
  res.send('Express Pocetak!');
});

app.get('/about', (req, res) => {
  res.send('<h1>O nama</h1>');
});

app.get('/data', (req, res) => {
  res.json({
    name: 'Mustafa',
    age: 14,
  });
});

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.send(`Korisnik ima ID: ${userId}`);
});

// ruta /user/:name, da prikazuje Zdravo, {{ name }}!

app.get('/user/:name', (req, res) => {
  const userName = req.params.name;
  res.send(`Zdravo, ${userName}!`);
});

app.get('/search', (req, res) => {
  const { query, term } = req.query;
  res.send(
    `Tranzeni pojam je: ${query}, a term je: ${term !== undefined ? term : ''}`
  );
});

// /search?term=...

// Sledeca linija da bi aplikacija mogla da cita .json podatke
app.use(express.json())

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  res.send(`Korisnik: ${username} ima sifru ${password}`);
});

// body: JSON.stringify({ name, age })
// body: JSON.stringify({ grade, school })
// body: JSON.stringify({ home, address })

app.listen(3000);
