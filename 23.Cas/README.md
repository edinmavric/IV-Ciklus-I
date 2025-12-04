# 23. Čas - Debouncing i Throttling u React-u

## Sadržaj
1. [Uvod - Zašto su nam potrebni?](#1-uvod---zašto-su-nam-potrebni)
2. [Debouncing](#2-debouncing)
   - [Šta je Debouncing?](#šta-je-debouncing)
   - [Kako radi?](#kako-debouncing-radi)
   - [Kada koristiti?](#kada-koristiti-debouncing)
3. [Throttling](#3-throttling)
   - [Šta je Throttling?](#šta-je-throttling)
   - [Kako radi?](#kako-throttling-radi)
   - [Kada koristiti?](#kada-koristiti-throttling)
4. [Ključna razlika](#4-ključna-razlika-debouncing-vs-throttling)
5. [Praktični primeri](#5-praktični-primeri)

---

## 1. Uvod - Zašto su nam potrebni?

### Problem

Zamislite da imate search input koji šalje API request svaki put kada korisnik otkuca slovo:

```javascript
// LOŠE - šalje request na SVAKO slovo!
const handleChange = (e) => {
  fetch(`/api/search?q=${e.target.value}`)
}
```

Ako korisnik otkuca "laptop":
```
l      → API request 1
la     → API request 2
lap    → API request 3
lapt   → API request 4
lapto  → API request 5
laptop → API request 6
```

**6 API poziva za jednu reč!** Ovo je:
- Nepotrebno opterećenje servera
- Trošenje korisnikove bandwidth-a
- Moguće "race condition" probleme (stariji request stigne posle novijeg)

### Rešenje

**Debouncing** i **Throttling** su tehnike za kontrolu učestalosti izvršavanja funkcija.

---

## 2. Debouncing

### Šta je Debouncing?

**Debouncing** je tehnika koja **odlaže** izvršavanje funkcije dok korisnik ne prestane da je poziva određeno vreme.

> "Sačekaj da korisnik završi, pa tek onda izvrši"

### Kako Debouncing radi?

```
Korisnik kuca: l...a...p...t...o...p
                ↓   ↓   ↓   ↓   ↓   ↓
Timer:        [====X====X====X====X====X====|500ms|]
                                                  ↓
                                            API POZIV (samo jedan!)
```

**Objašnjenje:**
1. Korisnik otkuca "l" → Startuje timer od 500ms
2. Korisnik otkuca "a" pre isteka → Timer se RESETUJE na 500ms
3. Korisnik otkuca "p" pre isteka → Timer se RESETUJE na 500ms
4. ... isto za svako slovo ...
5. Korisnik prestane da kuca
6. Timer istekne posle 500ms → API poziv se izvršava

### Debounce funkcija - korak po korak

```javascript
function debounce(func, delay) {
  let timeoutId;  // Čuva referencu na trenutni timer

  return function(...args) {
    // 1. Obriši prethodni timer (ako postoji)
    clearTimeout(timeoutId);

    // 2. Postavi novi timer
    timeoutId = setTimeout(() => {
      func.apply(this, args);  // Izvrši originalnu funkciju
    }, delay);
  };
}
```

### Vizuelni prikaz sa vremenskom linijom

```
Vreme:     0ms    100ms   200ms   300ms   400ms   500ms   600ms   700ms   800ms
            |       |       |       |       |       |       |       |       |
Kucanje:    l       a       p       t       o       p
            ↓       ↓       ↓       ↓       ↓       ↓
Timer:     [==X    [==X    [==X    [==X    [==X    [==================]
            ↑       ↑       ↑       ↑       ↑                         ↓
         Reset!  Reset!  Reset!  Reset!  Reset!                  POZIV!
                                                               search("laptop")
```

### Kada koristiti Debouncing?

| Situacija | Zašto debouncing? |
|-----------|-------------------|
| Search input | Sačekaj da korisnik završi kucanje |
| Auto-save | Sačekaj da korisnik završi pisanje |
| Resize window | Sačekaj da korisnik završi resize |
| Form validacija | Sačekaj da korisnik završi unos |

### React primer - bez debouncing-a vs sa debouncing-om

```javascript
// ❌ BEZ DEBOUNCING-A - svaki keystroke = API poziv
const handleSearch = (e) => {
  fetch(`/api/search?q=${e.target.value}`);
};

// ✅ SA DEBOUNCING-OM - jedan API poziv nakon što korisnik prestane da kuca
const debouncedSearch = useMemo(
  () => debounce((query) => {
    fetch(`/api/search?q=${query}`);
  }, 500),
  []
);
```

---

## 3. Throttling

### Šta je Throttling?

**Throttling** je tehnika koja **ograničava** koliko često se funkcija može izvršiti u određenom vremenskom periodu.

> "Izvrši maksimalno jednom u svakih X milisekundi"

### Kako Throttling radi?

```
Scroll eventi:   ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
                 |                   |                   |
Vreme:         0ms              200ms               400ms
                 ↓                   ↓                   ↓
Izvršenja:    POZIV              POZIV              POZIV
              (ostali eventi ignorisani do sledećeg intervala)
```

**Objašnjenje:**
1. Korisnik scrolluje - funkcija se odmah izvrši
2. Sledeći scroll eventi se ignorišu sledećih 200ms
3. Posle 200ms, sledeći scroll event se izvršava
4. I tako u krug...

### Throttle funkcija - korak po korak

```javascript
function throttle(func, limit) {
  let inThrottle = false;  // Da li smo u "cooldown" periodu?

  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);  // Izvrši funkciju
      inThrottle = true;        // Uđi u cooldown

      setTimeout(() => {
        inThrottle = false;     // Izađi iz cooldown-a posle "limit" ms
      }, limit);
    }
    // Ako smo u throttle periodu, poziv se ignoriše
  };
}
```

### Vizuelni prikaz sa vremenskom linijom

```
Vreme:        0ms       100ms     200ms     300ms     400ms     500ms
               |          |         |         |         |         |
Scroll:        ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
               |          |         |         |         |         |
Throttle:     [=====BLOK=====]    [=====BLOK=====]    [=====BLOK=====]
               ↓                    ↓                    ↓
Izvršenja:   POZIV               POZIV               POZIV
           (svi ostali eventi ignorisani)
```

### Kada koristiti Throttling?

| Situacija | Zašto throttling? |
|-----------|-------------------|
| Scroll eventi | Ne želimo 100 poziva u sekundi |
| Resize eventi | Ograniči računanje layout-a |
| Mouse move | Ograniči tracking pozicije |
| Igre - input | Ograniči pucanje/skakanje |

### React primer - bez throttling-a vs sa throttling-om

```javascript
// ❌ BEZ THROTTLING-A - može biti 60+ poziva u sekundi
window.addEventListener('scroll', () => {
  console.log('Scroll position:', window.scrollY);
});

// ✅ SA THROTTLING-OM - maksimalno 5 poziva u sekundi
const throttledScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 200);

window.addEventListener('scroll', throttledScroll);
```

---

## 4. Ključna razlika: Debouncing vs Throttling

### Vizuelna usporedba

```
                    Debouncing                         Throttling
                    ==========                         ==========

Eventi:     ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ___        ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
                                   |         |         |         |
                                   ↓         ↓         ↓         ↓
Izvršenja:                      JEDNOM    POZIV     POZIV     POZIV
                              (na kraju)  (svaki interval)
```

### Tabela poređenja

| Aspekt | Debouncing | Throttling |
|--------|------------|------------|
| **Kada se izvršava?** | Posle pauze | Tokom akcije, u intervalima |
| **Koliko puta?** | Jednom (na kraju) | Više puta (periodično) |
| **Idealno za** | Čekanje da korisnik završi | Ograničavanje brzine |
| **Tipični primeri** | Search, Auto-save | Scroll, Resize, Mouse move |
| **Delay feeling** | Korisnik oseća delay | Korisnik ne oseća delay |

### Analogija iz stvarnog života

**Debouncing = Lift**
- Lift ne kreće odmah kad uđeš
- Čeka da svi uđu (neko vreme bez novih putnika)
- Tek onda kreće

**Throttling = Autobus**
- Autobus kreće svakih 15 minuta
- Nije bitno koliko ljudi čeka
- Dolazi u regularnim intervalima

---

## 5. Praktični primeri

### Primer 1: Search sa Debouncing-om

```jsx
import { useState, useMemo, useCallback } from 'react';

// Debounce helper funkcija
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Kreiranje debounced search funkcije
  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${searchQuery}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500),  // 500ms delay
    []
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);  // Poziva debounced verziju
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Pretraži..."
      />
      {isLoading && <p>Učitavanje...</p>}
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Primer 2: Infinite Scroll sa Throttling-om

```jsx
import { useState, useEffect, useCallback, useRef } from 'react';

// Throttle helper funkcija
function throttle(func, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function InfiniteScrollComponent() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    const response = await fetch(`/api/items?page=${page}`);
    const newItems = await response.json();
    setItems(prev => [...prev, ...newItems]);
    setPage(prev => prev + 1);
    setIsLoading(false);
  }, [page, isLoading]);

  useEffect(() => {
    const throttledScroll = throttle(() => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Ako smo blizu dna stranice, učitaj još
      if (scrollTop + windowHeight >= docHeight - 200) {
        loadMore();
      }
    }, 200);  // Maksimalno 5 puta u sekundi

    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [loadMore]);

  return (
    <div>
      {items.map(item => (
        <div key={item.id} className="item">{item.name}</div>
      ))}
      {isLoading && <p>Učitavanje...</p>}
    </div>
  );
}
```

---

## Bonus: Korišćenje Lodash biblioteke

U praksi, često koristimo gotove implementacije iz biblioteka kao što je `lodash`:

```bash
npm install lodash
```

```javascript
import { debounce, throttle } from 'lodash';

// Debounce
const debouncedSearch = debounce((query) => {
  // API poziv
}, 500);

// Throttle
const throttledScroll = throttle(() => {
  // Scroll handling
}, 200);
```

### Lodash prednosti:
- Testirana i optimizovana implementacija
- Dodatne opcije (leading, trailing, cancel, flush)
- TypeScript podrška

```javascript
// Napredne opcije
const debouncedFn = debounce(myFunc, 500, {
  leading: true,   // Izvrši odmah na prvi poziv
  trailing: true,  // Izvrši i na kraju
  maxWait: 2000    // Maksimalno čekanje 2 sekunde
});

// Cancel - otkazivanje
debouncedFn.cancel();

// Flush - forsiranje izvršavanja odmah
debouncedFn.flush();
```

---

## Rezime

| Tehnika | Koristi kada... | Primer |
|---------|-----------------|--------|
| **Debouncing** | Želiš da sačekaš da korisnik završi akciju | Search input, Auto-save, Form validation |
| **Throttling** | Želiš da ograničiš učestalost izvršavanja | Scroll, Resize, Mouse tracking |

### Pravilo palca:
- **Debouncing**: "Korisnik kuca" → sačekaj da završi
- **Throttling**: "Korisnik scrolluje" → izvršavaj periodično

---

## Dodatni resursi

- [Lodash Debounce dokumentacija](https://lodash.com/docs/4.17.15#debounce)
- [Lodash Throttle dokumentacija](https://lodash.com/docs/4.17.15#throttle)
- [React useCallback i useMemo](https://react.dev/reference/react/useCallback)
