## Kako pokrenuti projekat (kratko)
1. Napravite folder projekta, npr. `crud-zadatak`.
2. U terminalu pokrenite:
```bash
npm init -y
npm install express mongoose dotenv
```
3. Napravite fajlove i foldere prema instrukcijama u nastavku.
4. U `.env` fajlu dodajte `MONGO_URI` (vaš Atlas ili lokalni connection string).
5. Pokrenite server:
```bash
node server.js
```

---

## Struktura projekta
```
crud-zadatak/
├── models/
│   └── Recept.js
├── controllers/
│   └── recepti.js
├── routes/
│   └── recepti.js
├── .env
└── package.json
```

---

## .env fajl
U `.env` ubacite:
```
MONGO_URI=your_mongo_connection_string_here
```

---

## Primer modela: `models/Recept.js`

```js
const mongoose = require('mongoose');

const receptSchema = new mongoose.Schema({
  naziv: { type: String, required: true },
  uputstvo: { type: String, required: true },
  vremePripreme: { type: Number }, // u minutima
  kategorija: { type: String, default: 'Ostalo' },
  sastojci: [String]
});

module.exports = mongoose.model('Recept', receptSchema);
```

---

## CRUD kontroler za recepte: `controllers/recepti.js`

ODRADITI ZA SVE RUTE!!!

---

## Rute za recepte: `routes/recepti.js`

```js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recepti');

router.post('/', ctrl.createRecept);
router.get('/', ctrl.getAllRecepti);
router.get('/:id', ctrl.getRecept);
router.put('/:id', ctrl.replaceRecept);
router.patch('/:id', ctrl.updateRecept);
router.delete('/:id', ctrl.deleteRecept);

module.exports = router;
```

---

## Realan primer students API sa filterima i paginacijom

### Kontroler: `students/controllers/studentController.js`

```js
const Student = require('../models/Student');

exports.getAllStudents = async (req, res) => {
  const filters = {};
  
  // ... neki filteri idu ove ...

  // Sort, paginacija
  const sortField = req.query.sortBy || 'age';
  const sortOrder = req.query.order === 'desc' ? -1 : 1;
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    const total = await Student.countDocuments(filters);
    const students = await Student.find(filters)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      page,
      totalPages,
      total,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
      students
    });
  } catch (err) {
    res.status(500).json({ message: 'Greška pri dohvatanju studenata', error: err.message });
  }
};
```

---


## Primer odgovora (paginacija) — format koji frontend očekuje

```json
{
  "page": 2,
  "totalPages": 5,
  "total": 23,
  "hasNextPage": true,
  "hasPrevPage": true,
  "nextPage": 3,
  "prevPage": 1,
  "students": [
    { "name": "Jovan", "city": "Beograd", "age": 21 },
    ...
  ]
}
```

---

## Primeri zahteva (Postman / Thunder Client)

- `GET /students?city=Beograd`
- `GET /students?excludeCity=Beograd`
- `GET /students?olderThan=18`
- `GET /students?youngerThan=25`
- `GET /students?minAge=18&maxAge=25`
- `GET /students?cities=Beograd,Novi%20Sad`
- `GET /students?excludeCities=Niš,Kragujevac`
- `GET /students?nameContains=an`
- `GET /students?city=Novi%20Pazar&minAge=18`
- `GET /students?limit=5&page=2&sortBy=age&order=desc`

---

## Compass / Atlas – praktični saveti za filtere

U Compass/Atlas filter polju pišite JSON sa poljem na vrhu:

**Ispravno:**
```json
{ "name": { "$regex": "an", "$options": "i" } }
{ "city": { "$in": ["Beograd", "Novi Sad"] } }
{ "age": { "$gte": 18, "$lte": 25 } }
```

**Pogrešno:**
```json
{ "$regex": "an" }  // ovo neće raditi (unknown top level operator)
```

---

## Domaći zadaci (konkretno) - Ko je odradio prosli domaci ne radi zadatke od 1 do 4

1. Napravite projekat kao gore i implementirajte `Recept` model i rute.
2. Dodajte 10+ recepata ručno koristeći Postman (POST /recepti).
3. Povežite se sa Compass‑om ili Atlas UI i proverite dokumente.
4. U Compass‑u probajte filtere:
   - Promenite polje direktno u dokumentu (edit) i proverite GET /recepti u API‑ju.
   - Obrišite jedan dokument i proverite da li se menja rezultat API‑ja.
   - Testirati query-e direktno u Atlasu ili Compassu
5. U students proejktu ubacite 15+ studenata (različiti gradovi i uzrasti).
6. Testirajte query‑e (cities, excludeCities, minAge, nameContains, pagination).
7. Napišite kratko objašnjenje (u *.md ili *.txt ili bilo koji file po zelji) kako funkcioniše paginacija iz datog primera i kako frontend može da poziva API za sledeću stranicu (u tom istom file-u napisati sta nije jasno takodje kod paginacije).