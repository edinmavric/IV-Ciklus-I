# 31. Čas - Next.js API Routes & Backend Integracija

---

## Sadržaj časa

### Teorija 
- Šta su Route Handlers (route.js/route.ts)
- HTTP metode (GET, POST, PUT, PATCH, DELETE)
- Edge vs Node.js Runtime
- Zašto Next.js može biti full-stack framework

### Praksa
- Kreiranje API ruta za postove
- Dinamičke rute sa [id]
- CRUD operacije
- Povezivanje sa MongoDB (Mongoose) - demonstracija

### Zadatak
- Implementacija /api/users rute
- GET sa filterom + POST sa validacijom

---

## Pokretanje projekta

```bash
cd my-app
npm install
npm run dev
```

Aplikacija će biti dostupna na: http://localhost:3000

---

## Struktura fajlova

```
my-app/
├── app/
│   ├── api/
│   │   ├── posts/
│   │   │   ├── route.js          # GET all, POST, DELETE all
│   │   │   └── [id]/
│   │   │       └── route.js      # GET one, PUT, PATCH, DELETE one
│   │   └── users/
│   │       ├── route.js          # Rješenje zadatka
│   │       └── zadatak-template.js  # Template za studente
│   ├── demo/
│   │   └── page.js               # Demo stranica za testiranje
│   └── page.js
├── lib/
│   ├── db.js                     # MongoDB konekcija
│   └── models/
│       ├── Post.js               # Post model
│       └── User.js               # User model
└── package.json
```

---

## Testiranje API-ja

### Korištenjem Demo stranice
Otvorite http://localhost:3000/demo i klikajte na dugmad.

### Korištenjem curl-a

```bash
# GET sve postove
curl http://localhost:3000/api/posts

# GET postove filtirane po autoru
curl "http://localhost:3000/api/posts?author=Edin"

# GET jedan post
curl http://localhost:3000/api/posts/1

# POST novi post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Novi post","content":"Sadržaj","author":"Student"}'

# PATCH ažuriraj post
curl -X PATCH http://localhost:3000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Ažurirani naslov"}'

# DELETE obriši post
curl -X DELETE http://localhost:3000/api/posts/1
```

---

## API Endpoints

### Posts API

| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | /api/posts | Dohvati sve postove |
| GET | /api/posts?author=Ime | Filtriraj po autoru |
| POST | /api/posts | Kreiraj novi post |
| DELETE | /api/posts | Obriši sve postove |
| GET | /api/posts/:id | Dohvati jedan post |
| PUT | /api/posts/:id | Zamijeni cijeli post |
| PATCH | /api/posts/:id | Djelomično ažuriraj |
| DELETE | /api/posts/:id | Obriši post |

### Users API (Zadatak)

| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | /api/users | Dohvati sve usere |
| GET | /api/users?role=admin | Filtriraj po roli |
| POST | /api/users | Kreiraj novog usera |

---

## Zadatak za studente

Otvorite fajl `app/api/users/zadatak-template.js` i implementirajte:

1. **GET metodu** koja:
   - Vraća sve usere
   - Podržava filter po `role` query parametru
   - Vraća response u formatu: `{ success, count, data }`

2. **POST metodu** koja:
   - Čita body iz requesta
   - Validira da `name` i `email` postoje
   - Provjerava da email nije već zauzet
   - Kreira novog usera
   - Vraća status 201 sa kreiranim userom

**Rješenje** se nalazi u `app/api/users/route.js`

---

## Korisni linkovi

- [Next.js Route Handlers Docs](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [MDN HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
