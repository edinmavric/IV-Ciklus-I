# AXIOS CLIENT - Kompletno Objašnjenje

## Sadržaj

1. [Fetch vs Axios - Ključne razlike](#1-fetch-vs-axios---ključne-razlike)
2. [Šta je Axios instanca?](#2-šta-je-axios-instanca)
3. [Interceptori - Linije kroz koje prolaze zahtevi](#3-interceptori---linije-kroz-koje-prolaze-zahtevi)
4. [Globalni Error Handling](#4-globalni-error-handling)
5. [Šta se dešava "ispod haube"?](#5-šta-se-dešava-ispod-haube)
6. [Struktura projekta](#6-struktura-projekta)
7. [Kako koristiti u React komponentama](#7-kako-koristiti-u-react-komponentama)
8. [Napredne tehnike](#8-napredne-tehnike)

---

## 1. Fetch vs Axios - Ključne razlike

### ❌ FETCH (Native JavaScript)

```javascript
// PROBLEM 1: Ne baca error za HTTP greške (404, 500...)
const response = await fetch('http://localhost:3000/users');

// Moraš ručno proveriti:
if (!response.ok) {
  throw new Error('HTTP error! Status: ' + response.status);
}

// PROBLEM 2: Moraš ručno parsirati JSON
const data = await response.json();

// PROBLEM 3: Nema instancu - ponavljaš baseURL svugde
fetch('http://localhost:3000/auth/login', { ... });
fetch('http://localhost:3000/auth/register', { ... });
fetch('http://localhost:3000/users', { ... });
// ☝️ Svaki put pišeš ceo URL!

// PROBLEM 4: Moraš ručno dodavati token u svaki zahtev
fetch('http://localhost:3000/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
// ☝️ Ponavljaš ovo u svakoj komponenti!

// PROBLEM 5: Komplikovaniji interceptori
// Nema ugrađenih interceptora, moraš sam da implementiraš...
```

### AXIOS (Biblioteka)

```javascript
import api from './api/axios';

// PREDNOST 1: Automatski baca error ako status nije 2xx
const response = await api.get('/users');
// Ako je status 404, 500... axios automatski baca error u catch blok!

// PREDNOST 2: Automatski parsira JSON
console.log(response.data); // već je objekat, ne treba .json()

// PREDNOST 3: Instanca → centralizovan config
api.get('/users');        // → http://localhost:3000/users
api.post('/auth/login');  // → http://localhost:3000/auth/login
// baseURL se dodaje automatski!

// PREDNOST 4: Token se automatski dodaje u sve zahteve
// Definišeš jednom u interceptoru, radi svugde!

// PREDNOST 5: Jednostavni interceptori
api.interceptors.request.use(config => {
  // Dodaj token automatski
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// PREDNOST 6: Bolji timeout + cancelation
const controller = new AbortController();
api.get('/users', { signal: controller.signal, timeout: 5000 });
controller.abort(); // otkaži zahtev
```

### Zaključak: Zašto Axios?

**Axios nije samo skraćen fetch.**
**Axios je SISTEM za kontrolu API komunikacije.**

Manje koda
Automatsko parsiranje JSON-a
Automatski error handling
Centralizovana konfiguracija
Moćni interceptori
Bolji developer experience

---

## 2. Šta je Axios instanca?

### Objašnjenje

Axios instanca je kao **telefonska centrala za ceo app**.

Sve API poruke prolaze kroz nju:
- **Jedno mesto** gde se podešava sve
- **Svaki API poziv** automatski koristi settings iz instance
- **Ne ponavljaš** header-e, baseURL, interceptore, token...

### Primer: Kreiranje instance

```javascript
// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',  // Automatski dodaje se ispred svakog poziva
  timeout: 10000,                     // Timeout posle 10s
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
```

### Kako se koristi?

```javascript
import api from './api/axios';

// GET request
api.get('/users');              // → http://localhost:3000/users
api.get('/users/123');          // → http://localhost:3000/users/123

// POST request
api.post('/auth/login', { email, password });

// PUT request
api.put('/users/123', { name: 'Novo ime' });

// DELETE request
api.delete('/users/123');
```

**Sve ovo automatski ima:**
- baseURL
- timeout
- default headers
- interceptore (request i response)

### Prednost: Možeš imati VIŠE instanci

```javascript
// src/api/axios.js
export const api = axios.create({
  baseURL: 'http://localhost:3000'
});

// src/api/uploadApi.js
export const uploadApi = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// src/api/externalApi.js
export const externalApi = axios.create({
  baseURL: 'https://api.example.com'
});
```

Koristi se u velikim projektima gdje imaš:
- API za backend
- API za upload fajlova
- API za eksterni servis (npr. Google Maps)

---

## 3. Interceptori - Linije kroz koje prolaze zahtevi

### Šta su interceptori?

Interceptori su **LINIJE KROZ KOJE PROLAZI SVAKI REQUEST I RESPONSE**.

Kao granica na kojoj **inspektuješ i modifikuješ** zahteve/odgovore.

### REQUEST INTERCEPTOR

**Šta radi?**
Presreće svaki zahtev **PRE nego što ode na server**.

**Gde se koristi?**
- Dodavanje tokena u header (automatski za sve pozive!)
- Dodavanje custom headera
- Logovanje svih zahteva (debugging)
- Transformacija podataka pre slanja
- Validacija da li user ima pristup

**Primer:**

```javascript
// src/api/axios.js
api.interceptors.request.use(
  (config) => {
    // 1. Dodaj token automatski
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Loguj zahtev (debugging)
    console.log('REQUEST:', config.method.toUpperCase(), config.url);

    // 3. Vrati config (mora!)
    return config;
  },
  (error) => {
    console.error('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);
```

**Kako to izgleda u praksi?**

```javascript
// U komponenti:
api.get('/users');

// Interceptor AUTOMATSKI dodaje token:
// GET http://localhost:3000/users
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Ne moraš da pišeš:
// api.get('/users', {
//   headers: { Authorization: `Bearer ${token}` }
// });
```

### RESPONSE INTERCEPTOR

**Šta radi?**
Presreće svaki odgovor **POSLE što server odgovori**.

**Gde se koristi?**
- Automatski refresh tokena ako je istekao
- Globalni error handling (401, 403, 500...)
- Logovanje svih odgovora (debugging)
- Automatski logout ako token nije validan
- Prikazivanje notifikacija (toast, alert...)
- Transformacija podataka pre nego što stignu u komponentu

**Primer:**

```javascript
// src/api/axios.js
api.interceptors.response.use(
  (response) => {
    // Uspešan odgovor (status 200-299)
    console.log('RESPONSE:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    // Greška (status 400+)

    // A) 401 UNAUTHORIZED - Token istekao
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        // Pokušaj refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('http://localhost:3000/auth/refresh', {
          token: refreshToken
        });

        // Sačuvaj novi token
        localStorage.setItem('accessToken', data.accessToken);

        // Ponovi originalni zahtev sa novim tokenom
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(error.config);

      } catch (refreshError) {
        // Refresh nije uspeo → logout
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    // B) 403 FORBIDDEN
    if (error.response?.status === 403) {
      alert('Nemaš dozvolu za ovu akciju!');
    }

    // C) 500 SERVER ERROR
    if (error.response?.status === 500) {
      alert('Problem na serveru. Pokušajte kasnije.');
    }

    return Promise.reject(error);
  }
);
```

**Kako to izgleda u praksi?**

```javascript
// U komponenti:
try {
  const response = await api.get('/users/123');
  setUser(response.data);
} catch (error) {
  // Ako je token istekao (401), interceptor automatski:
  // 1. Poziva /auth/refresh
  // 2. Čuva novi token
  // 3. Ponavlja originalni zahtev
  // 4. Vraća podatke kao da se ništa nije desilo!

  // Ti ne moraš ništa raditi, interceptor radi sve!
}
```

---

## 4. Globalni Error Handling

### Zašto je ovo važno?

Bez globalnog error handlinga, moraš u SVAKOJ komponenti:

```javascript
// ❌ Loš način - ponavljaš kod
try {
  const response = await api.get('/users');
  setUsers(response.data);
} catch (error) {
  if (error.response?.status === 401) {
    // Logout...
  } else if (error.response?.status === 403) {
    alert('Nemaš pristup');
  } else if (error.response?.status === 500) {
    alert('Server error');
  }
}
```

### Rešenje: Response interceptor

Obrađuješ greške **NA JEDNOM MESTU** u `axios.js`:

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Automatski obradi sve greške
    if (error.response?.status === 401) {
      // Refresh token ili logout
    }
    if (error.response?.status === 500) {
      alert('Server error');
    }
    return Promise.reject(error);
  }
);
```

Sada u komponentama:

```javascript
// Dobar način - jednostavno!
try {
  const response = await api.get('/users');
  setUsers(response.data);
} catch (error) {
  // Samo specifični error handling ako ti treba
  console.error('Greška:', error);
}
```

**Interceptor već sve obradio automatski!**

---

## 5. Šta se dešava "ispod haube"?

### PIPELINE (tok podataka)

```
┌─────────────────────────────────────────────────────────────┐
│  1. React komponenta pozove: api.get('/users')             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Axios instanca (axios.js):                              │
│     - Dodaje baseURL → http://localhost:3000/users          │
│     - Dodaje default headers                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  3. REQUEST INTERCEPTOR:                                    │
│     - Dodaje token u Authorization header                   │
│     - Loguje zahtev                                         │
│     - Validacija...                                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Zahtev ide na server                                    │
│     GET http://localhost:3000/users                         │
│     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Server odgovara:                                        │
│     - 200 OK + data                                         │
│     - ili 401/403/404/500 + error                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  6. RESPONSE INTERCEPTOR:                                   │
│     - Ako je 401 → pokušava refresh token                   │
│     - Ako je 500 → prikazuje alert                          │
│     - Loguje odgovor                                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  7. React komponenta dobija:                                │
│     - response.data (ako je uspešno)                        │
│     - error (ako je greška)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Struktura projekta

### Profesionalna organizacija

```
src/
├── api/
│   ├── axios.js                    ← Instanca sa interceptorima
│   ├── services/
│   │   ├── authService.js          ← Sve funkcije za auth
│   │   ├── userService.js          ← Sve funkcije za users
│   │   └── postService.js          ← Sve funkcije za posts
│   └── README.md                   ← Dokumentacija (ovaj fajl)
│
├── components/
│   ├── LoginExample.jsx            ← Primer korišćenja authService
│   └── UserProfileExample.jsx      ← Primer korišćenja userService
│
└── ...
```

### Fajlovi

#### 1. `axios.js` - Glavna instanca

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    // Error handling...
    return Promise.reject(error);
  }
);

export default api;
```

#### 2. `services/authService.js` - Auth funkcije

```javascript
import api from '../axios';

export const register = (userData) => api.post('/auth/register', userData);
export const login = (email, password) => api.post('/auth/login', { email, password });
export const logout = (email) => api.post('/auth/logout', { email });
```

#### 3. `services/userService.js` - User funkcije

```javascript
import api from '../axios';

export const getUserById = (userId) => api.get(`/users/${userId}`);
export const deleteUser = (userId) => api.delete(`/users/${userId}`);
export const updateUser = (userId, data) => api.put(`/users/${userId}`, data);
```

---

## 7. Kako koristiti u React komponentama

### Primer: Login komponenta

```javascript
import { useState } from 'react';
import { login } from '../api/services/authService';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Pozovi API
      const response = await login(email, password);

      // Sačuvaj tokene
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirektuj
      window.location.href = '/dashboard';

    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri logovanju');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### Primer: User profil komponenta

```javascript
import { useState, useEffect } from 'react';
import { getUserById } from '../api/services/userService';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(userId);
        setUser(response.data);
      } catch (err) {
        console.error('Greška:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <p>Učitavanje...</p>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

---

## 8. Napredne tehnike

### Cancel Tokens (Abort Controller)

Korisno za:
- Search inpute (otkazuješ stare zahteve)
- Unmount komponente (sprečavaš memory leak)

```javascript
import { getUserById } from './api/services/userService';
import { useEffect } from 'react';

function UserProfile({ userId }) {
  useEffect(() => {
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${userId}`, {
          signal: controller.signal
        });
        setUser(response.data);
      } catch (err) {
        if (err.name === 'CanceledError') {
          console.log('Zahtev otkazan');
        }
      }
    };

    fetchUser();

    // Cleanup: otkaži zahtev ako se komponenta unmount-uje
    return () => controller.abort();
  }, [userId]);
}
```

### Više instanci za različite API-je

```javascript
// src/api/axios.js
export const api = axios.create({
  baseURL: 'http://localhost:3000'
});

// src/api/uploadApi.js
export const uploadApi = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'multipart/form-data' }
});

// src/api/externalApi.js
export const externalApi = axios.create({
  baseURL: 'https://api.example.com'
});
```

### Request/Response Transformacija

```javascript
// Automatski transformiši podatke pre slanja
api.interceptors.request.use(config => {
  if (config.data && config.method === 'post') {
    // Npr. dodaj timestamp
    config.data.timestamp = Date.now();
  }
  return config;
});

// Automatski transformiši podatke posle primanja
api.interceptors.response.use(response => {
  // Npr. konvertuj datume u Date objekte
  if (response.data.createdAt) {
    response.data.createdAt = new Date(response.data.createdAt);
  }
  return response;
});
```

### Retry logika za failed requeste

```javascript
api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;

    // Ako je network error, pokušaj ponovo
    if (!error.response && !config._retry) {
      config._retry = true;
      config._retryCount = config._retryCount || 0;

      if (config._retryCount < 3) {
        config._retryCount++;
        console.log(`Retry ${config._retryCount}/3...`);
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## Zaključak

**Axios nije samo biblioteka za slanje HTTP zahteva.**
**Axios je centralizovani sloj za komunikaciju između frontenda i backend-a.**

### Cilj Axios-a:

- Manje dupliranja koda
- Bolji tok podataka
- Bolji error handling
- Maksimalna kontrola svih requesta iz jednog mesta

### Ključne lekcije:

1. **Instanca** = centralna telefonska centrala
2. **Interceptori** = linije kroz koje prolaze zahtevi
3. **Globalni error handling** = obradi greške na jednom mestu
4. **Servisi** = organizuj API pozive po resursima
5. **Pipeline** = razumevanje toka podataka

---

## Dodatni resursi

- [Axios Dokumentacija](https://axios-http.com/docs/intro)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Axios GitHub](https://github.com/axios/axios)

---
