# OpenAPI i Swagger Dokumentacija - Teorija

## Sadrzaj
1. [Sta je API dokumentacija?](#1-sta-je-api-dokumentacija)
2. [Swagger i OpenAPI - razlike](#2-swagger-i-openapi---razlike)
3. [OpenAPI struktura](#3-openapi-struktura)
4. [Postavljanje u Express projektu](#4-postavljanje-u-express-projektu)
5. [Pisanje dokumentacije (JSDoc komentari)](#5-pisanje-dokumentacije-jsdoc-komentari)
6. [Komponente i seme](#6-komponente-i-seme)
7. [HTTP metode i dokumentacija](#7-http-metode-i-dokumentacija)
8. [Autorizacija u dokumentaciji](#8-autorizacija-u-dokumentaciji)
9. [Dobra praksa](#9-dobra-praksa)
10. [Struktura projekta](#10-struktura-projekta)
11. [Pokretanje i testiranje](#11-pokretanje-i-testiranje)
12. [Vizuelno mapiranje - Kod vs Swagger UI](#12-vizuelno-mapiranje---kod-vs-swagger-ui)
13. [Integracija sa MongoDB/Mongoose](#13-integracija-sa-mongodbmongoose)

---

## 1. Sta je API dokumentacija?

API dokumentacija je **ugovor** izmedju backend-a i frontend-a. Ona predstavlja formalni opis kako API funkcionise i kako ga koristiti.

### Dokumentacija opisuje:
- Koje **endpoint-e** API ima
- Koje **HTTP metode** koristi (GET, POST, PUT, DELETE)
- Kako izgleda **request** (query parametri, body, headers)
- Kako izgleda **response** (struktura podataka)
- **Kodove gresaka** (400, 401, 404, 500...)
- **Primere** uspesnih i neuspesnih poziva

### Bez dokumentacije:
- Frontend tim ne moze da radi
- QA tim ne moze da testira
- Novi developer ne zna sta API radi
- Integracija sa drugim sistemima je nemoguca

### Sa dokumentacijom:
- Svako odmah zna sta je dostupno
- Jasno je kako se koristi
- Zna se sta moze da se ocekuje zauzvrat
- Olaksava onboarding novih clanova tima

**Zakljucak:** Dokumentacija je **obavezna** u profesionalnom radu.

---

## 2. Swagger i OpenAPI - razlike

### Bitno: Swagger NIJE isto sto i OpenAPI

| Termin | Objasnjenje |
|--------|-------------|
| **OpenAPI** | Standard/specifikacija za opisivanje API-ja. Trenutna verzija: 3.0.x / 3.1 |
| **Swagger** | Set alata koji radi sa OpenAPI specifikacijom |

### Swagger alati:

1. **Swagger UI** - Prikazuje API dokumentaciju u browseru (interaktivni interfejs)
2. **Swagger Editor** - Online editor za pisanje OpenAPI specifikacija
3. **Swagger Codegen** - Generise klijente/servere iz dokumentacije

U Express projektima najcesce koristimo **Swagger UI** da prikazemo dokumentaciju.

---

## 3. OpenAPI struktura

OpenAPI dokument opisuje ceo API u strukturiranom formatu (YAML ili JSON).

### Osnovni elementi OpenAPI dokumenta:

| Element | Opis |
|---------|------|
| `openapi` | Verzija OpenAPI specifikacije (npr. 3.0.0) |
| `info` | Metapodaci o API-ju (naziv, verzija, opis) |
| `servers` | Lista servera gde je API dostupan |
| `paths` | Definicije svih endpoint-a |
| `components` | Reuzabilne komponente (seme, security, parametri) |
| `tags` | Grupiranje endpoint-a po kategorijama |
| `security` | Globalna security konfiguracija |

### Lokacija u projektu:
**Fajl:** `src/config/swagger.js` - Sadrzi OpenAPI konfiguraciju

---

## 4. Postavljanje u Express projektu

### Potrebni paketi:
- `swagger-ui-express` - Za prikaz dokumentacije u browseru
- `swagger-jsdoc` - Za generisanje OpenAPI specifikacije iz JSDoc komentara

### Konfiguracioni fajl:
**Fajl:** `src/config/swagger.js`

Ovaj fajl sadrzi:
- OpenAPI verziju
- Info sekciju (naslov, verzija, opis)
- Listu servera
- Tagove za grupiranje
- Security seme (npr. Bearer token)
- Putanje do fajlova sa dokumentacijom

### Integracija sa Express-om:
**Fajl:** `src/index.js`

U glavnom fajlu se:
- Importuje swagger konfiguracija
- Postavlja ruta `/api-docs` za Swagger UI
- Opciono: ruta `/api-docs.json` za sirovu OpenAPI specifikaciju

### Pristup dokumentaciji:
- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs.json`

---

## 5. Pisanje dokumentacije (JSDoc komentari)

Dokumentacija se pise pomocu specijalnih komentara u route fajlovima.

### Format:
Komentari pocinju sa `@swagger` i koriste YAML sintaksu unutar JS komentara.

### Elementi za dokumentovanje endpoint-a:

| Element | Opis |
|---------|------|
| `summary` | Kratak opis (prikazuje se u listi) |
| `description` | Detaljniji opis endpoint-a |
| `tags` | Kategorija kojoj pripada |
| `parameters` | Query, path ili header parametri |
| `requestBody` | Opis tela zahteva (za POST, PUT) |
| `responses` | Moguce HTTP response kodove i njihov sadrzaj |
| `security` | Potrebna autorizacija |

### Lokacija u projektu:
**Fajl:** `src/routes/products.routes.js` - Sadrzi sve swagger komentare

---

## 6. Komponente i seme

Komponente omogucavaju **reuzabilnost** - definisete jednom, koristite vise puta.

### Tipovi komponenti:

| Komponenta | Opis |
|------------|------|
| `schemas` | Definicije modela podataka (User, Product...) |
| `securitySchemes` | Nacini autorizacije (Bearer, API Key...) |
| `parameters` | Reuzabilni parametri |
| `responses` | Reuzabilni response-ovi |
| `examples` | Primeri podataka |

### Definicija seme ukljucuje:
- `type` - Tip podatka (object, array, string, number...)
- `required` - Lista obaveznih polja
- `properties` - Definicija svakog polja
- `example` - Primer vrednosti

### Refernciranje seme:
Koristi se `$ref: '#/components/schemas/ImeModela'` za referenciranje.

### Lokacija u projektu:
**Fajl:** `src/routes/products.routes.js` - Na pocetku fajla su definisane seme (Product, ProductInput, ErrorResponse, itd.)

---

## 7. HTTP metode i dokumentacija

### GET - Citanje podataka

Dokumentuje se:
- Query parametri (filteri, paginacija, sortiranje)
- Path parametri (ID resursa)
- Response sa strukturom podataka

**Primer u projektu:** GET `/api/products` i GET `/api/products/:id`

### POST - Kreiranje resursa

Dokumentuje se:
- Request body sa strukturom podataka
- Validaciona pravila
- Response sa kreiranim resursom
- Moguce greske (400 za validaciju)

**Primer u projektu:** POST `/api/products`

### PUT/PATCH - Azuriranje resursa

Dokumentuje se:
- Path parametar (ID)
- Request body (sva ili neka polja)
- Response sa azuriranim podacima
- 404 ako resurs ne postoji

**Primer u projektu:** PUT `/api/products/:id`

### DELETE - Brisanje resursa

Dokumentuje se:
- Path parametar (ID)
- Response (potvrda brisanja)
- 404 ako resurs ne postoji

**Primer u projektu:** DELETE `/api/products/:id`

---

## 8. Autorizacija u dokumentaciji

### Bearer Token (JWT)

Definise se u `components.securitySchemes`:
- Tip: `http`
- Sema: `bearer`
- Format: `JWT`

### Primena na endpoint:
- Globalno: u swagger konfiguraciji
- Po endpoint-u: u `security` sekciji swagger komentara

### Lokacija u projektu:
**Fajl:** `src/config/swagger.js` - Definicija securitySchemes
**Fajl:** `src/routes/products.routes.js` - Primena na POST, PUT, DELETE endpoint-e

---

## 9. Dobra praksa

### Dokumentacija MORA da ima:

1. **Opis svih endpoint-a** - summary i description
2. **Primere request-a** - u requestBody.examples
3. **Primere response-a** - u responses.content.example
4. **Sve moguce kodove gresaka:**
   - 400 - Bad Request (validacija)
   - 401 - Unauthorized (auth)
   - 403 - Forbidden (permisije)
   - 404 - Not Found
   - 500 - Internal Server Error
5. **Validacione poruke** - u error response-ima
6. **Autorizaciju** - security za zasticene rute
7. **Paginaciju** - page, limit parametri
8. **Sort i filter parametre** - query parametri

### Organizacija:
- Koristi tagove za grupiranje
- Imenuj seme jasno i konzistentno
- Dodaj opise za svako polje
- Ukljuci realne primere

---

## 10. Struktura projekta

```
24.Cas/
├── package.json              # Zavisnosti projekta
├── .env                      # Environment varijable (MONGODB_URI, PORT)
├── TEORIJA.md               # Ovaj fajl - teorija
└── src/
    ├── index.js             # Glavni fajl servera, DB konekcija, Swagger UI
    ├── config/
    │   ├── swagger.js       # OpenAPI konfiguracija
    │   └── database.js      # MongoDB/Mongoose konekcija
    ├── models/
    │   └── Product.js       # Mongoose schema i model
    ├── controllers/
    │   └── products.controller.js  # Async CRUD sa Mongoose
    └── routes/
        └── products.routes.js      # Rute + Swagger dokumentacija
```

### Opis fajlova:

| Fajl | Namena |
|------|--------|
| `package.json` | Definise zavisnosti (express, mongoose, swagger-ui-express, swagger-jsdoc, dotenv) |
| `.env` | MongoDB URI i PORT konfiguracija |
| `src/index.js` | Startuje server, konektuje se na bazu, postavlja Swagger UI middleware |
| `src/config/swagger.js` | OpenAPI konfiguracija, info, serveri, tagovi, security |
| `src/config/database.js` | Mongoose konekcija na MongoDB |
| `src/models/Product.js` | Mongoose schema sa validacijom, virtualima i indexima |
| `src/routes/products.routes.js` | Svi endpoint-i sa kompletnom Swagger dokumentacijom |
| `src/controllers/products.controller.js` | Async CRUD operacije sa Mongoose metodama |

---

## 11. Pokretanje i testiranje

### Koraci za pokretanje:

1. Instalacija zavisnosti: `npm install`
2. Pokretanje servera: `npm run dev` ili `npm start`
3. Otvaranje dokumentacije: `http://localhost:3000/api-docs`

### Testiranje kroz Swagger UI:

1. Otvorite Swagger UI u browseru
2. Pronadjite endpoint koji zelite da testirate
3. Kliknite na "Try it out"
4. Unesite potrebne parametre
5. Kliknite "Execute"
6. Pregledajte response

### Dostupni URL-ovi:

| URL | Opis |
|-----|------|
| `http://localhost:3000` | Root ruta sa informacijama |
| `http://localhost:3000/api-docs` | Swagger UI dokumentacija |
| `http://localhost:3000/api-docs.json` | OpenAPI specifikacija u JSON formatu |
| `http://localhost:3000/health` | Health check endpoint |
| `http://localhost:3000/api/products` | Products API |

---

## 12. Vizuelno mapiranje - Kod vs Swagger UI

Ova sekcija objasnjava **sta u kodu generise sta u Swagger UI**.

### HEADER SEKCIJA (vrh stranice)

```
┌─────────────────────────────────────────────────────────────┐
│  Products API Documentation  1.0.0  [OAS 3.0]               │
│                                                             │
│  API Dokumentacija za Products servis                       │
│  Ova dokumentacija opisuje sve dostupne endpoint-e...       │
└─────────────────────────────────────────────────────────────┘
```

| Sta vidis | Odakle dolazi | Fajl |
|-----------|---------------|------|
| "Products API Documentation" | `info.title` | `src/config/swagger.js` |
| "1.0.0" | `info.version` | `src/config/swagger.js` |
| "OAS 3.0" | `openapi: "3.0.0"` | `src/config/swagger.js` |
| Opis ispod naslova | `info.description` | `src/config/swagger.js` |

---

### SERVERS DROPDOWN

```
┌─────────────────────────────────────────────────────────────┐
│  Servers                                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ http://localhost:3000 - Lokalni development server  ▼ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

| Sta vidis | Odakle dolazi | Fajl |
|-----------|---------------|------|
| Lista servera | `servers` array | `src/config/swagger.js` |
| URL servera | `servers[].url` | `src/config/swagger.js` |
| Opis servera | `servers[].description` | `src/config/swagger.js` |

---

### AUTHORIZE DUGME (katanac)

```
┌──────────────────┐
│  Authorize  🔓   │
└──────────────────┘
```

| Sta vidis | Odakle dolazi | Fajl |
|-----------|---------------|------|
| Authorize dugme | `components.securitySchemes` | `src/config/swagger.js` |
| Bearer auth forma | `securitySchemes.bearerAuth` | `src/config/swagger.js` |

---

### TAGOVI (Products, Health)

```
┌─────────────────────────────────────────────────────────────┐
│  Products   Operacije vezane za proizvode              ▼    │
├─────────────────────────────────────────────────────────────┤
│  Health     Health check endpoint-i                    ▼    │
└─────────────────────────────────────────────────────────────┘
```

| Sta vidis | Odakle dolazi | Fajl |
|-----------|---------------|------|
| "Products" | `tags[].name` | `src/config/swagger.js` |
| "Operacije vezane za proizvode" | `tags[].description` | `src/config/swagger.js` |
| Endpoint pripada tagu | `tags: [Products]` u @swagger komentaru | `src/routes/products.routes.js` |

---

### ENDPOINT LISTA

```
┌─────────────────────────────────────────────────────────────┐
│ GET    /api/products      Vrati sve proizvode          🔓 ▼ │
│ POST   /api/products      Kreiraj novi proizvod        🔓 ▼ │
│ GET    /api/products/{id} Vrati jedan proizvod po ID   🔓 ▼ │
│ PUT    /api/products/{id} Azuriraj postojeci proizvod  🔓 ▼ │
│ DELETE /api/products/{id} Obrisi proizvod              🔓 ▼ │
└─────────────────────────────────────────────────────────────┘
```

| Sta vidis | Odakle dolazi | Fajl |
|-----------|---------------|------|
| GET/POST/PUT/DELETE | HTTP metoda u @swagger komentaru (`get:`, `post:`) | `src/routes/products.routes.js` |
| `/api/products` | Putanja u @swagger komentaru | `src/routes/products.routes.js` |
| "Vrati sve proizvode" | `summary` u @swagger komentaru | `src/routes/products.routes.js` |
| Katanac ikonica 🔓 | `security: - bearerAuth: []` | `src/routes/products.routes.js` |
| Boja (zelena/plava/narandzasta/crvena) | HTTP metoda (GET=zelena, POST=plava, PUT=narandzasta, DELETE=crvena) | Automatski |

---

### DETALJI ENDPOINT-A (kada kliknes)

```
┌─────────────────────────────────────────────────────────────┐
│ GET /api/products                                           │
├─────────────────────────────────────────────────────────────┤
│ Vraca listu svih proizvoda sa mogucnoscu filtriranja...    │
├─────────────────────────────────────────────────────────────┤
│ Parameters:                                                 │
│   category (query) - Filtriraj po kategoriji               │
│   minPrice (query) - Minimalna cena                        │
│   page (query) - Broj stranice                             │
├─────────────────────────────────────────────────────────────┤
│ Responses:                                                  │
│   200 - Lista proizvoda uspesno vracena                    │
│   500 - Interna greska servera                             │
└─────────────────────────────────────────────────────────────┘
```

| Sta vidis | Odakle dolazi | Fajl |
|-----------|---------------|------|
| Detaljni opis | `description` u @swagger | `src/routes/products.routes.js` |
| Parameters lista | `parameters` array | `src/routes/products.routes.js` |
| Query/Path oznaka | `in: query` ili `in: path` | `src/routes/products.routes.js` |
| Responses | `responses` objekat | `src/routes/products.routes.js` |
| Status kodovi (200, 400, 404, 500) | Kljucevi u `responses` | `src/routes/products.routes.js` |

---

### SCHEMAS SEKCIJA (dole)

```
┌─────────────────────────────────────────────────────────────┐
│ Schemas                                                 ▼   │
├─────────────────────────────────────────────────────────────┤
│ Product {                                                   │
│   id          string                                        │
│   name*       string    (required)                          │
│   description string                                        │
│   price*      number    (required)                          │
│   category*   string    (required)                          │
│   stock       integer                                       │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

| Sta vidis | Odakle dolazi | Fajl |
|-----------|---------------|------|
| "Product" | `components.schemas.Product` | `src/routes/products.routes.js` |
| Polja (id, name, price...) | `properties` u schema | `src/routes/products.routes.js` |
| Zvezdica (*) = required | `required` array u schema | `src/routes/products.routes.js` |
| Tipovi (string, number) | `type` za svako property | `src/routes/products.routes.js` |

---

### KOMPLETNO MAPIRANJE - DIJAGRAM

```
src/config/swagger.js                    SWAGGER UI
─────────────────────                    ──────────────────────────
info.title           ──────────────────► Naslov dokumentacije
info.version         ──────────────────► Verzija (1.0.0)
info.description     ──────────────────► Opis ispod naslova
servers[]            ──────────────────► Server dropdown
tags[]               ──────────────────► Kategorije (Products, Health)
securitySchemes      ──────────────────► Authorize dugme


src/routes/products.routes.js            SWAGGER UI
─────────────────────────────            ──────────────────────────
@swagger /api/products
  get:               ──────────────────► GET badge (zeleni)
  summary:           ──────────────────► Tekst pored endpoint-a
  description:       ──────────────────► Detaljan opis (kada kliknes)
  tags: [Products]   ──────────────────► Pripada "Products" grupi
  parameters:        ──────────────────► Parameters sekcija
  responses:         ──────────────────► Responses sekcija
  security:          ──────────────────► Katanac ikonica 🔓

components.schemas.Product
  type: object       ──────────────────► Schemas sekcija dole
  properties:        ──────────────────► Lista polja
  required:          ──────────────────► Zvezdica pored polja (*)
```

---

### PRAKTICNI PRIMER - Dodavanje novog endpoint-a

Kada dodas novi endpoint, evo sta se dogadja:

**1. Pises JSDoc komentar:**
```javascript
// U src/routes/products.routes.js

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Vrati istaknute proizvode      <-- Ovo vidis u listi
 *     tags: [Products]                        <-- Pripada Products grupi
 *     responses:
 *       200:
 *         description: Lista istaknutih       <-- Opis response-a
 */
router.get("/featured", getFeaturedProducts);
```

**2. Swagger UI automatski prikazuje:**
- Nov endpoint u "Products" grupi
- Zeleni GET badge
- Tekst "Vrati istaknute proizvode"
- Response 200 kada kliknes

---

## 13. Integracija sa MongoDB/Mongoose

Ovaj projekat koristi **pravu bazu podataka** sa Mongoose ORM-om.

### Struktura sa bazom podataka

```
src/
├── config/
│   ├── swagger.js      # Swagger konfiguracija
│   └── database.js     # MongoDB konekcija
├── models/
│   └── Product.js      # Mongoose schema i model
├── controllers/
│   └── products.controller.js  # Async CRUD sa Mongoose
├── routes/
│   └── products.routes.js      # Rute + Swagger dokumentacija
└── index.js            # Server + DB konekcija
```

### Mongoose Schema vs Swagger Schema

Kljucna razlika: Mongoose schema definise strukturu u bazi, Swagger schema opisuje API response.

| Mongoose Schema | Swagger Schema | Lokacija |
|----------------|----------------|----------|
| Definise tipove u MongoDB | Opisuje JSON response | `src/models/Product.js` vs `src/routes/products.routes.js` |
| `required: [true, "Poruka"]` | `required: [name, price]` | Mongoose ima poruke gresaka |
| `enum: { values: [...] }` | `enum: [...]` | Slicna sintaksa |
| `timestamps: true` | `createdAt`, `updatedAt` | Mongoose automatski dodaje |
| `virtual` polja | `readOnly: true` | Mongoose izracunava |

---

### Mapiranje Mongoose <-> Swagger tipova

| Mongoose tip | Swagger tip | Primer |
|-------------|-------------|--------|
| `String` | `type: string` | `name: String` |
| `Number` | `type: number` | `price: Number` |
| `Boolean` | `type: boolean` | `isActive: Boolean` |
| `Date` | `type: string, format: date-time` | `createdAt: Date` |
| `ObjectId` | `type: string` | `_id: ObjectId` |
| `[String]` | `type: array, items: {type: string}` | `tags: [String]` |

---

### Mongoose validacija u Swagger dokumentaciji

Mongoose validacija se dokumentuje u Swagger opisima:

| Mongoose validacija | Swagger opis |
|--------------------|--------------|
| `required: [true, "Poruka"]` | Polje u `required` array |
| `minlength: 2` | `minLength: 2` |
| `maxlength: 100` | `maxLength: 100` |
| `min: 0.01` | `minimum: 0.01` |
| `max: 1000` | `maximum: 1000` |
| `enum: [...]` | `enum: [...]` |

---

### Fajlovi i njihova uloga

| Fajl | Uloga | Objasnjenje |
|------|-------|-------------|
| `.env` | Environment varijable | `MONGODB_URI`, `PORT` |
| `src/config/database.js` | DB konekcija | `mongoose.connect()` |
| `src/models/Product.js` | Mongoose model | Schema, validacija, virtuals, indexi |
| `src/controllers/products.controller.js` | CRUD logika | `Product.find()`, `Product.create()`, itd. |

---

### Mongoose metode u kontroleru

| Operacija | Mongoose metoda | HTTP |
|-----------|----------------|------|
| Citanje svih | `Product.find(filter).sort().skip().limit()` | GET |
| Citanje jednog | `Product.findById(id)` | GET /:id |
| Kreiranje | `Product.create(data)` | POST |
| Azuriranje | `Product.findByIdAndUpdate(id, data, {new: true})` | PUT /:id |
| Brisanje | `Product.findByIdAndDelete(id)` | DELETE /:id |
| Brojanje | `Product.countDocuments(filter)` | Za paginaciju |

---

### Error handling sa Mongoose

Mongoose vraca specificne tipove gresaka:

| Error tip | HTTP status | Primer |
|-----------|-------------|--------|
| `ValidationError` | 400 | Nedostaje required polje, nevalidan enum |
| `CastError` | 400 | Nevalidan ObjectId format |
| `DocumentNotFoundError` | 404 | `findById` vraca null |
| Drugi | 500 | Interna greska |

**Lokacija:** `src/controllers/products.controller.js` - Error handling u catch bloku

---

### Pokretanje sa MongoDB

1. Pokreni MongoDB lokalno ili koristi MongoDB Atlas
2. Postavi `MONGODB_URI` u `.env` fajlu
3. Pokreni server: `npm run dev`

```bash
# Lokalni MongoDB
MONGODB_URI=mongodb://localhost:27017/swagger_demo

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/swagger_demo
```

---

## Zakljucak

Na ovom casu smo naucili:

1. **Sta je API dokumentacija** - ugovor izmedju timova
2. **Zasto se koristi** - kolaboracija, odrzavanje, API ugovor
3. **Sta je Swagger vs OpenAPI** - alati vs specifikacija
4. **Kako se postavlja Swagger UI** - swagger-ui-express paket
5. **Kako se pisu opisni komentari** - @swagger JSDoc sintaksa
6. **Kako opisati request/response/greske** - komponente i seme
7. **Kako dokumentovati autorizaciju** - securitySchemes

---

## Vezba za studente

Napravite dokumentaciju za novi domen (npr. Users, Orders, Categories) sa:

- [ ] Svim CRUD endpoint-ima
- [ ] Definisanim semama
- [ ] Primerima request-a i response-a
- [ ] Svim kodovima gresaka
- [ ] Autorizacijom na odgovarajucim rutama
- [ ] Paginacijom i filterima
- [ ] Tagovima za organizaciju
