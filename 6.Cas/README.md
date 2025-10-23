# DOMAĆI ZADATAK — Express.js REST API

## Opis zadatka

Ovaj domaći zadatak ima za cilj da studentima pruži priliku da **samostalno naprave RESTful API** koristeći Express.js i middleware funkcije.

Treba kreirati **tri različita seta podataka (tri niza objekata)** i za svaki odraditi **sve REST metode**:

- `GET` — vraća sve podatke
- `GET /:id` — vraća podatak po ID-ju
- `POST` — dodaje novi objekat
- `PUT` — menja ceo objekat
- `PATCH` — menja deo objekta
- `DELETE` — briše objekat

Svaki set treba imati svoj fajl u folderu `routes/` i koristiti poseban middleware u folderu `middleware/`.

---

## 1. Zadatak — Students API

Kreirati API za upravljanje studentima.

**Polja objekta:**  
`id`, `name`, `age`, `city`, `email`

**Middleware:**  
- Proverava da su sva polja popunjena za `POST` i `PUT`
- Proverava da `age` > 12
- Proverava da `city` ima bar 5 karaktera
- Proverava da `email` sadrži `@`

**Primer objekta:**
```js
{ id: 1, name: "Marko Markovic", age: 22, city: "Beograd", email: "marko@example.com" }
```

---

## 2. Zadatak — Books API

Kreirati API za upravljanje knjigama.

**Polja objekta:**  
`id`, `title`, `author`, `year`, `pages`

**Middleware:**  
- Proverava da su sva polja popunjena (`POST` i `PUT`)
- Proverava da naslov ima bar 2 karaktera
- Proverava da broj strana (`pages`) bude veći od 10

**Primer objekta:**
```js
{ id: 1, title: "Na Drini ćuprija", author: "Ivo Andrić", year: 1945, pages: 320 }
```

---

## 3. Zadatak — Courses API

Kreirati API za upravljanje kursevima.

**Polja objekta:**  
`id`, `name`, `category`, `duration`, `level`

**Middleware:**  
- Proverava da su sva polja popunjena (`POST`, `PUT`)
- Proverava da `duration` bude najmanje 4 nedelje
- Proverava da `level` bude jedan od sledećih: `"beginner"`, `"intermediate"`, `"advanced"`
- Dodatni middleware koji loguje svaki zahtev u konzolu:  
  Format: `[vreme] METODA ruta`

**Primer objekta:**
```js
{ id: 1, name: "JavaScript Basics", category: "Programming", duration: 6, level: "beginner" }
```

---

## Struktura projekta

```
project/
│
├── routes/
│   ├── students.js
│   ├── books.js
│   └── courses.js
│
├── middleware/
│   ├── validateStudent.js
│   ├── validateBook.js
│   ├── validateCourse.js
│   └── logger.js
│
├── data/
│   ├── students.js
│   ├── books.js
│   └── courses.js
│
├── server.js
└── package.json
```

---

## Uputstvo za pokretanje

1. Inicijalizuj Node projekat:
```bash
npm init -y
```

2. Instaliraj Express:
```bash
npm install express
```

3. Pokreni server:
```bash
node server.js
```

4. Testiraj rute pomoću Postman-a ili `curl` komandi.

---

## Napomena

Za svaku rutu napiši odgovarajući **middleware** koji proverava validnost podataka, a zatim testiraj svaku od REST metoda.

Svrha zadatka je da studenti samostalno razumeju:
- kako REST funkcioniše u praksi,
- kako se koriste `Router` i `middleware`,
- kako izgleda struktura pravog Express projekta.