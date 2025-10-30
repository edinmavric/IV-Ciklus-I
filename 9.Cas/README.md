# Domaći zadatak — Express + MongoDB CRUD

## Zadatak

Na osnovu primera koji smo danas radili (model, kontroler, rute i povezivanje u `server.js`), dodaj **još 2-3 nove šeme** i napravi kompletan CRUD za svaku.

### 1. Šeme (models)
Kreiraj nove šeme u folderu `models/`, npr.:
- `Course.js` (npr. `title`, `description`, `duration`)
- `Teacher.js` (npr. `name`, `subject`, `experience`)
- *(opciono)* `Classroom.js` (npr. `name`, `capacity`, `building`)

Svaka šema treba da ima barem:
- jedan **obavezan** (`required`) atribut,
- jedan sa **podrazumevanom vrednošću** (`default`),
- i da koristi validaciju (`min`, `max`, `minLength`, `maxLength` po potrebi).

### 2. Kontroleri (controllers)
Za svaku šemu napravi fajl u `controllers/` sa sledećim funkcijama:
- `createItem` – dodaje novi dokument (`.save()`)
- `getAllItems` – prikazuje sve dokumente (`.find()`)
- `getItemById` – prikazuje dokument po ID-u (`.findById()`)
- `updateItem` – menja dokument po ID-u (`.findByIdAndUpdate()`)
- `deleteItem` – briše dokument po ID-u (`.findByIdAndDelete()`)

Ispod svake funkcije dodaj komentar koji objašnjava šta metoda radi — kao u današnjem primeru.

### 3. Rute (routes)
U folderu `routes/` napravi fajlove `courses.js`, `teachers.js`, i (ako želiš) `classrooms.js`.

Svaka ruta treba da koristi odgovarajući kontroler:
```js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courses');

router.post('/', courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
```

### 4. Glavni fajl (`server.js`)
U `server.js` importuj sve rute i dodaj ih u Express app, npr.:
```js
const courseRoutes = require('./routes/courses');
const teacherRoutes = require('./routes/teachers');

app.use('/courses', courseRoutes);
app.use('/teachers', teacherRoutes);
```

---

## Savet
Pazi na imena i putanje prilikom importovanja (`../models/`, `../controllers/` itd.).  
Svi fajlovi treba da budu jasno odvojeni po folderima.

---

## Cilj
Da u potpunosti samostalno napraviš mini REST API sa više entiteta (students, courses, teachers...) i da razumeš kako svaka komponenta sarađuje sa ostalima.