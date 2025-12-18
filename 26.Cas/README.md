# 26. Čas - Pisanje Indeksa u Kodu (Best Practices)

## TL;DR - Šta kada koristiti?

```
┌─────────────────────────────────────────────────────────────────────┐
│  DECISION TREE: Kako upravljati indeksima?                          │
└─────────────────────────────────────────────────────────────────────┘

                    Da li je DEVELOPMENT?
                           │
              ┌────────────┴────────────┐
              │                         │
             DA                        NE (Production)
              │                         │
              ▼                         ▼
    ┌─────────────────┐       ┌─────────────────────┐
    │ Koristi:        │       │ Koristi:            │
    │ • autoIndex:true│       │ • autoIndex: false  │
    │ • syncIndexes() │       │ • Migracije         │
    │ • Definiši u    │       │ • Programsko        │
    │   Schema        │       │   kreiranje         │
    └─────────────────┘       └─────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│  BRZI PREGLED:                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  DEVELOPMENT:                                                       │
│  ─────────────────────────────────────────────────────────────────  │
│  1. Definiši indekse u Schema (schema.index())                      │
│  2. autoIndex: true (default) kreira ih automatski                  │
│  3. Ili koristi syncIndexes() za ručnu sinhronizaciju               │
│                                                                     │
│  PRODUCTION:                                                        │
│  ─────────────────────────────────────────────────────────────────  │
│  1. autoIndex: false (obavezno!)                                    │
│  2. Koristi migracije (verzionisane skripte)                        │
│  3. Pokreći migracije RUČNO, u kontrolisano vreme                   │
│  4. Nikad syncIndexes() - može obrisati bitne indekse               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Sadržaj
1. [Uvod - Gde definisati indekse?](#1-uvod---gde-definisati-indekse)
2. [Način 1: U Schema definiciji](#2-način-1-u-schema-definiciji)
3. [Način 2: Schema.index() metoda](#3-način-2-schemaindex-metoda)
4. [Način 3: Programsko kreiranje](#4-način-3-programsko-kreiranje)
5. [syncIndexes() - Sinhronizacija](#5-syncindexes---sinhronizacija)
6. [Migracije indeksa](#6-migracije-indeksa)
7. [Best Practices](#7-best-practices)
8. [Česte greške](#8-česte-greške)
9. [Production checklist](#9-production-checklist)

---

## 1. Uvod - Gde definisati indekse?

### Tri načina definisanja indeksa u Mongoose:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NAČINI DEFINISANJA INDEKSA                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. U SCHEMA DEFINICIJI (inline)                                    │
│     email: { type: String, index: true, unique: true }              │
│     └─ Jednostavno, ali ograničeno                                  │
│                                                                     │
│  2. SCHEMA.INDEX() METODA                                           │
│     userSchema.index({ lastName: 1, firstName: 1 })                 │
│     └─ Fleksibilno, podržava sve opcije                             │
│                                                                     │
│  3. PROGRAMSKI (runtime)                                            │
│     Model.collection.createIndex({ field: 1 })                      │
│     └─ Za migracije i dinamičke indekse                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Koji način koristiti?

| Situacija | Preporučen način |
|-----------|------------------|
| Jednostavan indeks na jednom polju | Inline u schema |
| Compound indeks | `schema.index()` |
| Unique constraint | Inline (`unique: true`) |
| Text indeks | `schema.index()` |
| Partial/Sparse indeks | `schema.index()` |
| Dinamički indeks | Programski |
| Migracija postojeće baze | Programski/Skripta |

---

## 2. Način 1: U Schema definiciji

### Sintaksa

```javascript
const userSchema = new mongoose.Schema({
  // Jednostavan indeks
  email: {
    type: String,
    index: true  // Kreira indeks { email: 1 }
  },

  // Unique indeks
  username: {
    type: String,
    unique: true  // Kreira unique indeks { username: 1 }
  },

  // Sparse indeks (indeksira samo ako polje postoji)
  phoneNumber: {
    type: String,
    sparse: true,
    index: true
  }
});
```

### Prednosti i mane

```
✅ PREDNOSTI:
   • Jednostavno i čitljivo
   • Indeks je odmah vidljiv uz polje
   • Automatski se kreira sa modelom

❌ MANE:
   • Ne podržava compound indekse
   • Ne podržava text indekse
   • Ograničene opcije
   • Ne podržava partial indekse
```

### Kada koristiti?

```javascript
// ✅ DOBRO - jednostavni slučajevi
const productSchema = new mongoose.Schema({
  sku: { type: String, unique: true },      // Unique constraint
  email: { type: String, index: true },     // Često pretražujemo
  category: { type: String, index: true }   // Filter polje
});

// ❌ LOŠE - za složene indekse
const productSchema = new mongoose.Schema({
  category: { type: String, index: true },
  price: { type: Number, index: true }
  // Ovo kreira DVA odvojena indeksa, NE compound!
});
```

---

## 3. Način 2: Schema.index() metoda

### Zašto koristiti schema.index() umesto inline?

```
SCENARIO: Treba ti indeks za pretragu proizvoda po kategoriji
          i sortiranje po ceni (najskuplji prvi)

┌─────────────────────────────────────────────────────────────────────┐
│  POKUŠAJ SA INLINE (NE RADI KAKO OČEKUJEŠ!)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  const productSchema = new mongoose.Schema({                        │
│    category: { type: String, index: true },                         │
│    price: { type: Number, index: true }                             │
│  });                                                                │
│                                                                     │
│  ❌ Ovo kreira DVA ODVOJENA indeksa:                                │
│     - { category: 1 }                                               │
│     - { price: 1 }                                                  │
│                                                                     │
│  Query: find({ category: 'electronics' }).sort({ price: -1 })       │
│                                                                     │
│  Šta se dešava:                                                     │
│  1. MongoDB koristi { category: 1 } za filter                       │
│  2. ALI mora da SORTIRA u memoriji jer nema compound indeks!        │
│  3. Na velikoj kolekciji → SPORO i troši RAM                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  REŠENJE SA schema.index() (PRAVILNO!)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  const productSchema = new mongoose.Schema({                        │
│    category: String,                                                │
│    price: Number                                                    │
│  });                                                                │
│                                                                     │
│  productSchema.index({ category: 1, price: -1 });                   │
│                                                                     │
│  ✅ Ovo kreira JEDAN COMPOUND indeks:                               │
│     - { category: 1, price: -1 }                                    │
│                                                                     │
│  Query: find({ category: 'electronics' }).sort({ price: -1 })       │
│                                                                     │
│  Šta se dešava:                                                     │
│  1. MongoDB koristi compound indeks za filter I sort                │
│  2. Rezultati su VEĆ SORTIRANI u indeksu                           │
│  3. Nema sortiranja u memoriji → BRZO!                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Sintaksa

```javascript
const schema = new mongoose.Schema({ ... });

// Posle schema definicije, pre mongoose.model()
schema.index({ field1: 1, field2: -1 }, { opcije });
```

### Svi tipovi indeksa

```javascript
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  sku: String,
  category: String,
  price: Number,
  stock: Number,
  brand: String,
  tags: [String],
  isActive: Boolean,
  createdAt: Date
});

// ═══════════════════════════════════════════════════════════
// SINGLE FIELD INDEX
// ═══════════════════════════════════════════════════════════
productSchema.index({ category: 1 });
// Ime: category_1

// ═══════════════════════════════════════════════════════════
// UNIQUE INDEX
// ═══════════════════════════════════════════════════════════
productSchema.index({ sku: 1 }, { unique: true });
// Ime: sku_1

// ═══════════════════════════════════════════════════════════
// COMPOUND INDEX
// ═══════════════════════════════════════════════════════════
productSchema.index({ category: 1, price: -1 });
// Ime: category_1_price_-1
// Sortira: category ascending, price descending

// ═══════════════════════════════════════════════════════════
// TEXT INDEX
// ═══════════════════════════════════════════════════════════
productSchema.index(
  { name: 'text', description: 'text' },
  {
    name: 'product_search',
    weights: { name: 10, description: 5 },
    default_language: 'english'
  }
);

// ═══════════════════════════════════════════════════════════
// PARTIAL INDEX
// ═══════════════════════════════════════════════════════════
productSchema.index(
  { brand: 1 },
  {
    name: 'active_products_brand',
    partialFilterExpression: { isActive: true }
  }
);
// Indeksira brand SAMO za aktivne proizvode

// ═══════════════════════════════════════════════════════════
// SPARSE INDEX
// ═══════════════════════════════════════════════════════════
productSchema.index(
  { promoCode: 1 },
  { sparse: true }
);
// Indeksira samo dokumente koji IMAJU promoCode

// ═══════════════════════════════════════════════════════════
// TTL INDEX
// ═══════════════════════════════════════════════════════════
// (obično na drugoj kolekciji, npr. sessions)
sessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }  // 1 sat
);

// ═══════════════════════════════════════════════════════════
// COMPOUND + UNIQUE
// ═══════════════════════════════════════════════════════════
orderSchema.index(
  { oderId: 1, oderId: 1 },
  { unique: true }
);

// ═══════════════════════════════════════════════════════════
// CUSTOM NAME
// ═══════════════════════════════════════════════════════════
productSchema.index(
  { category: 1, createdAt: -1 },
  { name: 'idx_category_newest' }
);
```

### Prednosti i mane

```
✅ PREDNOSTI:
   • Podržava SVE tipove indeksa
   • Podržava SVE opcije
   • Čisto odvajanje schema od indeksa
   • Lako za održavanje

❌ MANE:
   • Indeks nije vidljiv uz polje
   • Mora se pisati posle schema definicije
```

---

## 4. Način 3: Programsko kreiranje

### Zašto koristiti programsko kreiranje?

```
SCENARIO 1: Nasleđuješ projekat koji nema indekse u Schema
─────────────────────────────────────────────────────────────────────

Prethodni developer nije koristio schema.index(), ali baza
ima indekse koje je neko kreirao ručno.

❓ Problem: Ako dodaš indekse u Schema i pokreneš syncIndexes(),
            možeš obrisati postojeće indekse!

✅ Rešenje: Programski proveri šta postoji, pa dodaj šta fali:

   const existing = await Product.collection.indexes();
   if (!existing.find(i => i.name === 'category_1')) {
     await Product.collection.createIndex({ category: 1 });
   }


SCENARIO 2: Trebaš kontrolisati KADA se indeks kreira
─────────────────────────────────────────────────────────────────────

Indeks na 10M dokumenata traje 5 minuta.
Ne želiš da se to desi pri svakom deployu.

✅ Rešenje: Pokreni migraciju RUČNO, noću, kad nema saobraćaja:

   npm run migrate  // Pokreće se samo kad TI odlučiš


SCENARIO 3: Različiti indeksi za različite okoline
─────────────────────────────────────────────────────────────────────

Development: Treba ti text search za testiranje
Production: Text search nije potreban (koristi se Elasticsearch)

✅ Rešenje: Uslovno kreiranje

   if (process.env.ENABLE_TEXT_SEARCH === 'true') {
     await Product.collection.createIndex({ name: 'text' });
   }
```

### Kada koristiti? (Rezime)

```
┌─────────────────────────────────────────────────────────────────────┐
│  KORISTI PROGRAMSKO KREIRANJE KADA:                                 │
├─────────────────────────────────────────────────────────────────────┤
│  • Radiš migraciju na postojećoj bazi                               │
│  • Trebaš kreirati indeks uslovno (based on config)                 │
│  • Trebaš kreirati indeks u runtime-u                               │
│  • Pišeš migration skriptu                                          │
│  • Trebaš više kontrole nad procesom                                │
│  • Ne želiš da syncIndexes() obriše nešto                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Sintaksa

```javascript
// Direktno preko MongoDB driver-a
await Model.collection.createIndex(
  { field: 1 },           // Key specification
  { options }             // Options
);

// Primeri
await Product.collection.createIndex({ category: 1 });
await Product.collection.createIndex({ sku: 1 }, { unique: true });
await Product.collection.createIndex(
  { name: 'text', description: 'text' },
  { name: 'search_index' }
);
```

### Migration skripta primer

```javascript
// scripts/migrations/001_add_indexes.js

import mongoose from 'mongoose';

const migrate = async () => {
  const db = mongoose.connection.db;

  console.log('Starting index migration...');

  // 1. Proveri postojeće indekse
  const existingIndexes = await db.collection('products').indexes();
  const existingNames = existingIndexes.map(i => i.name);

  // 2. Definiši potrebne indekse
  const requiredIndexes = [
    {
      key: { category: 1 },
      name: 'category_1'
    },
    {
      key: { sku: 1 },
      name: 'sku_1',
      unique: true
    },
    {
      key: { category: 1, price: -1 },
      name: 'category_1_price_-1'
    }
  ];

  // 3. Kreiraj samo one koji ne postoje
  for (const index of requiredIndexes) {
    if (!existingNames.includes(index.name)) {
      console.log(`Creating index: ${index.name}`);
      await db.collection('products').createIndex(index.key, {
        name: index.name,
        unique: index.unique || false
      });
      console.log(`✓ Created: ${index.name}`);
    } else {
      console.log(`✓ Already exists: ${index.name}`);
    }
  }

  console.log('Migration complete!');
};

export default migrate;
```

---

## 5. syncIndexes() - Sinhronizacija

### Zašto uopšte koristiti syncIndexes()?

```
SCENARIO: Ti si developer, radiš na projektu...

┌─────────────────────────────────────────────────────────────────────┐
│  DAN 1: Kreiraš model sa 2 indeksa                                  │
│  ─────────────────────────────────────────────────────────────────  │
│  productSchema.index({ category: 1 });                              │
│  productSchema.index({ sku: 1 }, { unique: true });                 │
│                                                                     │
│  Pokreneš aplikaciju → MongoDB kreira ova 2 indeksa ✓               │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  DAN 15: Dodaješ novi indeks u kod                                  │
│  ─────────────────────────────────────────────────────────────────  │
│  productSchema.index({ category: 1 });                              │
│  productSchema.index({ sku: 1 }, { unique: true });                 │
│  productSchema.index({ category: 1, price: -1 });  // NOVO!         │
│                                                                     │
│  ❌ PROBLEM: Pokreneš aplikaciju, ali NOVI INDEKS SE NE KREIRA!    │
│              MongoDB već ima prva 2, ne zna za treći.               │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  REŠENJE: syncIndexes()                                             │
│  ─────────────────────────────────────────────────────────────────  │
│  await Product.syncIndexes();                                       │
│                                                                     │
│  ✅ Čita šta piše u tvojoj Schema                                   │
│  ✅ Čita šta postoji u MongoDB                                      │
│  ✅ Kreira indekse koji nedostaju                                   │
│  ✅ Briše indekse kojih više nema u Schema                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Praktični primer - Zašto je ovo korisno?

```javascript
// SITUACIJA: Imaš tim od 5 developera

// Developer A dodaje indeks za search
productSchema.index({ name: 'text' });

// Developer B dodaje indeks za filtriranje
productSchema.index({ brand: 1 });

// Developer C briše indeks koji više nije potreban
// (uklanja liniju iz koda)

// PROBLEM: Kako osigurati da SVIH 5 developera ima iste indekse
// u svojim lokalnim bazama? I kako osigurati da produkcija
// ima sve indekse?

// REŠENJE: syncIndexes() pri pokretanju aplikacije (u developmentu)
mongoose.connection.once('open', async () => {
  if (process.env.NODE_ENV === 'development') {
    await Product.syncIndexes();
    console.log('Indeksi sinhronizovani sa Schema definicijom');
  }
});
```

### Šta radi syncIndexes()?

```
┌─────────────────────────────────────────────────────────────────────┐
│                         syncIndexes()                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Čita indekse definisane u Schema                                │
│  2. Čita indekse koji postoje u MongoDB                             │
│  3. KREIRA indekse koji su u Schema ali ne u bazi                   │
│  4. BRIŠE indekse koji su u bazi ali ne u Schema                    │
│                                                                     │
│  ⚠️  PAŽNJA: Može OBRISATI indekse koje si ručno kreirao!           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Primer korišćenja

```javascript
import mongoose from 'mongoose';
import Product from './models/Product.js';
import User from './models/User.js';

const syncAllIndexes = async () => {
  try {
    console.log('Syncing indexes...');

    // Sync za svaki model
    await Product.syncIndexes();
    console.log('✓ Product indexes synced');

    await User.syncIndexes();
    console.log('✓ User indexes synced');

    console.log('All indexes synced!');
  } catch (error) {
    console.error('Error syncing indexes:', error);
  }
};

// Pozovi nakon konekcije
mongoose.connection.once('open', syncAllIndexes);
```

### Kada koristiti syncIndexes()?

```
✅ KORISTI KADA:
   • Razvijaš aplikaciju (development)
   • Prvi deployment
   • Hoćeš da Schema bude "source of truth"

❌ NE KORISTI KADA:
   • Imaš ručno kreirane indekse koje želiš zadržati
   • Produkcija sa velikim kolekcijama (može blokirati)
   • Nisi siguran koje indekse imaš
```

### autoIndex opcija - Šta je to i zašto je bitno?

```
┌─────────────────────────────────────────────────────────────────────┐
│  ŠTA JE autoIndex?                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  autoIndex: true (DEFAULT)                                          │
│  ─────────────────────────────────────────────────────────────────  │
│  Mongoose AUTOMATSKI kreira indekse pri pokretanju aplikacije.      │
│                                                                     │
│  Redosled:                                                          │
│  1. Aplikacija se pokrene                                           │
│  2. Mongoose se poveže sa MongoDB                                   │
│  3. Za SVAKI model, Mongoose šalje createIndex() za svaki indeks   │
│  4. Tek kada su SVI indeksi kreirani, aplikacija je spremna        │
│                                                                     │
│  ✅ DOBRO za development - ne moraš razmišljati                     │
│  ❌ LOŠE za produkciju - može blokirati startup na velikim bazama  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  ZAŠTO autoIndex: false U PRODUKCIJI?                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SCENARIO: Deploy nove verzije aplikacije                           │
│                                                                     │
│  autoIndex: true                                                    │
│  ─────────────────────────────────────────────────────────────────  │
│  1. Nova verzija starta                                             │
│  2. Mongoose pokušava kreirati indekse                              │
│  3. Baza ima 5M dokumenata → kreiranje traje 2 minuta              │
│  4. Za tih 2 minuta, aplikacija NE PRIMA REQUESTOVE                │
│  5. Load balancer misli da je server mrtav → restart               │
│  6. Ponovo kreće kreiranje indeksa → INFINITE LOOP                  │
│                                                                     │
│  autoIndex: false                                                   │
│  ─────────────────────────────────────────────────────────────────  │
│  1. Nova verzija starta ODMAH                                       │
│  2. Indeksi se kreiraju RUČNO, kontrolisano (migracija)            │
│  3. Nema čekanja, nema problema                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

```javascript
// U schema opcijama
const productSchema = new mongoose.Schema({...}, {
  autoIndex: true  // default: true u development
});

// Ili globalno
mongoose.set('autoIndex', false);  // Preporučeno za produkciju

// Ili u connection string
mongoose.connect(uri, { autoIndex: false });

// BEST PRACTICE: Uslovni autoIndex
mongoose.connect(uri, {
  autoIndex: process.env.NODE_ENV !== 'production'
});
// Development: autoIndex = true (automatski)
// Production: autoIndex = false (ručno/migracija)
```

---

## 6. Migracije indeksa

### Zašto NE koristiti syncIndexes() u produkciji?

```
SCENARIO: Imaš produkcijsku bazu sa 10 MILIONA dokumenata...

┌─────────────────────────────────────────────────────────────────────┐
│  PROBLEM 1: Kreiranje indeksa BLOKIRA bazu                          │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  syncIndexes() kreira indeks na 10M dokumenata:                     │
│                                                                     │
│  ⏳ 0%  ████░░░░░░░░░░░░░░░░ Kreiranje indeksa...                   │
│  ⏳ 25% ████████░░░░░░░░░░░░ Svi upiti čekaju...                    │
│  ⏳ 50% ████████████░░░░░░░░ Korisnici vide timeout...              │
│  ⏳ 75% ████████████████░░░░ Server ne reaguje...                   │
│  ✓ 100% Gotovo! (posle 5 minuta)                                    │
│                                                                     │
│  ❌ Za tih 5 minuta, sajt je bio NEDOSTUPAN!                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  PROBLEM 2: syncIndexes() može OBRISATI indeks                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  DBA je ručno kreirao indeks za optimizaciju:                       │
│  db.products.createIndex({ status: 1, region: 1 })                  │
│                                                                     │
│  Ti pokreneš syncIndexes() → Ovaj indeks se BRIŠE jer               │
│  nije definisan u tvojoj Schema!                                    │
│                                                                     │
│  ❌ Upiti koji su zavisili od tog indeksa postaju SPORI             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  PROBLEM 3: Nema verzionisanja                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Nedelja 1: Dodaš indeks A                                          │
│  Nedelja 2: Dodaš indeks B                                          │
│  Nedelja 3: Obrišeš indeks A, dodaš indeks C                        │
│                                                                     │
│  ❓ Pitanje: Koji indeksi su na produkciji?                         │
│  ❓ Pitanje: Kada je indeks B dodat?                                │
│  ❓ Pitanje: Ako nešto ne radi, kako napraviti rollback?            │
│                                                                     │
│  ❌ Sa syncIndexes() nemaš odgovor na ova pitanja!                  │
└─────────────────────────────────────────────────────────────────────┘
```

### REŠENJE: Migration sistem

```
┌─────────────────────────────────────────────────────────────────────┐
│  Migracije rešavaju SVE probleme:                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✅ KONTROLA: Ti odlučuješ KADA se indeks kreira (npr. noću)       │
│  ✅ VERZIONISANJE: Svaka promena ima verziju i datum               │
│  ✅ ROLLBACK: Svaka migracija ima DOWN funkciju za vraćanje        │
│  ✅ HISTORY: Znaš tačno šta je urađeno i kada                      │
│  ✅ SIGURNOST: Ne briše ništa automatski                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Primer: Baza čuva koje migracije su izvršene

_migrations collection:
┌──────────┬────────────────────┬─────────────────────┐
│ version  │ name               │ executedAt          │
├──────────┼────────────────────┼─────────────────────┤
│ 1        │ initial_indexes    │ 2024-01-15 02:00:00 │
│ 2        │ add_text_search    │ 2024-02-01 02:00:00 │
│ 3        │ add_compound_idx   │ 2024-02-15 02:00:00 │
└──────────┴────────────────────┴─────────────────────┘

Sada znaš tačno šta je na produkciji!
```

### Zašto migracije? (Rezime)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PROBLEM SA syncIndexes() U PRODUKCIJI:                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Može obrisati indekse koje nisi definisao u Schema              │
│  2. Kreiranje indeksa na velikoj kolekciji BLOKIRA bazu             │
│  3. Nema verzionisanje - ne znaš koji su indeksi dodati             │
│  4. Nema rollback                                                   │
│                                                                     │
│  REŠENJE: Migration skripte sa verzionisanjem                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Struktura migration sistema

```
src/
├── scripts/
│   └── migrations/
│       ├── index.js           # Migration runner
│       ├── 001_initial_indexes.js
│       ├── 002_add_text_search.js
│       └── 003_add_compound_index.js
```

### Migration runner

```javascript
// scripts/migrations/index.js

import mongoose from 'mongoose';

// Migration registry
const migrations = [];

// Register migration
export const registerMigration = (version, name, up, down) => {
  migrations.push({ version, name, up, down });
};

// Run pending migrations
export const runMigrations = async () => {
  const db = mongoose.connection.db;

  // Ensure migrations collection exists
  const migrationsCollection = db.collection('_migrations');

  // Get completed migrations
  const completed = await migrationsCollection.find({}).toArray();
  const completedVersions = completed.map(m => m.version);

  // Sort migrations by version
  const sorted = [...migrations].sort((a, b) => a.version - b.version);

  // Run pending
  for (const migration of sorted) {
    if (!completedVersions.includes(migration.version)) {
      console.log(`Running migration ${migration.version}: ${migration.name}`);

      try {
        await migration.up(db);

        await migrationsCollection.insertOne({
          version: migration.version,
          name: migration.name,
          executedAt: new Date()
        });

        console.log(`✓ Migration ${migration.version} complete`);
      } catch (error) {
        console.error(`✗ Migration ${migration.version} failed:`, error);
        throw error;
      }
    }
  }

  console.log('All migrations complete!');
};
```

### Primer migracije

```javascript
// scripts/migrations/001_initial_indexes.js

import { registerMigration } from './index.js';

registerMigration(
  1,  // version
  'initial_indexes',  // name

  // UP - kreiranje
  async (db) => {
    const products = db.collection('products');

    await products.createIndex({ category: 1 }, { name: 'category_1' });
    await products.createIndex({ sku: 1 }, { name: 'sku_1', unique: true });
    await products.createIndex(
      { category: 1, price: -1 },
      { name: 'category_1_price_-1' }
    );
  },

  // DOWN - rollback
  async (db) => {
    const products = db.collection('products');

    await products.dropIndex('category_1');
    await products.dropIndex('sku_1');
    await products.dropIndex('category_1_price_-1');
  }
);
```

---

## 7. Best Practices

### 1. Organizacija indeksa u modelu

```javascript
// models/Product.js

import mongoose from 'mongoose';

// ═══════════════════════════════════════════════════════════
// SCHEMA DEFINICIJA
// ═══════════════════════════════════════════════════════════

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    uppercase: true
    // NE stavljaj index: true ovde, definiši dole
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  brand: String,
  tags: [String],
  stock: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ═══════════════════════════════════════════════════════════
// INDEKSI - Svi na jednom mestu, sa komentarima
// ═══════════════════════════════════════════════════════════

/**
 * Unique constraint za SKU
 * Koristi se za: Garantovanje jedinstvenosti proizvoda
 */
productSchema.index({ sku: 1 }, { unique: true });

/**
 * Pretraga po kategoriji
 * Koristi se za: GET /products?category=electronics
 */
productSchema.index({ category: 1 });

/**
 * Compound: kategorija + cena (descending)
 * Koristi se za: GET /products?category=electronics&sort=-price
 * ESR: Equality (category) → Sort (price)
 */
productSchema.index({ category: 1, price: -1 });

/**
 * Full-text pretraga
 * Koristi se za: GET /products?search=wireless+headphones
 */
productSchema.index(
  { name: 'text', description: 'text' },
  {
    name: 'product_text_search',
    weights: { name: 10, description: 5 }
  }
);

/**
 * Partial: brand samo za aktivne
 * Koristi se za: Filtriranje po brendu (samo aktivni proizvodi)
 */
productSchema.index(
  { brand: 1 },
  {
    partialFilterExpression: { isActive: true },
    name: 'active_brand_idx'
  }
);

/**
 * Tagovi (multikey indeks)
 * Koristi se za: GET /products?tag=wireless
 */
productSchema.index({ tags: 1 });

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════

const Product = mongoose.model('Product', productSchema);
export default Product;
```

### 2. Imenovanje indeksa

```javascript
// LOŠE - automatska imena (teško za debug)
productSchema.index({ category: 1, price: -1 });
// Ime: category_1_price_-1 (OK, ali generičko)

// DOBRO - eksplicitna imena sa prefiksom
productSchema.index(
  { category: 1, price: -1 },
  { name: 'idx_products_category_price_desc' }
);

// Konvencija imenovanja:
// idx_{collection}_{fields}_{modifiers}
//
// Primeri:
// idx_products_sku_unique
// idx_products_category_price_desc
// idx_products_text_search
// idx_users_email_unique
// idx_orders_user_status_date
```

### 3. Dokumentovanje indeksa

```javascript
/**
 * @index {category: 1, price: -1}
 * @name idx_category_price
 * @purpose Optimizuje listing proizvoda po kategoriji sa sortiranjem po ceni
 * @queries
 *   - GET /api/products?category=X&sort=-price
 *   - GET /api/products?category=X&minPrice=Y&maxPrice=Z
 * @created 2024-01-15
 */
productSchema.index(
  { category: 1, price: -1 },
  { name: 'idx_category_price' }
);
```

### 4. Index helper funkcije

```javascript
// utils/indexHelpers.js

/**
 * Proveri da li indeks postoji
 */
export const indexExists = async (Model, indexName) => {
  const indexes = await Model.collection.indexes();
  return indexes.some(idx => idx.name === indexName);
};

/**
 * Kreiraj indeks samo ako ne postoji
 */
export const ensureIndex = async (Model, keys, options = {}) => {
  const name = options.name || Object.keys(keys).join('_');

  if (await indexExists(Model, name)) {
    console.log(`Index ${name} already exists`);
    return false;
  }

  await Model.collection.createIndex(keys, options);
  console.log(`Created index: ${name}`);
  return true;
};

/**
 * Obriši indeks ako postoji
 */
export const dropIndexIfExists = async (Model, indexName) => {
  if (await indexExists(Model, indexName)) {
    await Model.collection.dropIndex(indexName);
    console.log(`Dropped index: ${indexName}`);
    return true;
  }
  return false;
};

/**
 * Lista svih indeksa sa veličinama
 */
export const listIndexes = async (Model) => {
  const indexes = await Model.collection.indexes();
  const stats = await Model.collection.stats();

  return indexes.map(idx => ({
    name: idx.name,
    keys: idx.key,
    unique: idx.unique || false,
    sparse: idx.sparse || false,
    size: stats.indexSizes[idx.name] || 0
  }));
};
```

---

## 8. Česte greške

### Greška 1: Dupli indeksi

```javascript
// ❌ LOŠE - indeks definisan na 2 mesta
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,  // Kreira indeks
    index: true    // Kreira ISTI indeks ponovo!
  }
});

// ✅ DOBRO - samo unique (automatski kreira indeks)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  }
});
```

### Greška 2: Pogrešan redosled u compound indeksu

```javascript
// Query: find({ price: { $gt: 100 } }).sort({ category: 1 })

// ❌ LOŠE - pogrešan redosled
productSchema.index({ price: 1, category: 1 });
// MongoDB mora da sortira u memoriji!

// ✅ DOBRO - ESR pravilo (Equality, Sort, Range)
productSchema.index({ category: 1, price: 1 });
```

### Greška 3: Previše indeksa

```javascript
// ❌ LOŠE - indeks na svako polje
const productSchema = new mongoose.Schema({
  name: { type: String, index: true },
  description: { type: String, index: true },
  price: { type: Number, index: true },
  category: { type: String, index: true },
  brand: { type: String, index: true },
  color: { type: String, index: true },
  size: { type: String, index: true },
  weight: { type: Number, index: true },
  // ... svaki INSERT mora ažurirati 8+ indeksa!
});

// ✅ DOBRO - samo potrebni indeksi
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  brand: String,
  color: String,
  size: String,
  weight: Number
});

// Samo indeksi koji se stvarno koriste
productSchema.index({ category: 1, price: -1 });  // Za listing
productSchema.index({ name: 'text' });            // Za search
```

### Greška 4: Zaboravljen autoIndex: false

```javascript
// ❌ LOŠE u produkciji - može blokirati startup
mongoose.connect(uri);  // autoIndex: true by default

// ✅ DOBRO za produkciju
mongoose.connect(uri, { autoIndex: false });
// Pa ručno sync-uj kad je potrebno
```

### Greška 5: Unique na polju koje može biti null

```javascript
// ❌ PROBLEM - null se smatra vrednošću
const userSchema = new mongoose.Schema({
  email: String,
  phoneNumber: { type: String, unique: true }  // Može biti undefined
});
// Dva korisnika bez phoneNumber = duplicate key error!

// ✅ REŠENJE - sparse unique
userSchema.index(
  { phoneNumber: 1 },
  { unique: true, sparse: true }
);
// Ignoriše dokumente bez phoneNumber
```

---

## 9. Production Checklist

### Pre deployenta

```
□ autoIndex: false u produkciji
□ Svi indeksi imaju eksplicitna imena
□ Compound indeksi prate ESR pravilo
□ Nema duplikata indeksa
□ Unique indeksi na opcionalnim poljima su sparse
□ Dokumentovano zašto svaki indeks postoji
□ Migration skripta pripremljena
```

### Deployment procedura

```javascript
// scripts/deploy-indexes.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const deployIndexes = async () => {
  try {
    // 1. Konekcija
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 2. Backup trenutnih indeksa
    const Product = mongoose.model('Product');
    const currentIndexes = await Product.collection.indexes();
    console.log('Current indexes:', JSON.stringify(currentIndexes, null, 2));

    // 3. Sync (ili migration)
    console.log('Syncing indexes...');
    await Product.syncIndexes();

    // 4. Verifikacija
    const newIndexes = await Product.collection.indexes();
    console.log('New indexes:', JSON.stringify(newIndexes, null, 2));

    // 5. Test kritičnih upita
    const explain = await Product.find({ category: 'test' })
      .explain('executionStats');

    if (explain.queryPlanner.winningPlan.inputStage?.stage !== 'IXSCAN') {
      console.warn('WARNING: Category query not using index!');
    }

    console.log('Deployment complete!');

  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

deployIndexes();
```

### Monitoring

```javascript
// Periodična provera indeksa
const monitorIndexes = async () => {
  const stats = await Product.collection.aggregate([
    { $indexStats: {} }
  ]).toArray();

  // Upozori za nekorišćene indekse
  const unusedIndexes = stats.filter(s =>
    s.accesses.ops === 0 && s.name !== '_id_'
  );

  if (unusedIndexes.length > 0) {
    console.warn('Unused indexes detected:', unusedIndexes.map(i => i.name));
  }

  return stats;
};
```

---

## Rezime

### Tri načina definisanja

| Način | Kada koristiti |
|-------|----------------|
| Inline (`index: true`) | Jednostavni single-field indeksi |
| `schema.index()` | Compound, text, partial, sve opcije |
| Programski | Migracije, dinamički indeksi |

### Ključne preporuke

1. **Sve indekse na jednom mestu** u modelu
2. **Eksplicitna imena** za lakše održavanje
3. **Dokumentuj** zašto indeks postoji
4. **autoIndex: false** u produkciji
5. **Koristi migracije** za produkcijske promene
6. **Testiraj sa explain()** pre i posle

### Najčešće korišćene opcije

```javascript
schema.index({ field: 1 }, {
  unique: true,                    // Unique constraint
  sparse: true,                    // Ignoriši null/undefined
  name: 'custom_name',             // Eksplicitno ime
  partialFilterExpression: {...},  // Partial indeks
  expireAfterSeconds: 3600,        // TTL (1 sat)
  weights: { field1: 10 }          // Za text indekse
});
```
