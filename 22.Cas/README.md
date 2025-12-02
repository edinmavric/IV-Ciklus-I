# 22. Čas - Pretraga, Sortiranje i Upload Fajlova

## Sadržaj
1. [Pretraga sa Regex-om](#1-pretraga-sa-regex-om)
2. [Sortiranje rezultata](#2-sortiranje-rezultata)
3. [Upload fajlova sa Multer-om](#3-upload-fajlova-sa-multer-om)
   - [JSON vs Fajlovi (Binarni podaci)](#ključni-koncept-json-vs-fajlovi-binarni-podaci)
   - [Zašto Express NE MOŽE sam da primi fajlove?](#zašto-express-ne-može-sam-da-primi-fajlove)
   - [Gde se čuvaju fajlovi?](#gde-se-čuvaju-fajlovi-file-storage)
   - [Kompletni tok upload-a (korak po korak)](#kompletni-tok-upload-a)

---

## 1. Pretraga sa Regex-om

### Teorija

Kada pravimo API za pretragu, često želimo da korisnik može da pretražuje proizvode, korisnike ili bilo koje resurse po imenu. MongoDB nam omogućava korišćenje **regularnih izraza (regex)** za fleksibilnu pretragu.

### Šta je Regex?

**Regex** (Regular Expression) je pattern koji opisuje skup stringova. U kontekstu pretrage, koristimo ga da pronađemo sve zapise koji **sadrže** određeni tekst, a ne samo one koji su **tačno jednaki**.

### Kod

```javascript
const { search } = req.query;

let query = {};

if (search) {
  query.name = { $regex: search, $options: "i" };
}

const products = await Product.find(query);
```

### Objašnjenje korak po korak

```javascript
const { search } = req.query;
```
- `req.query` sadrži sve query parametre iz URL-a
- Primer: `/products?search=laptop` → `req.query.search = "laptop"`

```javascript
let query = {};
```
- Kreiramo prazan objekat koji ćemo koristiti za MongoDB pretragu
- Ako ostane prazan, `Product.find({})` vraća SVE proizvode

```javascript
if (search) {
  query.name = { $regex: search, $options: "i" };
}
```
- `$regex` - MongoDB operator za pretragu po regularnom izrazu
- `$options: "i"` - `i` znači **case-insensitive** (nije bitno veliko/malo slovo)

### Vizuelni prikaz

```
URL: /products?search=phone

↓

req.query = { search: "phone" }

↓

query = { name: { $regex: "phone", $options: "i" } }

↓

MongoDB traži sve dokumente gde "name" SADRŽI "phone"
(case-insensitive)

↓

Rezultat: iPhone, Smartphone, Phone Case, PHONE Charger...
```

### Primeri pretrage

| URL | Šta traži | Rezultat |
|-----|-----------|----------|
| `/products?search=phone` | Proizvodi koji sadrže "phone" | iPhone, Smartphone, Phone Case... |
| `/products?search=PHONE` | Isto (case-insensitive) | iPhone, Smartphone, Phone Case... |
| `/products?search=lap` | Proizvodi koji sadrže "lap" | Laptop, Laptop Stand... |

### Razlika: Sa i bez Regex-a

```javascript
// BEZ REGEX-a - traži TAČNO podudaranje
query.name = "phone";
// Vraća SAMO proizvode gde je name TAČNO "phone"
// iPhone ❌, Smartphone ❌, phone ✅

// SA REGEX-om - traži SADRŽI
query.name = { $regex: "phone", $options: "i" };
// Vraća proizvode koji SADRŽE "phone"
// iPhone ✅, Smartphone ✅, phone ✅, PHONE Case ✅
```

---

## 2. Sortiranje rezultata

### Teorija

Sortiranje omogućava korisnicima da organizuju rezultate po željenom redosledu - po ceni, datumu, imenu, itd.

### Kako radi sortiranje u MongoDB/Mongoose

MongoDB koristi jednostavnu konvenciju:
- **Bez minusa** (`price`) → Rastuće (ASC) - od najmanjeg ka najvećem
- **Sa minusom** (`-price`) → Opadajuće (DESC) - od najvećeg ka najmanjem

### Kod

```javascript
const { sort } = req.query;

let mongoQuery = Product.find(query);

if (sort) {
  mongoQuery = mongoQuery.sort(sort);
}

const products = await mongoQuery;
```

### Objašnjenje korak po korak

```javascript
let mongoQuery = Product.find(query);
```
- `Product.find(query)` NE izvršava upit odmah!
- Vraća Query objekat na koji možemo dodati sortiranje, limitiranje, itd.

```javascript
if (sort) {
  mongoQuery = mongoQuery.sort(sort);
}
```
- `.sort(sort)` dodaje sortiranje na query
- `sort` može biti: `"price"`, `"-price"`, `"name"`, `"-createdAt"`, itd.

```javascript
const products = await mongoQuery;
```
- Tek sada se query izvršava i vraća rezultate

### Vizuelni prikaz

```
URL: /products?sort=-price

↓

req.query = { sort: "-price" }

↓

Product.find({}).sort("-price")

↓

MongoDB sortira po ceni OPADAJUĆE (od najveće ka najmanjoj)

↓

Rezultat: [{ price: 999 }, { price: 500 }, { price: 100 }]
```

### Primeri sortiranja

| URL | Rezultat |
|-----|----------|
| `/products?sort=price` | Sortirano po ceni RASTUĆE (100, 200, 300...) |
| `/products?sort=-price` | Sortirano po ceni OPADAJUĆE (300, 200, 100...) |
| `/products?sort=name` | Sortirano po imenu A-Z |
| `/products?sort=-name` | Sortirano po imenu Z-A |
| `/products?sort=-createdAt` | Najnoviji prvi |

### Kombinovanje pretrage i sortiranja

```
/products?search=laptop&sort=-price
```
Ovo vraća sve proizvode koji sadrže "laptop", sortirane od najskupljeg ka najjeftinijem.

### Kompletna funkcija

```javascript
export const getProducts = async (req, res) => {
  const { search, sort } = req.query;

  let query = {};

  // Pretraga
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  // Kreiranje query-ja
  let mongoQuery = Product.find(query);

  // Sortiranje
  if (sort) {
    mongoQuery = mongoQuery.sort(sort);
  }

  // Izvršavanje
  const products = await mongoQuery;

  res.json({
    count: products.length,
    products
  });
};
```

---

## 3. Upload fajlova sa Multer-om

### Teorija

Kada korisnik želi da upload-uje sliku (npr. profilnu sliku, sliku proizvoda), moramo da razumemo kako to funkcioniše jer je **potpuno drugačije** od slanja običnih JSON podataka.

---

## KLJUČNI KONCEPT: JSON vs Fajlovi (Binarni podaci)

### Šta je JSON?

**JSON (JavaScript Object Notation)** je **tekstualni format** za razmenu podataka. Sadrži samo karaktere koji se mogu prikazati kao tekst.

```json
{
  "name": "Laptop",
  "price": 999,
  "description": "Moćan laptop za programiranje"
}
```

**Karakteristike JSON-a:**
- Čitljiv za ljude (human-readable)
- Sadrži samo tekst, brojeve, boolean, null, objekte i nizove
- Lako se parsira i validira
- Koristi `Content-Type: application/json`

### Šta su fajlovi (binarni podaci)?

**Fajlovi** (slike, videi, PDF-ovi, audio) su **binarni podaci** - nizovi bajtova (0 i 1) koji nemaju tekstualnu reprezentaciju.

```
Slika (binarni podaci - hex prikaz):
FF D8 FF E0 00 10 4A 46 49 46 00 01 01 00 00 01...
(milioni bajtova koji predstavljaju piksele slike)
```

**Karakteristike binarnih podataka:**
- Nečitljivi za ljude (machine-readable)
- Mogu biti veoma veliki (MB, GB)
- Sadrže sirove bajtove koji mogu biti bilo koja vrednost (0-255)
- Zahtevaju specijalan format za prenos

### Zašto JSON NE MOŽE da prenese fajlove?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROBLEM SA JSON-om                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  JSON može:                    JSON NE MOŽE:                                │
│  ──────────                    ─────────────                                │
│  ✅ "text"                     ❌ Binarne bajtove (0x00, 0xFF...)           │
│  ✅ 123                        ❌ Specijalne karaktere                       │
│  ✅ true/false                 ❌ Velike količine podataka efikasno         │
│  ✅ null                                                                    │
│  ✅ { } i [ ]                                                               │
│                                                                              │
│  Primer: Slika od 5MB bi morala biti konvertovana u Base64:                 │
│  - Originalna slika: 5MB                                                    │
│  - Base64 string: ~6.67MB (33% veće!)                                       │
│  - Plus: Sporo enkodiranje/dekodiranje                                      │
│  - Plus: Server mora da parsira ogroman JSON                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Rešenje: multipart/form-data

**multipart/form-data** je format koji omogućava slanje MEŠOVITIH podataka:
- Tekstualne vrednosti (ime, cena, opis...)
- Binarne fajlove (slike, videi...)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KAKO IZGLEDA multipart/form-data                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  POST /upload HTTP/1.1                                                       │
│  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4    │
│                                                                              │
│  ------WebKitFormBoundary7MA4                                               │
│  Content-Disposition: form-data; name="name"                                │
│                                                                              │
│  Laptop                                                                      │
│  ------WebKitFormBoundary7MA4                                               │
│  Content-Disposition: form-data; name="price"                               │
│                                                                              │
│  999                                                                         │
│  ------WebKitFormBoundary7MA4                                               │
│  Content-Disposition: form-data; name="image"; filename="laptop.jpg"        │
│  Content-Type: image/jpeg                                                   │
│                                                                              │
│  [BINARNI PODACI SLIKE - bajtovi]                                           │
│  ------WebKitFormBoundary7MA4--                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Ključne razlike:**

| Aspekt | JSON (application/json) | FormData (multipart/form-data) |
|--------|-------------------------|--------------------------------|
| Tip podataka | Samo tekst | Tekst + binarni fajlovi |
| Veličina | Mali (obično < 1MB) | Veliki (do GB) |
| Struktura | Jedan JSON objekat | Više delova (parts) razdvojenih boundary-jem |
| Parsiranje | `JSON.parse()` | Specijalni parser (Multer) |
| Express podrška | `express.json()` | Multer middleware |

---

## Zašto Express NE MOŽE sam da primi fajlove?

```javascript
// Express ima ugrađene middleware-e:
app.use(express.json());        // ✅ Parsira JSON
app.use(express.urlencoded());  // ✅ Parsira form podatke

// ALI NEMA ugrađen parser za multipart/form-data!
// Zato koristimo MULTER
```

**Express middleware-i:**

| Middleware | Šta parsira | Content-Type |
|------------|-------------|--------------|
| `express.json()` | JSON body | `application/json` |
| `express.urlencoded()` | Form podaci (bez fajlova) | `application/x-www-form-urlencoded` |
| `multer` (eksterni) | Form podaci SA fajlovima | `multipart/form-data` |

---

## Gde se čuvaju fajlovi? (File Storage)

### TRI OPCIJE za čuvanje fajlova:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      OPCIJE ZA ČUVANJE FAJLOVA                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. LOKALNI DISK (File System)         ← OVO KORISTIMO U PRIMERU            │
│  ────────────────────────────                                               │
│  Fajlovi se čuvaju u folderu na serveru (npr. /uploads)                     │
│  ✅ Jednostavno za setup                                                     │
│  ✅ Besplatno                                                                │
│  ❌ Ne skalira (jedan server)                                               │
│  ❌ Gubi se ako server padne                                                │
│                                                                              │
│  2. CLOUD STORAGE (AWS S3, Google Cloud Storage, Cloudinary)                │
│  ──────────────────────────────────────────────────────────                 │
│  Fajlovi se šalju na cloud servis                                           │
│  ✅ Skalabilno (CDN, replikacija)                                           │
│  ✅ Pouzdano (backup, redundancy)                                           │
│  ❌ Košta novac                                                             │
│  ❌ Kompleksnije za setup                                                   │
│                                                                              │
│  3. BAZA PODATAKA (MongoDB GridFS, PostgreSQL BLOB)                         │
│  ─────────────────────────────────────────────────                          │
│  Fajlovi se čuvaju direktno u bazi                                          │
│  ✅ Sve na jednom mestu                                                      │
│  ❌ LOŠA PRAKSA za velike fajlove                                           │
│  ❌ Baza postaje ogromna i spora                                            │
│  ❌ Teško za skaliranje                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Naša strategija: Disk + Putanja u bazi

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                        ┌─────────────────┐                                  │
│                        │   FILE SYSTEM    │                                  │
│                        │   (Disk)         │                                  │
│                        ├─────────────────┤                                  │
│                        │ uploads/         │                                  │
│                        │ ├── 123-a.jpg    │ ← Stvarni fajl (5MB)            │
│                        │ ├── 456-b.png    │ ← Stvarni fajl (2MB)            │
│                        │ └── 789-c.gif    │ ← Stvarni fajl (1MB)            │
│                        └─────────────────┘                                  │
│                               ▲                                             │
│                               │ Putanja                                     │
│                               │                                             │
│                        ┌─────────────────┐                                  │
│                        │   MONGODB        │                                  │
│                        │   (Baza)         │                                  │
│                        ├─────────────────┤                                  │
│                        │ { name: "A",     │                                  │
│                        │   imageUrl:      │ ← Samo string (30 bajtova)      │
│                        │   "uploads/123-a.jpg" }                            │
│                        │                  │                                  │
│                        │ { name: "B",     │                                  │
│                        │   imageUrl:      │                                  │
│                        │   "uploads/456-b.png" }                            │
│                        └─────────────────┘                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Zašto je ovo dobra praksa?**

| Pristup | Veličina u bazi | Brzina query-ja | Skalabilnost |
|---------|-----------------|-----------------|--------------|
| Fajl u bazi | 5MB po dokumentu | SPORO | Loša |
| Samo putanja | 30 bajtova po dokumentu | BRZO | Dobra |

---

### Zašto ne možemo koristiti JSON za fajlove?

JSON (JavaScript Object Notation) je **tekstualni format**. Slike, videi i drugi fajlovi su **binarni podaci**.

```
JSON format (tekstualni):
{ "name": "Laptop", "price": 999 }

Slika (binarni podaci):
01001010 01000110 01001001 01000110 00000000 00010000...
(milioni bajtova binarnih podataka)
```

**JSON ne može efikasno da prenese binarne podatke!**

### Šta je FormData?

`FormData` je Web API koji nam omogućava da konstruišemo skup key/value parova koji predstavljaju form polja i njihove vrednosti, **uključujući fajlove**.

```javascript
// Na klijentu (React/JavaScript)
const formData = new FormData();
formData.append("name", "Laptop");        // Tekst
formData.append("image", selectedFile);   // Fajl (binarni podaci)
```

### Šta je Multer?

**Multer** je Node.js middleware za handling `multipart/form-data`, koji se primarno koristi za upload fajlova.

Express **NE MOŽE** sam da primi fajlove - Multer to rešava!

### Kompletni tok upload-a

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           1. KLIJENT (React)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   const [selectedFile, setSelectedFile] = useState(null);              │
│                                                                         │
│   <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
│                                                                         │
│   // Korisnik izabere fajl → selectedFile = File objekat              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      2. KREIRANJE FORMDATA                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   const formData = new FormData();                                      │
│   formData.append("image", selectedFile);                              │
│                                                                         │
│   // "image" mora da se poklapa sa upload.single("image") na serveru!  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      3. SLANJE NA SERVER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   await axios.post("/upload", formData, {                              │
│     headers: { "Content-Type": "multipart/form-data" }                 │
│   });                                                                   │
│                                                                         │
│   // Browser automatski formatira binarne podatke                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     4. SERVER PRIMA REQUEST                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   app.post("/upload", upload.single("image"), (req, res) => {          │
│     // Multer je parsirao fajl i sačuvao ga na disk                    │
│     // req.file sadrži informacije o fajlu                             │
│   });                                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       5. MULTER PROCESIRA                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   1. Prima multipart/form-data                                         │
│   2. Parsira binarne podatke                                           │
│   3. Čuva fajl na disk (u "uploads" folder)                            │
│   4. Dodaje informacije u req.file:                                    │
│      {                                                                  │
│        filename: "1701234567890-slika.jpg",                            │
│        originalname: "slika.jpg",                                      │
│        path: "uploads/1701234567890-slika.jpg",                        │
│        size: 123456,                                                   │
│        mimetype: "image/jpeg"                                          │
│      }                                                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    6. ČUVANJE PUTANJE U BAZI                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   // U bazi čuvamo SAMO PUTANJU, ne sam fajl!                          │
│   await Product.create({                                                │
│     name: "Laptop",                                                     │
│     price: 999,                                                         │
│     imageUrl: req.file.path  // "uploads/1701234567890-slika.jpg"      │
│   });                                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Instalacija

```bash
npm i multer
```

### Server Setup - multer.config.js

```javascript
import multer from "multer";

// Konfiguracija za čuvanje fajlova
const storage = multer.diskStorage({
  // Gde se čuvaju fajlovi
  destination: (req, file, cb) => {
    cb(null, "uploads");  // folder "uploads"
  },

  // Kako se zove fajl
  filename: (req, file, cb) => {
    // Dodajemo timestamp da izbegnemo duplikate
    // Primer: 1701234567890-mojasika.jpg
    cb(null, Date.now() + "-" + file.originalname);
  }
});

export const upload = multer({ storage });
```

### Objašnjenje callback funkcije `cb`

```javascript
cb(null, "uploads")
//  │      │
//  │      └── Drugi argument: vrednost (folder ili ime fajla)
//  └── Prvi argument: error (null = nema greške)
```

### Zašto dodajemo timestamp?

```
Bez timestamp-a:
  Korisnik 1 upload-uje: slika.jpg
  Korisnik 2 upload-uje: slika.jpg  ← Prepiše prvu sliku!

Sa timestamp-om:
  Korisnik 1: 1701234567890-slika.jpg
  Korisnik 2: 1701234567891-slika.jpg  ← Različita imena, obe slike sačuvane!
```

### Rute za upload

#### Upload jednog fajla

```javascript
app.post("/upload", upload.single("image"), (req, res) => {
  // req.file sadrži informacije o upload-ovanom fajlu
  console.log(req.file);
  /*
  {
    fieldname: 'image',
    originalname: 'moja-slika.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: 'uploads',
    filename: '1701234567890-moja-slika.jpg',
    path: 'uploads/1701234567890-moja-slika.jpg',
    size: 123456
  }
  */

  res.json({
    message: "Upload uspešan!",
    file: req.file
  });
});
```

| Parametar | Objašnjenje |
|-----------|-------------|
| `upload.single("image")` | Očekuje JEDAN fajl sa field imenom "image" |
| `req.file` | Objekat sa svim informacijama o fajlu |
| `req.file.path` | Putanja gde je fajl sačuvan |

#### Upload više fajlova

```javascript
app.post("/upload/multi", upload.array("files", 5), (req, res) => {
  // req.files je NIZ fajlova
  console.log(req.files);

  res.json({
    message: `Upload-ovano ${req.files.length} fajlova`,
    files: req.files
  });
});
```

| Parametar | Objašnjenje |
|-----------|-------------|
| `upload.array("files", 5)` | Očekuje do 5 fajlova sa field imenom "files" |
| `req.files` | NIZ objekata (za svaki fajl po jedan) |

### Klijent Setup (React)

```javascript
import { useState } from "react";
import axios from "axios";

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    // 1. Kreiramo FormData
    const formData = new FormData();

    // 2. Dodajemo fajl
    // VAŽNO: "image" mora da se poklapa sa upload.single("image") na serveru!
    formData.append("image", selectedFile);

    // 3. Šaljemo request
    try {
      const response = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Upload uspešan:", response.data);
    } catch (error) {
      console.error("Greška pri uploadu:", error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
```

### Čuvanje putanje u bazi

**VAŽNO:** U bazi podataka čuvamo **samo putanju** do fajla, ne sam fajl!

```javascript
// Model
const productSchema = new Schema({
  name: String,
  price: Number,
  imageUrl: String  // Samo putanja!
});

// Controller
app.post("/products", upload.single("image"), async (req, res) => {
  const { name, price } = req.body;

  const product = await Product.create({
    name,
    price,
    imageUrl: req.file.path  // "uploads/1701234567890-slika.jpg"
  });

  res.status(201).json(product);
});
```

### Zašto čuvamo samo putanju?

| Pristup | Problem |
|---------|---------|
| Čuvanje celog fajla u bazi (binary) | Baza postaje OGROMNA, spori query-ji |
| Čuvanje samo putanje | Baza ostaje mala i brza |

```
POGREŠNO:
┌─────────────────────────────────────────┐
│  MongoDB Document                       │
├─────────────────────────────────────────┤
│  name: "Laptop"                         │
│  price: 999                             │
│  image: <5MB binarnih podataka>  ❌     │
└─────────────────────────────────────────┘

ISPRAVNO:
┌─────────────────────────────────────────┐
│  MongoDB Document                       │
├─────────────────────────────────────────┤
│  name: "Laptop"                         │
│  price: 999                             │
│  imageUrl: "uploads/123-slika.jpg" ✅   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  File System                            │
├─────────────────────────────────────────┤
│  uploads/                               │
│    ├── 123-slika.jpg                    │
│    ├── 456-druga.png                    │
│    └── 789-treca.gif                    │
└─────────────────────────────────────────┘
```

### Serviranje statičkih fajlova

Da bi klijent mogao da pristupi upload-ovanim slikama, moramo da omogućimo serviranje statičkih fajlova:

```javascript
import express from "express";

const app = express();

// Omogućava pristup fajlovima iz "uploads" foldera
app.use("/uploads", express.static("uploads"));
```

Sada klijent može da pristupi slici:
```
http://localhost:3000/uploads/1701234567890-slika.jpg
```

I u React-u:
```jsx
<img src={`http://localhost:3000/${product.imageUrl}`} alt={product.name} />
```

---

## Rezime

| Tema | Ključni koncept |
|------|-----------------|
| Pretraga | `$regex` sa `$options: "i"` za case-insensitive pretragu |
| Sortiranje | `sort=field` (ASC) ili `sort=-field` (DESC) |
| Upload | Multer + FormData + multipart/form-data |
| Čuvanje slika | Fajl na disku, putanja u bazi |

---

## Struktura fajlova u ovom primeru

```
22.Cas/
├── README.md                    (ova dokumentacija)
├── server/
│   ├── index.js                 (glavni server fajl)
│   ├── config/
│   │   └── multer.config.js     (konfiguracija za upload)
│   ├── controllers/
│   │   └── product.controller.js (pretraga, sortiranje, upload)
│   ├── models/
│   │   └── Product.js           (model sa imageUrl poljem)
│   ├── routes/
│   │   └── product.routes.js    (rute za proizvode)
│   └── uploads/                 (folder za sačuvane slike)
└── client/
    └── FileUpload.jsx           (React komponenta za upload)
```

---

## Test URLs

```bash
# Pretraga
GET /products?search=phone
GET /products?search=laptop

# Sortiranje
GET /products?sort=price        # Rastuće
GET /products?sort=-price       # Opadajuće

# Kombinovano
GET /products?search=phone&sort=-price

# Upload
POST /upload                    # Jedna slika
POST /upload/multi              # Više slika
```

---

## KOMPLETNI PREGLED: Kako sve funkcioniše zajedno

### 1. Slanje JSON podataka (bez fajlova)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  KLIJENT                              SERVER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  const product = {                                                          │
│    name: "Laptop",              ───────────────►  express.json()            │
│    price: 999                                     middleware                │
│  };                                               parsira body              │
│                                                         │                   │
│  await axios.post(                                      ▼                   │
│    "/products",                                  req.body = {               │
│    product,                                        name: "Laptop",          │
│    {                                               price: 999               │
│      headers: {                                  }                          │
│        "Content-Type":                                  │                   │
│        "application/json"                               ▼                   │
│      }                                           Product.create(req.body)   │
│    }                                                    │                   │
│  );                                                     ▼                   │
│                                                  MongoDB čuva               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Slanje fajlova (sa Multer-om)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  KLIJENT                              SERVER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  const formData = new FormData();                                           │
│  formData.append("name", "Laptop");                                         │
│  formData.append("price", 999);                                             │
│  formData.append("image", file);   ──────────►  Multer middleware           │
│                                                         │                   │
│  await axios.post(                               1. Parsira multipart       │
│    "/products/with-image",                       2. Čuva fajl na disk       │
│    formData,                                     3. Popunjava req.file      │
│    {                                             4. Popunjava req.body      │
│      headers: {                                         │                   │
│        "Content-Type":                                  ▼                   │
│        "multipart/form-data"                     req.body = {               │
│      }                                             name: "Laptop",          │
│    }                                               price: "999"             │
│  );                                              }                          │
│                                                  req.file = {               │
│                                                    filename: "123-a.jpg",   │
│                                                    path: "uploads/..."      │
│                                                  }                          │
│                                                         │                   │
│                                                         ▼                   │
│                                                  Product.create({           │
│                                                    ...req.body,             │
│                                                    imageUrl: req.file.path  │
│                                                  })                         │
│                                                         │                   │
│                                                         ▼                   │
│  ┌──────────────┐                                ┌──────────────┐          │
│  │   uploads/   │◄─────────────────────────────►│   MongoDB    │          │
│  │ 123-a.jpg    │    Fajl na disku              │ imageUrl:    │          │
│  │ (5MB)        │                               │ "uploads/    │          │
│  │              │                               │  123-a.jpg"  │          │
│  │              │                               │ (30 bytes)   │          │
│  └──────────────┘                                └──────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3. Pristup upload-ovanim fajlovima

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  KLIJENT                              SERVER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  <img src="http://localhost:3000                                            │
│    /uploads/123-a.jpg" />                                                   │
│                                                                              │
│            │                                                                │
│            ▼                                                                │
│  GET /uploads/123-a.jpg  ──────────►  express.static("uploads")            │
│                                               │                             │
│                                               ▼                             │
│                                       Pronađi fajl u uploads/               │
│                                               │                             │
│                                               ▼                             │
│  Browser prikazuje sliku ◄──────────  Vrati binarni sadržaj slike          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Finalna tabela poređenja

| Aspekt | JSON Request | FormData Request |
|--------|--------------|------------------|
| **Content-Type** | `application/json` | `multipart/form-data` |
| **Middleware** | `express.json()` | `multer` |
| **Podaci u** | `req.body` | `req.body` + `req.file` |
| **Tip podataka** | Samo tekst/brojevi | Tekst + binarni fajlovi |
| **Čuvanje u bazi** | Direktno | Samo putanja do fajla |
| **Čuvanje fajla** | N/A | Na disk (uploads folder) |
| **Primer korišćenja** | CRUD operacije | Profile slike, dokumenti |

---

## Česta pitanja (FAQ)

### Zašto ne koristimo Base64 za slike?

```
Base64 = Konvertovanje binarnih podataka u tekst

Problemi:
1. Veličina: 33% veće od originala
2. Brzina: Sporo enkodiranje/dekodiranje
3. Memorija: Ceo fajl mora biti u memoriji
4. Parsiranje: JSON parser mora da obradi ogroman string

Primer:
- Originalna slika: 3MB
- Base64 string: ~4MB
- U JSON-u: {"image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."}
- Server mora da parsira 4MB+ JSON!
```

### Šta ako imam više servera (skaliranje)?

```
Problem: Fajlovi su na jednom serveru, a request može doći na drugi

Rešenje: Cloud Storage (AWS S3, Cloudinary, Google Cloud Storage)

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                                  │
│  │Server 1 │    │Server 2 │    │Server 3 │   ← Load Balancer               │
│  └────┬────┘    └────┬────┘    └────┬────┘                                  │
│       │              │              │                                        │
│       └──────────────┼──────────────┘                                        │
│                      │                                                       │
│                      ▼                                                       │
│              ┌──────────────┐                                               │
│              │  AWS S3      │  ← Centralno skladište                        │
│              │  (Cloud)     │                                               │
│              └──────────────┘                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Kako obrisati fajl kada se obriše proizvod?

```javascript
import fs from "fs";

export const deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (product.imageUrl) {
    // Obriši fajl sa diska
    fs.unlinkSync(product.imageUrl);
  }

  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Proizvod i slika obrisani" });
};
```

---

## Kompletna šema arhitekture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ProductSearch.jsx                     FileUpload.jsx                       │
│  ─────────────────                     ──────────────                       │
│  - useState za search/sort             - useState za selectedFile           │
│  - axios.get("/products", {params})    - FormData + axios.post("/upload")   │
│  - Prikazuje listu proizvoda           - Prikazuje preview slike            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Requests
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (Express)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  index.js                                                                   │
│  ─────────                                                                  │
│  - express.json()           ← Parsira JSON                                  │
│  - cors()                   ← Omogućava CORS                                │
│  - express.static("uploads")← Servira slike                                 │
│  - productRoutes            ← /products                                     │
│  - uploadRoutes             ← /upload                                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                           ROUTES                                         ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │                                                                          ││
│  │  product.routes.js              upload.routes.js                        ││
│  │  ─────────────────              ────────────────                        ││
│  │  GET    /products               POST /upload (single)                   ││
│  │  GET    /products/:id           POST /upload/multi                      ││
│  │  POST   /products                                                        ││
│  │  POST   /products/with-image                                            ││
│  │  PUT    /products/:id                                                   ││
│  │  DELETE /products/:id                                                   ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         CONTROLLERS                                      ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │                                                                          ││
│  │  product.controller.js          upload.controller.js                    ││
│  │  ─────────────────────          ────────────────────                    ││
│  │  - getProducts (search/sort)    - uploadSingleImage                     ││
│  │  - createProductWithImage       - uploadMultipleImages                  ││
│  │  - CRUD operacije                                                       ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        MULTER CONFIG                                     ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │                                                                          ││
│  │  multer.config.js                                                       ││
│  │  ────────────────                                                       ││
│  │  - diskStorage: destination + filename                                  ││
│  │  - fileFilter: samo slike                                               ││
│  │  - limits: max 5MB                                                      ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                      │                              │
                      ▼                              ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│        MongoDB              │    │      File System            │
├─────────────────────────────┤    ├─────────────────────────────┤
│                             │    │                             │
│  products collection        │    │  uploads/                   │
│  ────────────────────       │    │  ────────                   │
│  {                          │    │  ├── 123-laptop.jpg         │
│    name: "Laptop",          │    │  ├── 456-phone.png          │
│    price: 999,              │    │  └── 789-tablet.gif         │
│    imageUrl: "uploads/      │◄──►│                             │
│      123-laptop.jpg"        │    │  Stvarni binarni fajlovi    │
│  }                          │    │  (slike, dokumenti...)      │
│                             │    │                             │
└─────────────────────────────┘    └─────────────────────────────┘
```

---

## Zaključak

| Tema | Ključni takeaway |
|------|------------------|
| **JSON vs Fajlovi** | JSON = tekst, Fajlovi = binarni podaci. Ne mogu se mešati bez FormData |
| **FormData** | Web API za slanje mešovitih podataka (tekst + fajlovi) |
| **Multer** | Express middleware koji parsira multipart/form-data |
| **Storage** | Fajlovi na disku, samo putanje u bazi |
| **Static serving** | `express.static()` omogućava pristup fajlovima preko URL-a |
| **Pretraga** | MongoDB `$regex` sa `$options: "i"` |
| **Sortiranje** | Mongoose `.sort("field")` ili `.sort("-field")` |
