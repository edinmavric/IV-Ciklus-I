# 25. Čas - MongoDB Indeksi i Indeksiranje

## Sadržaj
1. [Uvod - Šta su indeksi?](#1-uvod---šta-su-indeksi)
2. [Analogije iz stvarnog života](#2-analogije-iz-stvarnog-života)
3. [Kako indeksi rade?](#3-kako-indeksi-rade)
4. [Tipovi indeksa](#4-tipovi-indeksa)
5. [Kreiranje indeksa](#5-kreiranje-indeksa)
6. [Pregled i brisanje indeksa](#6-pregled-i-brisanje-indeksa)
7. [Explain - Analiza performansi](#7-explain---analiza-performansi)
8. [Kada koristiti indekse?](#8-kada-koristiti-indekse)
9. [Kada NE koristiti indekse?](#9-kada-ne-koristiti-indekse)
10. [Best Practices](#10-best-practices)
11. [Praktični primeri](#11-praktični-primeri)

---

## 1. Uvod - Šta su indeksi?

### Definicija

**Indeks** je specijalna struktura podataka koja MongoDB koristi da bi brzo pronašao dokumente bez skeniranja cele kolekcije.

Bez indeksa, MongoDB mora da izvrši **collection scan** - da pročita SVAKI dokument u kolekciji da bi pronašao one koji odgovaraju upitu.

```
BEZ INDEKSA (Collection Scan):
┌─────────────────────────────────────────────────────────────────┐
│  MongoDB mora da pročita SVE dokumente da bi našao email        │
├─────────────────────────────────────────────────────────────────┤
│  Doc 1 → Doc 2 → Doc 3 → Doc 4 → ... → Doc 999.999 → Doc 1M    │
│    ↓        ↓        ↓        ↓              ↓            ↓     │
│  Check   Check   Check   Check   ...     Check       FOUND!    │
└─────────────────────────────────────────────────────────────────┘
Rezultat: 1.000.000 dokumenata skenirano za 1 rezultat!
```

```
SA INDEKSOM (Index Scan):
┌─────────────────────────────────────────────────────────────────┐
│  MongoDB koristi indeks da direktno nađe dokument               │
├─────────────────────────────────────────────────────────────────┤
│                     B-Tree Indeks                               │
│                         [M]                                     │
│                        /   \                                    │
│                     [E]     [S]                                 │
│                    /   \   /   \                                │
│                 [A-D] [F-L] [N-R] [T-Z]                         │
│                               ↓                                 │
│                          email: "petar@..."                     │
│                               ↓                                 │
│                      Direktan pristup dokumentu!                │
└─────────────────────────────────────────────────────────────────┘
Rezultat: Samo nekoliko koraka do rezultata!
```

---

## 2. Analogije iz stvarnog života

### Analogija 1: Knjiga i Sadržaj

```
KNJIGA BEZ SADRŽAJA (bez indeksa):
┌──────────────────────────────────────────────────┐
│  Želiš da nađeš poglavlje o "Rekurziji"          │
│                                                   │
│  Strana 1... ne                                   │
│  Strana 2... ne                                   │
│  Strana 3... ne                                   │
│  ...                                              │
│  Strana 347... DA! Našao!                         │
│                                                   │
│  Morao si da prođeš 347 strana!                  │
└──────────────────────────────────────────────────┘

KNJIGA SA SADRŽAJEM (sa indeksom):
┌──────────────────────────────────────────────────┐
│  SADRŽAJ:                                        │
│  - Uvod .................. str. 1                │
│  - Varijable ............. str. 15               │
│  - Funkcije .............. str. 45               │
│  - Rekurzija ............. str. 347  ← OVDE!    │
│  - Objekti ............... str. 412              │
│                                                   │
│  Pronađeno za 5 sekundi!                         │
└──────────────────────────────────────────────────┘
```

**Zaključak**: Sadržaj knjige = Indeks u bazi podataka

### Analogija 2: Biblioteka

```
BIBLIOTEKA BEZ KATALOGA:
┌──────────────────────────────────────────────────┐
│  Tražiš: "Harry Potter"                          │
│                                                   │
│  Police A... ne                                   │
│  Police B... ne                                   │
│  Police C... ne                                   │
│  ...pregledaš 50.000 knjiga...                   │
│  Police Z... DA!                                  │
│                                                   │
│  Vreme: 3 sata                                   │
└──────────────────────────────────────────────────┘

BIBLIOTEKA SA KATALOGOM:
┌──────────────────────────────────────────────────┐
│  KATALOG (sortirano po naslovu):                 │
│                                                   │
│  H → Harry Potter → Polica 15, Pozicija 23      │
│                                                   │
│  Vreme: 30 sekundi                               │
└──────────────────────────────────────────────────┘
```

### Analogija 3: Telefonski imenik

```
TELEFONSKI IMENIK (sortirano po prezimenu):

┌─────────────────────────────────────────────────────────────────┐
│  Ako tražiš: "Petrović" - Brzo! (indeks po prezimenu postoji)   │
│  Ako tražiš: Broj "065-123-456" - Sporo! (nema indeks po broju) │
└─────────────────────────────────────────────────────────────────┘

Poenta: Imenik je indeksiran po PREZIMENU, ne po broju telefona!
```

### Analogija 4: Excel tabela

```
EXCEL TABELA:
┌────────┬──────────────┬──────────┬─────────┐
│   A    │      B       │    C     │    D    │
├────────┼──────────────┼──────────┼─────────┤
│ ID     │ Ime          │ Grad     │ Plata   │
├────────┼──────────────┼──────────┼─────────┤
│ 1      │ Marko        │ Beograd  │ 1500    │
│ 2      │ Ana          │ Novi Sad │ 1800    │
│ 3      │ Petar        │ Beograd  │ 2000    │
│ ...    │ ...          │ ...      │ ...     │
│ 100000 │ Jovana       │ Niš      │ 1700    │
└────────┴──────────────┴──────────┴─────────┘

Bez filtera: CTRL+F "Beograd" → Traži red po red (sporo)
Sa filterom: Filter po koloni C → Instant rezultati (brzo)

Filter u Excelu ≈ Indeks u MongoDB
```

---

## 3. Kako indeksi rade?

### B-Tree struktura

MongoDB koristi **B-Tree** (Balanced Tree) strukturu za indekse.

```
                         B-Tree Indeks na polju "price"

                              ┌─────┐
                              │ 500 │
                              └──┬──┘
                     ┌──────────┴──────────┐
                     ▼                      ▼
                ┌─────┐                ┌─────┐
                │ 200 │                │ 800 │
                └──┬──┘                └──┬──┘
           ┌──────┴──────┐        ┌──────┴──────┐
           ▼             ▼        ▼             ▼
      ┌─────┐       ┌─────┐  ┌─────┐       ┌─────┐
      │ 100 │       │ 350 │  │ 650 │       │ 999 │
      └──┬──┘       └──┬──┘  └──┬──┘       └──┬──┘
         │              │       │              │
         ▼              ▼       ▼              ▼
    [Doc IDs]      [Doc IDs] [Doc IDs]    [Doc IDs]


Pretraga: price = 650

Korak 1: 650 > 500? DA → Idi desno
Korak 2: 650 < 800? DA → Idi levo
Korak 3: 650 = 650? DA → PRONAĐENO!

Samo 3 koraka umesto 1.000.000!
```

### Šta indeks čuva?

```
┌──────────────────────────────────────────────────────────────┐
│                    INDEKS NA POLJU "email"                   │
├──────────────────────────────────────────────────────────────┤
│  Vrednost polja      │  Pointer na dokument                  │
├──────────────────────┼───────────────────────────────────────┤
│  ana@gmail.com       │  → ObjectId("64a1...")                │
│  marko@yahoo.com     │  → ObjectId("64a2...")                │
│  petar@hotmail.com   │  → ObjectId("64a3...")                │
│  zoran@gmail.com     │  → ObjectId("64a4...")                │
└──────────────────────┴───────────────────────────────────────┘

Indeks je SORTIRAN po vrednosti polja!
```

### Vizuelni prikaz: Query sa i bez indeksa

```
                    QUERY: db.users.find({ email: "petar@hotmail.com" })

┌─────────────────────────────────────┬─────────────────────────────────────┐
│         BEZ INDEKSA                 │         SA INDEKSOM                  │
├─────────────────────────────────────┼─────────────────────────────────────┤
│                                     │                                      │
│  Collection: users (1M dokumenata)  │  Indeks: email_1                    │
│                                     │                                      │
│  ┌─────┐                            │      ┌───────────┐                   │
│  │Doc 1│ → Check email? NO          │      │  B-Tree   │                   │
│  └─────┘                            │      └─────┬─────┘                   │
│  ┌─────┐                            │            │                         │
│  │Doc 2│ → Check email? NO          │       3-4 koraka                     │
│  └─────┘                            │            │                         │
│  ┌─────┐                            │            ▼                         │
│  │Doc 3│ → Check email? NO          │      ┌───────────┐                   │
│  └─────┘                            │      │ ObjectId  │                   │
│    ...                              │      └─────┬─────┘                   │
│  ┌─────┐                            │            │                         │
│  │Doc N│ → Check email? YES!        │            ▼                         │
│  └─────┘                            │      ┌───────────┐                   │
│                                     │      │ Dokument  │                   │
│  Skeniranih: 1.000.000              │      └───────────┘                   │
│  Vreme: ~1000ms                     │                                      │
│                                     │  Skeniranih: 1                       │
│                                     │  Vreme: ~1ms                         │
└─────────────────────────────────────┴─────────────────────────────────────┘
```

---

## 4. Tipovi indeksa

### 4.1 Single Field Index (Pojedinačni indeks)

Najosnovniji tip - indeks na jednom polju.

```javascript
// Kreiranje
db.collection.createIndex({ fieldName: 1 })  // 1 = ascending
db.collection.createIndex({ fieldName: -1 }) // -1 = descending

// Primer
db.users.createIndex({ email: 1 })
db.products.createIndex({ price: -1 })
```

```
Single Field Index na "email":

email_1 indeks:
┌────────────────────────┬─────────────────┐
│ ana@gmail.com          │ → Doc ObjectId  │
│ boris@yahoo.com        │ → Doc ObjectId  │
│ ceca@hotmail.com       │ → Doc ObjectId  │
│ ...                    │ ...             │
└────────────────────────┴─────────────────┘
```

### 4.2 Compound Index (Složeni indeks)

Indeks na više polja - **REDOSLED JE BITAN!**

```javascript
// Kreiranje
db.collection.createIndex({ field1: 1, field2: -1 })

// Primer
db.products.createIndex({ category: 1, price: -1 })
```

```
Compound Index na "category" + "price":

┌─────────────────────┬─────────────┬─────────────────┐
│ category            │ price       │ Doc ObjectId    │
├─────────────────────┼─────────────┼─────────────────┤
│ electronics         │ 2500        │ → ObjectId(...) │
│ electronics         │ 1500        │ → ObjectId(...) │
│ electronics         │ 999         │ → ObjectId(...) │
│ footwear            │ 350         │ → ObjectId(...) │
│ footwear            │ 199         │ → ObjectId(...) │
│ gaming              │ 899         │ → ObjectId(...) │
└─────────────────────┴─────────────┴─────────────────┘

Sortiran PRVO po category, PA ONDA po price (desc)
```

**Pravilo prefiksa** - Compound indeks može da podrži upite na:
- Prvo polje samo
- Prvo + drugo polje
- Sva polja

```javascript
// Index: { category: 1, price: -1, stock: 1 }

// ✅ Koristi indeks (prefiks)
db.products.find({ category: "electronics" })
db.products.find({ category: "electronics", price: { $gt: 100 } })
db.products.find({ category: "electronics", price: { $gt: 100 }, stock: { $gt: 0 } })

// ❌ NE koristi indeks efikasno (preskače category)
db.products.find({ price: { $gt: 100 } })
db.products.find({ stock: { $gt: 0 } })
```

### 4.3 Unique Index (Jedinstveni indeks)

Garantuje da nema duplikata.

```javascript
// Kreiranje
db.collection.createIndex({ field: 1 }, { unique: true })

// Primer
db.users.createIndex({ email: 1 }, { unique: true })
```

```
Unique Index na "email":

Pokušaj dodavanja:
{ email: "ana@gmail.com" }  → ✅ OK (prvi put)
{ email: "boris@yahoo.com" } → ✅ OK (jedinstveno)
{ email: "ana@gmail.com" }  → ❌ ERROR: duplicate key error
```

### 4.4 Text Index (Tekstualni indeks)

Za full-text pretragu.

```javascript
// Kreiranje
db.collection.createIndex({ field: "text" })
db.collection.createIndex({ field1: "text", field2: "text" })

// Primer
db.products.createIndex({ name: "text", description: "text" })

// Pretraga
db.products.find({ $text: { $search: "wireless bluetooth" } })
```

### 4.5 TTL Index (Time-To-Live)

Automatski briše dokumente posle određenog vremena.

```javascript
// Kreiranje - dokumenti se brišu 24h nakon createdAt
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 } // 24 sata
)
```

### 4.6 Sparse Index

Indeksira samo dokumente koji IMAJU to polje.

```javascript
// Kreiranje
db.collection.createIndex({ field: 1 }, { sparse: true })

// Koristi se kada mnogi dokumenti nemaju to polje
db.users.createIndex({ middleName: 1 }, { sparse: true })
```

### 4.7 Partial Index

Indeksira samo dokumente koji zadovoljavaju uslov.

```javascript
// Kreiranje
db.orders.createIndex(
  { createdAt: 1 },
  { partialFilterExpression: { status: "pending" } }
)

// Indeksira samo orders gde je status = "pending"
```

---

## 5. Kreiranje indeksa

### Sintaksa

```javascript
db.collection.createIndex(
  { field: 1 },           // Polja za indeksiranje
  { options }             // Opcije (opciono)
)
```

### Opcije

| Opcija | Tip | Opis |
|--------|-----|------|
| `unique` | Boolean | Garantuje jedinstvene vrednosti |
| `sparse` | Boolean | Indeksira samo dokumente sa tim poljem |
| `name` | String | Prilagođeno ime indeksa |
| `expireAfterSeconds` | Number | TTL - vreme do brisanja |
| `partialFilterExpression` | Object | Uslov za parcijalno indeksiranje |
| `background` | Boolean | Kreira indeks u pozadini (deprecated u novijim verzijama) |

### Primeri kreiranja

```javascript
// 1. Osnovni indeks
db.users.createIndex({ email: 1 })

// 2. Descending indeks
db.products.createIndex({ price: -1 })

// 3. Unique indeks
db.users.createIndex({ username: 1 }, { unique: true })

// 4. Compound indeks
db.products.createIndex({ category: 1, price: -1 })

// 5. Compound unique
db.orders.createIndex(
  { oderId: 1, oderId: 1 },
  { unique: true }
)

// 6. Text indeks
db.articles.createIndex(
  { title: "text", content: "text" },
  { name: "search_index" }
)

// 7. TTL indeks (briše posle 1h)
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }
)

// 8. Partial indeks
db.products.createIndex(
  { name: 1 },
  {
    partialFilterExpression: { isActive: true },
    name: "active_products_name"
  }
)

// 9. Sparse unique
db.users.createIndex(
  { socialSecurityNumber: 1 },
  { unique: true, sparse: true }
)
```

### Kreiranje u Mongoose modelu

```javascript
// Način 1: U schema definiciji
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,  // Kreira unique indeks
    index: true    // Kreira običan indeks
  },
  username: {
    type: String,
    index: true
  }
});

// Način 2: Schema.index() metoda
userSchema.index({ lastName: 1, firstName: 1 });  // Compound
userSchema.index({ email: 1 }, { unique: true }); // Unique
userSchema.index({ name: 'text', bio: 'text' });  // Text

// Način 3: Posle schema definicije
const User = mongoose.model('User', userSchema);
```

---

## 6. Pregled i brisanje indeksa

### Pregled svih indeksa

```javascript
// MongoDB Shell / Compass
db.collection.getIndexes()

// Primer output:
[
  {
    "v": 2,
    "key": { "_id": 1 },           // Default indeks
    "name": "_id_"
  },
  {
    "v": 2,
    "key": { "email": 1 },
    "name": "email_1",
    "unique": true
  },
  {
    "v": 2,
    "key": { "category": 1, "price": -1 },
    "name": "category_1_price_-1"
  }
]
```

### Statistika indeksa

```javascript
// Veličina indeksa
db.collection.stats().indexSizes

// Output:
{
  "_id_": 368640,
  "email_1": 286720,
  "category_1_price_-1": 450560
}
```

### Brisanje indeksa

```javascript
// Po imenu
db.collection.dropIndex("email_1")

// Po specifikaciji
db.collection.dropIndex({ email: 1 })

// Obriši SVE indekse (osim _id)
db.collection.dropIndexes()
```

### U Mongoose-u

```javascript
// Dobijanje indeksa
const indexes = await Model.collection.getIndexes();
console.log(indexes);

// Kreiranje indeksa programski
await Model.collection.createIndex({ field: 1 });

// Brisanje indeksa
await Model.collection.dropIndex("field_1");

// Sync indeksa sa schemom
await Model.syncIndexes();

// Brisanje svih custom indeksa
await Model.collection.dropIndexes();
```

---

## 7. Explain - Analiza performansi

### Šta je Explain?

`explain()` je metoda koja pokazuje kako MongoDB izvršava upit - da li koristi indeks, koliko dokumenata skenira, itd.

### Explain modovi

```javascript
// 1. queryPlanner (default) - pokazuje plan bez izvršavanja
db.collection.find({ field: value }).explain()
db.collection.find({ field: value }).explain("queryPlanner")

// 2. executionStats - izvršava upit i pokazuje statistiku
db.collection.find({ field: value }).explain("executionStats")

// 3. allPlansExecution - pokazuje sve razmatrane planove
db.collection.find({ field: value }).explain("allPlansExecution")
```

### Najvažnija polja u explain output-u

```javascript
{
  "queryPlanner": {
    "winningPlan": {
      "stage": "FETCH",              // Tip operacije
      "inputStage": {
        "stage": "IXSCAN",           // IXSCAN = koristi indeks!
        "indexName": "email_1",      // Koji indeks
        "direction": "forward"
      }
    }
  },
  "executionStats": {
    "nReturned": 1,                  // Vraćeno dokumenata
    "executionTimeMillis": 0,        // Vreme izvršavanja (ms)
    "totalKeysExamined": 1,          // Pregledano ključeva u indeksu
    "totalDocsExamined": 1           // Pregledano dokumenata
  }
}
```

### Stage tipovi

| Stage | Značenje | Dobro/Loše |
|-------|----------|------------|
| `COLLSCAN` | Collection scan (bez indeksa) | ❌ Loše |
| `IXSCAN` | Index scan (koristi indeks) | ✅ Dobro |
| `FETCH` | Dohvatanje dokumenata | Neutralno |
| `SORT` | Sortiranje u memoriji | ⚠️ Može biti problem |
| `LIMIT` | Limitiranje rezultata | ✅ Dobro |
| `SKIP` | Preskakanje rezultata | Neutralno |

### Ključni pokazatelji performansi

```javascript
// IDEAL: totalKeysExamined ≈ totalDocsExamined ≈ nReturned
{
  "nReturned": 10,
  "totalKeysExamined": 10,     // ✅ Odlično - pregledano = vraćeno
  "totalDocsExamined": 10      // ✅ Odlično - bez suvišnog rada
}

// LOŠE: Više pregledanih nego vraćenih
{
  "nReturned": 10,
  "totalKeysExamined": 10000,  // ❌ Loše - previše pregledano
  "totalDocsExamined": 10000   // ❌ Loše - collection scan
}
```

### Vizuelni primeri explain-a

```
PRIMER 1: Upit BEZ indeksa (COLLSCAN)
═════════════════════════════════════

Query: db.users.find({ age: 25 })
Indeks na "age": NE POSTOJI

┌─────────────────────────────────────────────────────┐
│  executionStats:                                    │
│  ├─ nReturned: 50                                   │
│  ├─ executionTimeMillis: 850                        │
│  ├─ totalKeysExamined: 0        ← Nema indeksa!    │
│  └─ totalDocsExamined: 1000000  ← Svi dokumenti!   │
│                                                     │
│  winningPlan.stage: "COLLSCAN"  ← LOŠE!            │
└─────────────────────────────────────────────────────┘


PRIMER 2: Upit SA indeksom (IXSCAN)
═══════════════════════════════════

Query: db.users.find({ email: "test@email.com" })
Indeks na "email": POSTOJI

┌─────────────────────────────────────────────────────┐
│  executionStats:                                    │
│  ├─ nReturned: 1                                    │
│  ├─ executionTimeMillis: 0                          │
│  ├─ totalKeysExamined: 1        ← Samo 1!          │
│  └─ totalDocsExamined: 1        ← Samo 1!          │
│                                                     │
│  winningPlan.stage: "IXSCAN"    ← ODLIČNO!         │
│  winningPlan.indexName: "email_1"                   │
└─────────────────────────────────────────────────────┘
```

---

## 8. Kada koristiti indekse?

### Pravilo: Indeksiraj polja koja se ČESTO koriste u:

| Operacija | Primer | Preporuka |
|-----------|--------|-----------|
| **WHERE/find** | `find({ email: "..." })` | ✅ Indeksiraj |
| **Sortiranje** | `sort({ createdAt: -1 })` | ✅ Indeksiraj |
| **Join/Lookup** | `$lookup` na foreign key | ✅ Indeksiraj |
| **Unique constraint** | Email mora biti jedinstven | ✅ Unique indeks |
| **Range queries** | `find({ price: { $gt: 100 } })` | ✅ Indeksiraj |
| **Text search** | Full-text pretraga | ✅ Text indeks |

### Konkretni scenariji

```javascript
// 1. Login - pretraga po email-u
db.users.find({ email: "user@example.com" })
// → Kreiraj: { email: 1 } sa unique: true

// 2. Lista proizvoda po kategoriji, sortirano po ceni
db.products.find({ category: "electronics" }).sort({ price: -1 })
// → Kreiraj: { category: 1, price: -1 }

// 3. Aktivni korisnici sortirani po datumu registracije
db.users.find({ isActive: true }).sort({ createdAt: -1 })
// → Kreiraj: { isActive: 1, createdAt: -1 }

// 4. Pretraga narudžbina po korisniku
db.orders.find({ userId: ObjectId("...") })
// → Kreiraj: { userId: 1 }

// 5. Full-text pretraga proizvoda
db.products.find({ $text: { $search: "wireless headphones" } })
// → Kreiraj: { name: "text", description: "text" }
```

### Tabela odlučivanja

```
┌────────────────────────────────────┬───────────────────┬────────────────┐
│ Pitanje                            │ Ako DA            │ Ako NE         │
├────────────────────────────────────┼───────────────────┼────────────────┤
│ Polje se koristi u WHERE?          │ Razmisli o indeksu│ Verovatno ne   │
│ Polje se koristi u ORDER BY?       │ Razmisli o indeksu│ -              │
│ Polje mora biti UNIQUE?            │ Unique indeks!    │ -              │
│ Kolekcija ima > 10,000 dokumenata? │ Indeks pomaže     │ Može i bez     │
│ Upit se izvršava često?            │ Definitivno indeks│ Možda ne       │
│ Polje ima mnogo različitih vredno? │ Indeks je koristan│ Manje koristan │
└────────────────────────────────────┴───────────────────┴────────────────┘
```

---

## 9. Kada NE koristiti indekse?

### Cena indeksa

**Svaki indeks ima cenu:**

1. **Prostor na disku** - indeks zauzima dodatni prostor
2. **RAM memorija** - indeksi se čuvaju u RAM-u za brz pristup
3. **Sporiji WRITE operacije** - svaki INSERT/UPDATE/DELETE mora ažurirati sve indekse

```
WRITE OPERACIJA SA VIŠE INDEKSA:

INSERT novi dokument:
┌─────────────────────────────────────────────────────────────┐
│  1. Upiši dokument u kolekciju       ✓                      │
│  2. Ažuriraj indeks email_1          ✓                      │
│  3. Ažuriraj indeks username_1       ✓                      │
│  4. Ažuriraj indeks category_1       ✓                      │
│  5. Ažuriraj indeks price_1          ✓                      │
│                                                              │
│  5 operacija umesto 1!                                       │
│  Više indeksa = Sporiji writes                               │
└─────────────────────────────────────────────────────────────┘
```

### Scenariji kada IZBEĆI indekse

| Scenarijo | Zašto? |
|-----------|--------|
| Male kolekcije (<1000 dokumenata) | Collection scan je dovoljno brz |
| Polja sa malo različitih vrednosti | npr. `gender: M/F` - indeks ne pomaže puno |
| Polja koja se retko koriste u upitima | Samo troši resurse |
| Write-heavy aplikacije | Indeksi usporavaju write operacije |
| Polja koja se često menjaju | Konstantno ažuriranje indeksa |

### Primer: Indeks na boolean polju

```javascript
// Kolekcija: 1,000,000 korisnika
// Polje: isActive (true/false)
// Distribucija: 90% true, 10% false

db.users.find({ isActive: true })  // Vraća 900,000 dokumenata
db.users.find({ isActive: false }) // Vraća 100,000 dokumenata

// Indeks na isActive NIJE koristan jer:
// 1. Nema selektivnost (samo 2 vrednosti)
// 2. I dalje vraća ogroman broj dokumenata
```

### Selektivnost indeksa

```
VISOKA SELEKTIVNOST (dobro za indeks):
email: svaki korisnik ima jedinstveni email
       → Indeks vraća 1 dokument od 1,000,000
       → Selektivnost: 0.0001%

NISKA SELEKTIVNOST (loše za indeks):
gender: samo M ili F
        → Indeks vraća ~500,000 dokumenata od 1,000,000
        → Selektivnost: 50%

Što je selektivnost NIŽA (manji procenat), indeks je KORISNIJI!
```

### Koliko indeksa je previše?

```
PREPORUKA:

Kolekcija sa pretežno READ operacijama:
→ Može imati više indeksa (5-10)
→ Sporiji write, brži read - OK

Kolekcija sa pretežno WRITE operacijama:
→ Minimalan broj indeksa (2-3)
→ Svaki indeks usporava write

Generalno pravilo:
→ Počni sa malo indeksa
→ Dodaj samo kada explain() pokaže COLLSCAN na sporim upitima
→ Redovno proveravaj da li se svi indeksi koriste
```

---

## 10. Best Practices

### 1. ESR pravilo za Compound indekse

**E**quality → **S**ort → **R**ange

```javascript
// Upit:
db.products.find({
  category: "electronics",     // Equality
  price: { $gt: 100, $lt: 500 } // Range
}).sort({ createdAt: -1 })     // Sort

// Optimalan indeks (ESR):
db.products.createIndex({
  category: 1,    // E - Equality prvo
  createdAt: -1,  // S - Sort drugo
  price: 1        // R - Range treće
})
```

### 2. Covered queries

Upit koji može da se reši SAMO iz indeksa, bez čitanja dokumenata.

```javascript
// Indeks
db.users.createIndex({ email: 1, username: 1 })

// Covered query - vraća SAMO indeksirana polja
db.users.find(
  { email: "test@example.com" },
  { email: 1, username: 1, _id: 0 }  // Projekcija samo indeksiranih polja
)

// explain() će pokazati:
// totalDocsExamined: 0  ← Nula! Sve iz indeksa!
```

### 3. Izbegavaj $ne i $nin

```javascript
// ❌ LOŠE - Ne može efikasno koristiti indeks
db.users.find({ status: { $ne: "deleted" } })
db.users.find({ category: { $nin: ["archived", "deleted"] } })

// ✅ DOBRO - Koristi $in za pozitivne vrednosti
db.users.find({ status: { $in: ["active", "pending", "suspended"] } })
```

### 4. Indeksiraj foreign keys

```javascript
// Orders kolekcija
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),    // ← Foreign key
  productId: ObjectId("..."), // ← Foreign key
  ...
}

// OBAVEZNO kreiraj indekse
db.orders.createIndex({ userId: 1 })
db.orders.createIndex({ productId: 1 })
```

### 5. Redovno održavanje

```javascript
// Proveri koje indekse imaš
db.collection.getIndexes()

// Proveri veličinu indeksa
db.collection.stats().indexSizes

// Proveri da li se indeks koristi
db.collection.aggregate([
  { $indexStats: {} }
])
// Polje "accesses.ops" pokazuje koliko puta je indeks korišćen
```

### 6. Background indeksiranje za produkciju

```javascript
// U produkciji, kreiraj indekse u pozadini
// (MongoDB 4.2+ automatski kreira u pozadini)

// Za starije verzije:
db.collection.createIndex(
  { field: 1 },
  { background: true }
)
```

---

## 11. Praktični primeri

### Setup za testiranje

```javascript
// 1. Generiši test podatke (1000 proizvoda)
const categories = ["electronics", "footwear", "gaming", "clothing", "accessories"];
const products = [];

for (let i = 0; i < 1000; i++) {
  products.push({
    name: `Product ${i}`,
    description: `Description for product ${i}`,
    price: Math.floor(Math.random() * 1000) + 10,
    category: categories[Math.floor(Math.random() * categories.length)],
    stock: Math.floor(Math.random() * 100),
    isActive: Math.random() > 0.1,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
  });
}

db.products.insertMany(products);
```

### Primer 1: Pre i posle indeksa

```javascript
// BEZ INDEKSA
db.products.find({ category: "electronics" }).explain("executionStats")
// Rezultat: COLLSCAN, totalDocsExamined: 1000

// KREIRANJE INDEKSA
db.products.createIndex({ category: 1 })

// SA INDEKSOM
db.products.find({ category: "electronics" }).explain("executionStats")
// Rezultat: IXSCAN, totalDocsExamined: ~200
```

### Primer 2: Compound indeks za sort

```javascript
// UPIT: Proizvodi u kategoriji, sortirani po ceni (descending)
db.products.find({ category: "electronics" }).sort({ price: -1 })

// BEZ COMPOUND INDEKSA
// Stage: SORT (u memoriji) - LOŠE za velike kolekcije

// KREIRANJE COMPOUND INDEKSA
db.products.createIndex({ category: 1, price: -1 })

// SA COMPOUND INDEKSOM
// Stage: IXSCAN - sortiranje je već urađeno u indeksu!
```

### Primer 3: Text search

```javascript
// KREIRANJE TEXT INDEKSA
db.products.createIndex({ name: "text", description: "text" })

// PRETRAGA
db.products.find({ $text: { $search: "wireless bluetooth" } })

// SA SCORE-om (relevantnost)
db.products.find(
  { $text: { $search: "wireless bluetooth" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

### Primer 4: Unique indeks

```javascript
// KREIRANJE UNIQUE INDEKSA
db.users.createIndex({ email: 1 }, { unique: true })

// TEST
db.users.insertOne({ email: "test@example.com", name: "Test" }) // ✅ OK
db.users.insertOne({ email: "test@example.com", name: "Test2" }) // ❌ ERROR!
// E11000 duplicate key error
```

### Primer 5: TTL indeks

```javascript
// KREIRANJE TTL INDEKSA - briše dokumente posle 1 sata
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }
)

// TEST
db.sessions.insertOne({
  sessionId: "abc123",
  userId: ObjectId("..."),
  createdAt: new Date()
})

// Dokument će automatski biti obrisan posle 1 sata
```

---

## Rezime

### Šta su indeksi?
- Strukture podataka za brzo pronalaženje dokumenata
- Bez njih - MongoDB skenira SVE dokumente

### Kada koristiti?
- Polja u WHERE/find klauzulama
- Polja za sortiranje
- Foreign keys
- Unique constraints

### Kada NE koristiti?
- Male kolekcije
- Polja sa niskom selektivnošću
- Write-heavy aplikacije
- Polja koja se retko pretražuju

### Tipovi indeksa
| Tip | Korišćenje |
|-----|------------|
| Single | Jedno polje |
| Compound | Više polja (ESR pravilo) |
| Unique | Garantuje jedinstvenost |
| Text | Full-text pretraga |
| TTL | Auto-brisanje dokumenata |
| Sparse | Samo dokumenti sa tim poljem |
| Partial | Samo dokumenti koji zadovoljavaju uslov |

### Ključne komande
```javascript
// Kreiranje
db.collection.createIndex({ field: 1 })

// Pregled
db.collection.getIndexes()

// Brisanje
db.collection.dropIndex("indexName")

// Analiza
db.collection.find({...}).explain("executionStats")
```

### Zlatno pravilo
> "Dodaj indeks samo kada explain() pokaže COLLSCAN na upitu koji je spor i često se izvršava."

---

## Dodatni resursi

- [MongoDB Indexes Documentation](https://www.mongodb.com/docs/manual/indexes/)
- [MongoDB Explain Results](https://www.mongodb.com/docs/manual/reference/explain-results/)
- [MongoDB Index Strategies](https://www.mongodb.com/docs/manual/applications/indexes/)
- [Mongoose Indexes](https://mongoosejs.com/docs/guide.html#indexes)
