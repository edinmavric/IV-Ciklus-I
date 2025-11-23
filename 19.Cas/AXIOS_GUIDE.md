# AXIOS - Kompletan Vodič za Studente

## Cilj ovog casa

Razumeti **zašto** i **kako** koristiti Axios umesto običnog fetch-a, i naučiti **best practices** za organizaciju API komunikacije u realnim projektima.

---

## 1. FETCH vs AXIOS - Ključna razlika (suština)

### ❌ Problem sa FETCH:

```javascript
// 1. NE BACA ERROR za HTTP greške
const res = await fetch('http://localhost:3000/users/123');

// Moraš ručno proveriti:
if (!res.ok) {
  throw new Error('HTTP Error: ' + res.status);
}

// 2. Moraš ručno parsirati JSON
const data = await res.json();

// 3. Nema instancu - ponavljaš sve svaki put
fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token  // Ponavljaš ovo SVUGDE!
  },
  body: JSON.stringify({ email, password })
});
```

### Axios rešava sve ove probleme:

```javascript
import api from './api/axios';

// 1. Automatski baca error za 400, 404, 500...
// 2. Automatski parsira JSON
// 3. Instanca → sve je centralizovano
const response = await api.get('/users/123');

// Token se automatski dodaje (interceptor!)
// baseURL se automatski dodaje
// Headers se automatski dodaju
```

### Zaključak:

> **Axios nije samo skraćen fetch.**
> **Axios je SISTEM za kontrolu API komunikacije.**

---

## 2. Šta tačno znači "Axios instanca"?

### Jednostavno poređenje:

**Kao da praviš jednu telefonsku centralu za ceo app.**
**Sve API poruke prolaze kroz nju.**

### Primer:

```javascript
// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',  // Jedno mesto - jedna konfiguracija
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
```

### Kako se koristi?

```javascript
import api from './api/axios';

// Automatski dodaje baseURL:
api.get('/users');              // → GET http://localhost:3000/users
api.post('/auth/login', {...}); // → POST http://localhost:3000/auth/login
```

### Prednosti:

- **Jedno mesto** za sve settings
- **Ne ponavljaš** baseURL, headers, timeout...
- **Svaki API poziv** koristi istu konfiguraciju
- **Lako se održava** - menjaš URL na jednom mestu

---

## 3. Interceptori - Linije kroz koje prolazi svaki request

### Šta su interceptori?

**LINIJE KROZ KOJE PROLAZI SVAKI REQUEST I RESPONSE.**

Kao **sigurnosna provera na granici** - inspektuješ i modifikuješ sve što prolazi.

### REQUEST INTERCEPTOR

**Presreće zahtev PRE nego što ode na server.**

```javascript
api.interceptors.request.use(
  (config) => {
    // 1. Dodaj token automatski
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Loguj zahtev (debugging)
    console.log('📤 REQUEST:', config.method.toUpperCase(), config.url);

    // 3. MORA se vratiti config!
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Šta ovo znači u praksi?**

```javascript
// U komponenti:
api.get('/users');

// Interceptor AUTOMATSKI dodaje:
// GET http://localhost:3000/users
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// NE MORAŠ VIŠE:
// api.get('/users', {
//   headers: { Authorization: `Bearer ${token}` }
// });
```

### RESPONSE INTERCEPTOR

**Presreće odgovor POSLE što server odgovori.**

```javascript
api.interceptors.response.use(
  (response) => {
    // Uspešan odgovor
    console.log('RESPONSE:', response.status);
    return response;
  },
  async (error) => {
    // GREŠKA!

    // A) 401 - Token istekao? Pokušaj refresh!
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        // Osvježi token
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('http://localhost:3000/auth/refresh', {
          token: refreshToken
        });

        // Sačuvaj novi token
        localStorage.setItem('accessToken', data.accessToken);

        // PONOVI originalni zahtev sa novim tokenom!
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(error.config);

      } catch (refreshError) {
        // Refresh nije uspeo → logout
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    // B) 403 - Nemaš pristup
    if (error.response?.status === 403) {
      alert('Nemaš dozvolu za ovu akciju!');
    }

    // C) 500 - Server error
    if (error.response?.status === 500) {
      alert('Problem na serveru. Pokušajte kasnije.');
    }

    return Promise.reject(error);
  }
);
```

**Šta ovo znači u praksi?**

```javascript
// U komponenti:
try {
  const response = await api.get('/users/123');
  setUser(response.data);
} catch (error) {
  // Ako je token istekao (401), interceptor je automatski:
  // 1. Pozvao /auth/refresh
  // 2. Sačuvao novi token
  // 3. Ponovio originalni zahtev
  // 4. Vratio podatke kao da se ništa nije desilo!

  // TI NE MORAŠ NIŠTA RADITI!
}
```

---

## 4. Globalni Error Handling

### ❌ Loš način (ponavljanje koda):

```javascript
// Komponenta 1:
try {
  await api.get('/users');
} catch (error) {
  if (error.response?.status === 500) alert('Server error');
  if (error.response?.status === 401) { /* logout */ }
}

// Komponenta 2:
try {
  await api.get('/posts');
} catch (error) {
  if (error.response?.status === 500) alert('Server error');  // Ponavljaš!
  if (error.response?.status === 401) { /* logout */ }        // Ponavljaš!
}
```

### Dobar način (interceptor):

```javascript
// axios.js - JEDNO MESTO
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 500) {
      alert('Server error');
    }
    if (error.response?.status === 401) {
      // Logout ili refresh token...
    }
    return Promise.reject(error);
  }
);

// Sada u komponentama:
try {
  await api.get('/users');
} catch (error) {
  // Interceptor već obradio greške!
  // Samo specifični error handling ako ti treba
}
```

---

## 5. Šta se dešava "ispod haube"?

### Pipeline (tok podataka):

```
┌─────────────────────────────────────┐
│ 1. React komponenta:                │
│    api.get('/users')                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 2. Axios instanca:                  │
│    - Dodaje baseURL                 │
│    - Dodaje default headers         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 3. REQUEST INTERCEPTOR:             │
│    - Dodaje token                   │
│    - Loguje zahtev                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 4. Zahtev ide na server:            │
│    GET http://localhost:3000/users  │
│    Authorization: Bearer ...        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 5. Server odgovara:                 │
│    200 OK + data                    │
│    ili 401/403/500 + error          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 6. RESPONSE INTERCEPTOR:            │
│    - Ako 401 → refresh token        │
│    - Ako 500 → prikaži alert        │
│    - Loguje odgovor                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 7. React komponenta dobija:         │
│    - response.data (uspeh)          │
│    - error (greška)                 │
└─────────────────────────────────────┘
```

---

## 6. Organizacija API koda u projektima

### Profesionalna struktura:

```
src/
├── api/
│   ├── axios.js              ← Instanca sa interceptorima
│   └── services/
│       ├── authService.js    ← Sve za auth (login, register, logout)
│       ├── userService.js    ← Sve za usere (GET, DELETE, UPDATE)
│       └── postService.js    ← Sve za postove (ako ih imaš)
```

### Primer servisa:

```javascript
// src/api/services/authService.js
import api from '../axios';

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = (userData) => {
  return api.post('/auth/register', userData);
};

export const logout = (email) => {
  return api.post('/auth/logout', { email });
};
```

```javascript
// src/api/services/userService.js
import api from '../axios';

export const getUserById = (userId) => {
  return api.get(`/users/${userId}`);
};

export const deleteUser = (userId) => {
  return api.delete(`/users/${userId}`);
};
```

### Korišćenje u komponentama:

```javascript
import { login } from './api/services/authService';
import { getUserById } from './api/services/userService';

// Login
const response = await login('marko@mail.com', 'password123');

// Get user
const user = await getUserById('123abc');
```

### Prednosti:

- **Organizovano** - Sve za auth na jednom mestu
- **Reusable** - Funkcije možeš zvati bilo gde
- **Jednostavno** - Komponenta ne zna za URL-ove
- **Lako se održava** - Ako se promeni URL, menjaš samo u servisu
- **Testabilno** - Lako testirate funkcije odvojeno

---

## 7. Više instanci (naprednije)

Možeš imati VIŠE instanci za različite API-je:

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

Koristi se kada imaš:
- API za backend
- API za upload fajlova
- Eksterni API (Google Maps, Weather API...)

---

## 8. Best Practices - Rezime

### Uvek koristi servise
**Nemoj** direktno `axios.post()` u komponentama.
**Pravi** funkcije u servisima.

### Interceptori rade sve automatski
Token, error handling, refresh token - sve automatski!

### Centralizuj konfiguraciju
baseURL, timeout, headers - sve na jednom mestu.

### Organizuj po resursima
authService, userService, postService...

### Loguj zahteve (u razvoju)
Otvori Console (F12) i vidi šta se dešava!

---

## ZAKLJUČAK

### Axios nije samo biblioteka za HTTP zahteve.
### Axios je **centralizovani sloj za kontrolu API komunikacije**.

### Cilj:
- Manje dupliranja koda
- Bolji tok podataka
- Bolji error handling
- Maksimalna kontrola iz jednog mesta

---

## Kako koristiti ovaj projekat?

1. **Pokreni server:**
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Pokreni client:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Otvori browser:**
   - `http://localhost:5173`
   - Tab "Informacije" - detaljna uputstva
   - **OBAVEZNO otvori Console (F12)** - vidi logove!

4. **Testiraj:**
   - Login primer
   - User Profile primer
   - Vidi kako radi automatski refresh token!

---

## Fajlovi za čitanje:

1. **`client/src/api/axios.js`** - Instanca i interceptori
2. **`client/src/api/services/authService.js`** - Primer servisa
3. **`client/src/components/LoginExample.jsx`** - Primer komponente
4. **`client/src/api/README.md`** - DETALJNO objašnjenje

---
