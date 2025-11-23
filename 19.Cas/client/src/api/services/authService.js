import api from "../axios";

/**
 * ═══════════════════════════════════════════════════════════════════
 * AUTH SERVICE - SERVIS ZA AUTENTIKACIJU
 * ═══════════════════════════════════════════════════════════════════
 *
 * Šta je ovo?
 * -----------
 * Ovo je SLOJ između React komponenti i API-ja.
 * Umesto da u React komponentama direktno zoveš api.post('/auth/login'),
 * praviš FUNKCIJE koje to rade za tebe.
 *
 * Zašto?
 * ------
 * ORGANIZACIJA - Sve API pozive za auth imaš na jednom mestu
 * REUSABILITY - Možeš pozvati login() iz bilo koje komponente
 * JEDNOSTAVNOST - Komponenta ne zna za URL, samo zove login(email, password)
 * ODRŽAVANJE - Ako se promeni URL, menjaš samo ovde
 * TESTIRANJE - Lako testirate funkcije odvojeno od komponenti
 *
 * Profesionalna struktura projekta:
 * ----------------------------------
 * 📁 src/
 *   📁 api/
 *     📄 axios.js            ← instanca sa interceptorima
 *     📁 services/
 *       📄 authService.js    ← funkcije za auth
 *       📄 userService.js    ← funkcije za user CRUD
 *       📄 postService.js    ← funkcije za posts (ako ih imaš)
 *       ...
 *
 * Ovako VELIKA kompanija organizuje kod!
 */

// ═══════════════════════════════════════════════════════════════════
// REGISTER - Registracija novog korisnika
// ═══════════════════════════════════════════════════════════════════

/**
 * Registruje novog korisnika
 *
 * Primer poziva iz komponente:
 * -----------------------------
 * import { register } from './api/services/authService';
 *
 * const handleRegister = async () => {
 *   try {
 *     const response = await register({ name, email, password });
 *     console.log('Uspešna registracija:', response.data);
 *   } catch (error) {
 *     console.error('Greška:', error.response?.data?.message);
 *   }
 * };
 */
export const register = (userData) => {
  // api je importovana instanca iz axios.js
  // Automatski dodaje: baseURL + interceptore + token (ako postoji)
  return api.post("/auth/register", userData);
};

// ═══════════════════════════════════════════════════════════════════
// LOGIN - Prijavljivanje korisnika
// ═══════════════════════════════════════════════════════════════════

/**
 * Prijavljuje korisnika
 *
 * Primer poziva iz komponente:
 * -----------------------------
 * import { login } from './api/services/authService';
 *
 * const handleLogin = async () => {
 *   try {
 *     const response = await login(email, password);
 *
 *     // Sačuvaj tokene i user podatke
 *     localStorage.setItem('accessToken', response.data.accessToken);
 *     localStorage.setItem('refreshToken', response.data.refreshToken);
 *     localStorage.setItem('user', JSON.stringify(response.data.user));
 *
 *     console.log('Uspešan login:', response.data.user);
 *   } catch (error) {
 *     console.error('Greška:', error.response?.data?.message);
 *   }
 * };
 */
export const login = (email, password) => {
  return api.post("/auth/login", { email, password });
};

// ═══════════════════════════════════════════════════════════════════
// LOGOUT - Odjavljivanje korisnika
// ═══════════════════════════════════════════════════════════════════

/**
 * Odjavljuje korisnika
 *
 * Primer poziva iz komponente:
 * -----------------------------
 * import { logout } from './api/services/authService';
 *
 * const handleLogout = async () => {
 *   try {
 *     const user = JSON.parse(localStorage.getItem('user'));
 *     await logout(user.email);
 *
 *     // Obriši tokene iz localStorage-a
 *     localStorage.removeItem('accessToken');
 *     localStorage.removeItem('refreshToken');
 *     localStorage.removeItem('user');
 *
 *     console.log('Uspešan logout');
 *   } catch (error) {
 *     console.error('Greška pri logootu:', error);
 *   }
 * };
 */
export const logout = (email) => {
  return api.post("/auth/logout", { email });
};

// ═══════════════════════════════════════════════════════════════════
// REFRESH TOKEN - Osvežavanje access tokena
// ═══════════════════════════════════════════════════════════════════

/**
 * Osvežava access token pomoću refresh tokena
 *
 * NAPOMENA: Ovu funkciju NE TREBA ručno pozivati iz komponenti!
 * Axios response interceptor automatski poziva refresh kada dobije 401.
 * Ova funkcija je ovde samo za slučaj da ti zatreba manuelni refresh.
 *
 * Ovu funkciju koristi AXIOS INTERCEPTOR automatski!
 * ---------------------------------------------------
 * Pogledaj axios.js, linija ~170
 */
export const refreshAccessToken = (refreshToken) => {
  // BITNO: Ovde ne koristimo `api` instancu, već direktno axios,
  // jer ne želimo da prolazi kroz interceptore (da ne bi ušli u beskonačnu petlju)
  // Ali u interceptoru već koristimo axios.post direktno, tako da je ovo
  // više za manuelno pozivanje ako bude trebalo
  return api.post("/auth/refresh", { token: refreshToken });
};

// ═══════════════════════════════════════════════════════════════════
// PRIMER KORIŠĆENJA U REACT KOMPONENTI
// ═══════════════════════════════════════════════════════════════════

/**
 * import { login, register, logout } from './api/services/authService';
 * import { useState } from 'react';
 *
 * function LoginPage() {
 *   const [email, setEmail] = useState('');
 *   const [password, setPassword] = useState('');
 *   const [error, setError] = useState('');
 *
 *   const handleLogin = async (e) => {
 *     e.preventDefault();
 *     setError('');
 *
 *     try {
 *       // 1. Pozovi login funkciju
 *       const response = await login(email, password);
 *
 *       // 2. Sačuvaj tokene
 *       localStorage.setItem('accessToken', response.data.accessToken);
 *       localStorage.setItem('refreshToken', response.data.refreshToken);
 *       localStorage.setItem('user', JSON.stringify(response.data.user));
 *
 *       // 3. Redirektuj user-a
 *       window.location.href = '/dashboard';
 *
 *     } catch (err) {
 *       // 4. Prikaži grešku
 *       setError(err.response?.data?.message || 'Greška pri logovanju');
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleLogin}>
 *       <input
 *         type="email"
 *         value={email}
 *         onChange={(e) => setEmail(e.target.value)}
 *         placeholder="Email"
 *       />
 *       <input
 *         type="password"
 *         value={password}
 *         onChange={(e) => setPassword(e.target.value)}
 *         placeholder="Password"
 *       />
 *       <button type="submit">Login</button>
 *       {error && <p style={{ color: 'red' }}>{error}</p>}
 *     </form>
 *   );
 * }
 *
 * PREDNOSTI OVOG PRISTUPA:
 * -------------------------
 * Komponenta je ČISTA - samo UI logika
 * API pozivi su ODVOJENI - lako se testiraju
 * Kod je REUSABLE - login() možeš pozvati bilo gde
 * Error handling je JEDNOSTAVAN - axios automatski hvata greške
 * Token se automatski dodaje za OSTALE pozive (hvala interceptorima!)
 */
