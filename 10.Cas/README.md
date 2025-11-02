# Domaći zadatak – Osnovne CRUD operacije u MongoDB + Express

## Cilj:

Napraviti Express server povezan sa MongoDB bazom (Atlas ili lokalni Compass), koji podržava osnovne CRUD operacije nad zadatim modelom.

---

## Zadatak:

Napravi novi folder projekta, npr. `crud-zadatak`.

Instaliraj potrebne pakete:

```bash
npm init -y
npm install express mongoose dotenv
```

Struktura projekta treba da izgleda ovako:

crud-zadatak/
├── models/
│ └── Recept.js
├── controllers/
│ └── recepti.js
├── routes/
│ └── recepti.js
├── server.js
└── .env

U .env fajlu treba da stoji vaš MONGO_URI string za konekciju.

1. Napravi Model (Recept.js)

Vaš prvi zadatak je da sami definišete Mongoose šemu za model Recept. Razmislite koja su polja (podaci) potrebna za opis jednog recepta.

U fajlu models/Recept.js definišite šemu.

```js
const mongoose = require('mongoose');

const receptSchema = new mongoose.Schema({
  // TODO: Definišite polja (fields) za recept
  //
  // Potrebno je dodati najmanje 4 polja po izboru.
  // Primeri polja (ne morate koristiti ova):
  //
  // naziv: { type: String, required: true },
  // uputstvo: { type: String, required: true },
  // vremePripreme: { type: Number }, // (u minutima)
  // kategorija: { type: String, default: 'Ostalo' },
  // sastojci: [String] // Primer korišćenja niza!
});

module.exports = mongoose.model('Recept', receptSchema);
```

Napravi kontroler sa CRUD funkcijama

U fajlu controllers/recepti.js napišite funkcije koje će obrađivati zahteve

POST, GET, GET (id), PUT, PATCH, DELETE

3. Napravi route datoteku

U fajlu routes/recepti.js povežite HTTP metode i rute sa funkcijama iz kontrolera.

4. Server setup

Na kraju, u server.js povežite sve delove.

```js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const receptRoutes = require('./routes/recepti'); // Ispravljena putanja

const app = express();

// Middleware za parsiranje JSON-a
app.use(express.json());

// Osnovna ruta za recepte
// Svi zahtevi koji počinju sa /recepti biće prosleđeni receptRoutes
app.use('/recepti', receptRoutes);

// Konekcija na bazu
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Povezan sa bazom'))
  .catch(err => console.log('Nije povezan sa bazom', err));

// Pokretanje servera
app.listen(3000, () => console.log('Server radi na portu 3000'));
```

Testiranje

U VSCode Thunder Client-u ili Postman aplikaciji, testirajte sledeće rute. Obavezno postavite Content-Type header na application/json za POST, PUT i PATCH zahteve i pošaljite validan JSON u body.

POST	/recepti	Dodaj novi recept	{ "naziv": "Palačinke", "vremePripreme": 30, ... }

GET	/recepti	Vrati sve recepte	(Nema body)

GET	/recepti/:id	Vrati jedan recept (zamenite :id sa pravim ID-jem)	(Nema body)

PUT	/recepti/:id	Zameni ceo dokument recepta	{ "naziv": "Američke palačinke", ... }

PATCH	/recepti/:id	Ažuriraj delimično recept	{ "vremePripreme": 25 }

DELETE	/recepti/:id	Obriši recept	(Nema body)

1. Dodati 10+ različitih recepata ručno preko Postman-a (koristeći POST rutu).

2. Otvoriti MongoDB Compass (ili Atlas UI), povezati se na bazu i proveriti da li vidite dokumente u kolekciji recepts.

3. Pokušajte da izmenite jedan dokument (npr. promenite vreme pripreme) direktno u Compass-u.

4. Pokušajte da obrišete jedan dokument direktno iz Compass-a.

5. Proverite da li vaša API aplikacija (GET ruta) i dalje radi ispravno i prikazuje promene koje ste napravili u Compass-u.