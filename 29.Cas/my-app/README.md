# fetch() u Next.js

---

# TEORIJA

## 1. fetch() u Next.js

Next.js proširuje nativni `fetch()` Web API sa dodatnim opcijama za **caching** i **revalidaciju**. Ovo omogućava fino podešavanje kako se podaci dohvataju i keširaju.

### Osnovna sintaksa

```javascript
// Osnovni fetch
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// Fetch sa Next.js opcijama
const response = await fetch('https://api.example.com/data', {
  cache: 'force-cache',  // ili 'no-store'
  next: {
    revalidate: 60,      // revalidacija svakih 60 sekundi
    tags: ['collection'] // za on-demand revalidaciju
  }
});
```

---

## 2. Caching strategije

Next.js nudi tri glavne strategije za keširanje:

### 2.1 force-cache (Default) - Static Site Generation (SSG)

```javascript
// Ovo je DEFAULT ponašanje - podaci se keširaju zauvijek
const response = await fetch('https://api.example.com/data', {
  cache: 'force-cache'
});
```

**Karakteristike:**
- Podaci se dohvataju JEDNOM prilikom build-a
- Kešira se na serveru
- Najbrže moguće učitavanje
- Podaci mogu biti zastarjeli

**Kada koristiti:**
- Blog postovi
- Dokumentacija
- Proizvodi koji se rijetko mijenjaju
- Statički sadržaj

**Vizualizacija:**
```
Build Time          Production
    │                   │
    ▼                   ▼
[fetch API] ────► [Cache] ────► [Svi korisnici dobijaju iste podatke]
    │
    └── Dohvata se SAMO jednom
```

---

### 2.2 no-store - Server Side Rendering (SSR)

```javascript
// Podaci se NIKAD ne keširaju - svježi podaci svaki put
const response = await fetch('https://api.example.com/data', {
  cache: 'no-store'
});
```

**Karakteristike:**
- Uvijek svježi podaci
- Podaci se dohvataju na SVAKI request
- Sporije od keširanih podataka
- Veće opterećenje API-ja

**Kada koristiti:**
- Korisnički podaci (profil, dashboard)
- Real-time informacije
- Podaci koji se često mijenjaju
- Autentifikacija

**Vizualizacija:**
```
Request 1           Request 2           Request 3
    │                   │                   │
    ▼                   ▼                   ▼
[fetch API]         [fetch API]         [fetch API]
    │                   │                   │
    └───────────────────┴───────────────────┘
                        │
            Svaki request = novi fetch
```

---

### 2.3 revalidate - Incremental Static Regeneration (ISR)

```javascript
// Podaci se revalidiraju svakih 60 sekundi
const response = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }
});
```

**Karakteristike:**
- Balans između svježine i performansi
- Stranica se regeneriše u pozadini
- Korisnici uvijek vide keširanu verziju (brzo)
- Nakon isteka vremena, sljedeći request triggeruje regeneraciju

**Kada koristiti:**
- News sajtovi
- E-commerce (cijene, stock)
- Društvene mreže (postovi)
- Bilo šta što se mijenja, ali ne u realnom vremenu

**Vizualizacija:**
```
t=0s                t=30s               t=60s               t=61s
 │                    │                   │                   │
 ▼                    ▼                   ▼                   ▼
[Build]            [Cache]            [Cache]            [Revalidate]
   │                  │                   │                   │
   └── Fresh data     └── Cached         └── Cached         └── Background fetch
                                              (stale)            + serve cached
                                                                 + update cache
```

---

## 3. Server-side Data Fetching

U Next.js App Router-u, SVE komponente su **Server Components** po defaultu.

### Direktan fetch u komponenti

```javascript
// app/users/page.js
async function UsersPage() {
  // Ovo se izvršava NA SERVERU
  const response = await fetch('https://api.example.com/users');
  const users = await response.json();

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

export default UsersPage;
```

### Prednosti Server-side fetching-a:
1. **Sigurnost** - API ključevi ostaju na serveru
2. **Performanse** - Manje JavaScript-a na klijentu
3. **SEO** - Sadržaj je dostupan crawlerima
4. **Direktan pristup** - Bazi, file sistemu, itd.

---

## 4. Parallel Fetching

Kada trebate dohvatiti više resursa, UVIJEK ih dohvatajte paralelno!

### LOŠE - Sekvencijalno (sporo)

```javascript
async function Page() {
  // Ovo traje: vrijeme1 + vrijeme2 + vrijeme3
  const users = await fetch('https://api.example.com/users').then(r => r.json());
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());
  const comments = await fetch('https://api.example.com/comments').then(r => r.json());

  return <div>...</div>;
}
```

**Timeline:**
```
|------ users (1s) ------|------ posts (1s) ------|------ comments (1s) ------|
Total: 3 sekunde
```

### DOBRO - Paralelno (brzo)

```javascript
async function Page() {
  // Ovo traje: MAX(vrijeme1, vrijeme2, vrijeme3)
  const [users, posts, comments] = await Promise.all([
    fetch('https://api.example.com/users').then(r => r.json()),
    fetch('https://api.example.com/posts').then(r => r.json()),
    fetch('https://api.example.com/comments').then(r => r.json())
  ]);

  return <div>...</div>;
}
```

**Timeline:**
```
|------ users (1s) ------|
|------ posts (1s) ------|
|------ comments (1s) ---|
Total: 1 sekunda
```

---

## 5. Poređenje strategija

| Strategija | Kada se fetch-uje | Svježina | Brzina | Use Case |
|------------|-------------------|----------|--------|----------|
| `force-cache` | Build time | Stale | ⚡⚡⚡ | Blog, docs |
| `no-store` | Svaki request | Fresh | ⚡ | Dashboard, auth |
| `revalidate: N` | Svakih N sekundi | Mostly fresh | ⚡⚡ | News, e-commerce |

---

## 6. Praktični primjeri sintakse

```javascript
// 1. SSG - Static (default)
fetch('https://api.example.com/data')
fetch('https://api.example.com/data', { cache: 'force-cache' })

// 2. SSR - Dynamic
fetch('https://api.example.com/data', { cache: 'no-store' })

// 3. ISR - Revalidate every 60 seconds
fetch('https://api.example.com/data', { next: { revalidate: 60 } })

// 4. ISR - Revalidate every hour
fetch('https://api.example.com/data', { next: { revalidate: 3600 } })

// 5. On-demand revalidation with tags
fetch('https://api.example.com/data', { next: { tags: ['products'] } })
```

---

# PRAKSA

Sada ćemo kreirati praktične primjere koristeći JSONPlaceholder API.

## Demo stranice:

1. **`/demo/force-cache`** - SSG primjer
2. **`/demo/no-store`** - SSR primjer
3. **`/demo/revalidate`** - ISR primjer (revalidate: 60)
4. **`/demo/parallel`** - Parallel fetching

---

# ZADATAK

Kreiraj stranicu `/zadatak` koja:

1. **SSR za korisnike** - Dohvata korisnike sa `cache: 'no-store'`
2. **SSG za postove** - Dohvata postove sa `cache: 'force-cache'`

Koristi JSONPlaceholder API:
- Users: `https://jsonplaceholder.typicode.com/users`
- Posts: `https://jsonplaceholder.typicode.com/posts`

---

## Pokretanje projekta

```bash
cd my-app
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000)

## Korisni linkovi

- [Next.js Docs - Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [JSONPlaceholder API](https://jsonplaceholder.typicode.com/)
