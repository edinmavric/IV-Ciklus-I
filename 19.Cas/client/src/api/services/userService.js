import api from "../axios";

/**
 * ═══════════════════════════════════════════════════════════════════
 * USER SERVICE - SERVIS ZA OPERACIJE SA KORISNICIMA
 * ═══════════════════════════════════════════════════════════════════
 *
 * Šta je ovo?
 * -----------
 * Servis koji sadrži sve API pozive za rad sa korisnicima (User CRUD).
 *
 * Zašto odvojen servis za usere?
 * -------------------------------
 * Svaki resurs (users, posts, comments...) ima svoj servis.
 * Ovo drži kod ORGANIZOVANIM i LAKO ODRŽIVIM.
 *
 * authService.js  → sve za auth (login, register, logout, refresh)
 * userService.js  → sve za usere (get, update, delete...)
 * postService.js  → sve za postove (ako ih imaš)
 * ...
 */

// ═══════════════════════════════════════════════════════════════════
// GET USER BY ID - Uzmi jednog korisnika po ID-u
// ═══════════════════════════════════════════════════════════════════

/**
 * Uzima podatke o jednom korisniku
 *
 * VAŽNO:
 * - Zahteva autentikaciju (token se automatski dodaje u axios.js interceptoru)
 * - Možeš videti samo SEBE ili SVE ako si ADMIN
 *
 * Primer poziva iz komponente:
 * -----------------------------
 * import { getUserById } from './api/services/userService';
 *
 * const fetchUser = async (userId) => {
 *   try {
 *     const response = await getUserById(userId);
 *     console.log('Korisnik:', response.data);
 *     setUser(response.data);
 *   } catch (error) {
 *     if (error.response?.status === 403) {
 *       console.error('Nemaš pristup tuđem profilu!');
 *     } else if (error.response?.status === 404) {
 *       console.error('Korisnik ne postoji!');
 *     }
 *   }
 * };
 */
export const getUserById = (userId) => {
  // api.get() automatski:
  // - dodaje baseURL (http://localhost:3000)
  // - dodaje Authorization header sa tokenom (iz localStorage-a)
  // - prolazi kroz request interceptor (logovanje)
  // - prolazi kroz response interceptor (error handling, refresh token)
  return api.get(`/users/${userId}`);
};

// ═══════════════════════════════════════════════════════════════════
// DELETE USER - Obriši korisnika (samo admin)
// ═══════════════════════════════════════════════════════════════════

/**
 * Briše korisnika iz baze (SAMO ADMIN može ovo!)
 *
 * VAŽNO:
 * - Zahteva autentikaciju + autorizaciju (role: 'admin')
 * - Server proverava u authorize middleware-u da li si admin
 * - Ako nisi admin, dobijaš 403 Forbidden
 *
 * Primer poziva iz komponente:
 * -----------------------------
 * import { deleteUser } from './api/services/userService';
 *
 * const handleDelete = async (userId) => {
 *   if (!window.confirm('Da li si siguran?')) return;
 *
 *   try {
 *     const response = await deleteUser(userId);
 *     console.log(response.data.message); // "Korisnik obrisan."
 *     // Refresh listu korisnika...
 *   } catch (error) {
 *     if (error.response?.status === 403) {
 *       alert('Samo admin može brisati korisnike!');
 *     } else if (error.response?.status === 404) {
 *       alert('Korisnik ne postoji!');
 *     }
 *   }
 * };
 */
export const deleteUser = (userId) => {
  return api.delete(`/users/${userId}`);
};

// ═══════════════════════════════════════════════════════════════════
// PRIMER: Kako bi dodao UPDATE USER funkciju (ako ti zatreba)
// ═══════════════════════════════════════════════════════════════════

/**
 * Ažurira podatke o korisniku
 *
 * VAŽNO:
 * - Zahteva autentikaciju
 * - Možeš azurirati samo SEBE ili sve ako si ADMIN
 * - Ne može se menjati password ovim endpoint-om
 * - Samo admin može menjati role
 *
 * Primer poziva:
 * --------------
 * try {
 *   const response = await updateUser('123', { name: 'Marko Marković', email: 'novo@mail.com' });
 *   console.log(response.data.message); // "Korisnik uspešno azuriran."
 *   console.log(response.data.user);    // Azurirani user podaci
 * } catch (error) {
 *   if (error.response?.status === 403) {
 *     alert('Nemaš dozvolu da menjaš tuđe podatke!');
 *   }
 * }
 */
export const updateUser = (userId, updateData) => {
  return api.put(`/users/${userId}`, updateData);
};

// ═══════════════════════════════════════════════════════════════════
// PRIMER: GET ALL USERS (ako bi dodao endpoint na serveru)
// ═══════════════════════════════════════════════════════════════════

/**
 * Uzima sve korisnike (samo admin)
 *
 * VAŽNO:
 * - Zahteva autentikaciju + autorizaciju (role: 'admin')
 * - Server vraća niz korisnika bez password i refreshToken polja
 *
 * Primer poziva:
 * --------------
 * const response = await getAllUsers();
 * console.log('Broj korisnika:', response.data.count);
 * setUsers(response.data.users);
 */
export const getAllUsers = () => {
  return api.get("/users");
};

// ═══════════════════════════════════════════════════════════════════
// PRIMER KORIŠĆENJA U REACT KOMPONENTI
// ═══════════════════════════════════════════════════════════════════

/**
 * import { getUserById, deleteUser } from './api/services/userService';
 * import { useState, useEffect } from 'react';
 *
 * function UserProfile({ userId }) {
 *   const [user, setUser] = useState(null);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState('');
 *
 *   // Učitaj korisnika kad se komponenta mountuje
 *   useEffect(() => {
 *     const fetchUser = async () => {
 *       try {
 *         const response = await getUserById(userId);
 *         setUser(response.data);
 *       } catch (err) {
 *         setError(err.response?.data?.message || 'Greška pri učitavanju');
 *       } finally {
 *         setLoading(false);
 *       }
 *     };
 *
 *     fetchUser();
 *   }, [userId]);
 *
 *   const handleDelete = async () => {
 *     if (!window.confirm('Da li si siguran?')) return;
 *
 *     try {
 *       await deleteUser(userId);
 *       alert('Korisnik obrisan!');
 *       // Redirektuj ili osvježi listu...
 *     } catch (err) {
 *       alert(err.response?.data?.message || 'Greška pri brisanju');
 *     }
 *   };
 *
 *   if (loading) return <p>Učitavanje...</p>;
 *   if (error) return <p style={{ color: 'red' }}>{error}</p>;
 *
 *   return (
 *     <div>
 *       <h2>{user.name}</h2>
 *       <p>Email: {user.email}</p>
 *       <p>Uloga: {user.role}</p>
 *       <button onClick={handleDelete}>Obriši korisnika</button>
 *     </div>
 *   );
 * }
 *
 * PREDNOSTI:
 * ----------
 * Jednostavan kod u komponenti
 * API pozivi centralizovani u servisima
 * Error handling je automatski (interceptori)
 * Token se automatski dodaje (interceptori)
 * Refresh token flow automatski (interceptori)
 * Lako testiranje servisa odvojeno od komponenti
 */

// ═══════════════════════════════════════════════════════════════════
// NAPREDNIJE: CANCEL TOKEN (Abort Controller)
// ═══════════════════════════════════════════════════════════════════

/**
 * Axios podržava AbortController za otkazivanje zahteva.
 * Ovo je korisno kada:
 * - User ukuca u search polje (otkazuješ stare zahteve)
 * - Komponenta se unmount-uje pre nego što se završi zahtev
 *
 * Primer:
 * -------
 * import { getUserById } from './api/services/userService';
 * import { useEffect } from 'react';
 *
 * function UserProfile({ userId }) {
 *   useEffect(() => {
 *     const controller = new AbortController();
 *
 *     const fetchUser = async () => {
 *       try {
 *         const response = await getUserById(userId, controller.signal);
 *         setUser(response.data);
 *       } catch (err) {
 *         if (err.name === 'CanceledError') {
 *           console.log('Zahtev otkazan');
 *         }
 *       }
 *     };
 *
 *     fetchUser();
 *
 *     // Cleanup: otkaži zahtev ako se komponenta unmount-uje
 *     return () => controller.abort();
 *   }, [userId]);
 * }
 *
 * Da bi ovo radilo, dodaj `signal` parametar u servisu:
 *
 * export const getUserById = (userId, signal) => {
 *   return api.get(`/users/${userId}`, { signal });
 * };
 */
