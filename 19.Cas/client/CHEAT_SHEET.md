# Axios - Brzi Vodič (Cheat Sheet)

## Osnovni Setup

### 1. Instalacija
```bash
npm install axios
```

### 2. Kreiranje instance
```javascript
// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export default api;
```

---

## HTTP Metode

```javascript
import api from './api/axios';

// GET
api.get('/users');
api.get('/users/123');
api.get('/users', { params: { page: 1, limit: 10 } });

// POST
api.post('/auth/login', { email, password });
api.post('/users', { name, email });

// PUT (cela izmena)
api.put('/users/123', { name: 'Novo ime', email: 'novi@mail.com' });

// PATCH (parcijalna izmena)
api.patch('/users/123', { name: 'Novo ime' });

// DELETE
api.delete('/users/123');
```

---

## Request Interceptor

```javascript
// src/api/axios.js
api.interceptors.request.use(
  (config) => {
    // Dodaj token
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Loguj
    console.log(config.method.toUpperCase(), config.url);

    return config;
  },
  (error) => Promise.reject(error)
);
```

---

## Response Interceptor

```javascript
// src/api/axios.js
api.interceptors.response.use(
  (response) => {
    console.log(response.status, response.config.url);
    return response;
  },
  async (error) => {
    // 401 - Refresh token
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      const { data } = await axios.post('http://localhost:3000/auth/refresh', {
        token: refreshToken
      });

      localStorage.setItem('accessToken', data.accessToken);
      error.config.headers.Authorization = `Bearer ${data.accessToken}`;

      return api(error.config);
    }

    // 403 - Forbidden
    if (error.response?.status === 403) {
      alert('Nemaš pristup!');
    }

    // 500 - Server error
    if (error.response?.status === 500) {
      alert('Server error!');
    }

    return Promise.reject(error);
  }
);
```

---

## Servisi

### authService.js
```javascript
import api from '../axios';

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (userData) =>
  api.post('/auth/register', userData);

export const logout = (email) =>
  api.post('/auth/logout', { email });
```

### userService.js
```javascript
import api from '../axios';

export const getUserById = (userId) =>
  api.get(`/users/${userId}`);

export const deleteUser = (userId) =>
  api.delete(`/users/${userId}`);

export const updateUser = (userId, data) =>
  api.put(`/users/${userId}`, data);

export const getAllUsers = () =>
  api.get('/users');
```

---

## React Komponente

### Login primer
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
      const response = await login(email, password);

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

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

### GET podataka
```javascript
import { useState, useEffect } from 'react';
import { getUserById } from '../api/services/userService';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(userId);
        setUser(response.data);
      } catch (err) {
        setError(err.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

---

## Cancel Token (Abort)

```javascript
import { useEffect } from 'react';
import api from './api/axios';

function SearchComponent({ query }) {
  useEffect(() => {
    const controller = new AbortController();

    const search = async () => {
      try {
        const response = await api.get('/search', {
          params: { q: query },
          signal: controller.signal
        });
        setResults(response.data);
      } catch (err) {
        if (err.name === 'CanceledError') {
          console.log('Request canceled');
        }
      }
    };

    search();

    return () => controller.abort(); // Otkaži na unmount
  }, [query]);
}
```

---

## Response struktura

```javascript
{
  data: {...},           // Podaci sa servera
  status: 200,           // HTTP status kod
  statusText: 'OK',      // Status text
  headers: {...},        // Response headers
  config: {...},         // Request konfiguracija
  request: {...}         // XMLHttpRequest objekat
}
```

---

## Error struktura

```javascript
catch (error) {
  error.response         // Server odgovorio sa greškom
  error.response.status  // Status kod (404, 500...)
  error.response.data    // Data sa servera (poruka greške)

  error.request          // Zahtev poslan, ali nema odgovora

  error.message          // Poruka greške
}
```

---

## Best Practices

### UVEK koristi servise
```javascript
// Loše
await axios.post('http://localhost:3000/auth/login', {...});

// Dobro
await login(email, password);
```

### UVEK koristi try/catch
```javascript
// Loše
const response = await api.get('/users');

// Dobro
try {
  const response = await api.get('/users');
} catch (error) {
  console.error(error);
}
```

### UVEK koristi interceptore za token
```javascript
// Loše - ponavljaš svugde
api.get('/users', {
  headers: { Authorization: `Bearer ${token}` }
});

// Dobro - interceptor automatski dodaje
api.get('/users');
```

### CENTRALIZUJ konfiguraciju
```javascript
// Loše
axios.get('http://localhost:3000/users');
axios.get('http://localhost:3000/posts');

// Dobro - koristi instancu
api.get('/users');
api.get('/posts');
```

---

## FETCH vs AXIOS

| Feature | Fetch | Axios |
|---------|-------|-------|
| Error handling | Ne baca error za 404/500 | Automatski baca error |
| JSON parsing | Ručno `.json()` | Automatski |
| Instanca | Nema | Ima |
| Interceptori | Teško | Lako |
| baseURL | Ne | Da |
| Timeout | Komplikovano | Jednostavno |
| Cancel requests | AbortController | AbortController |

---

## Dodatni resursi

- [Axios Docs](https://axios-http.com/)
- [Axios GitHub](https://github.com/axios/axios)
- `src/api/README.md` - Detaljno objašnjenje

---
