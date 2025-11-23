# Testiranje Endpoints - Brzi Vodič

## Priprema

1. Pokreni server:
```bash
cd server
npm start
```

2. Pokreni client:
```bash
cd client
npm run dev
```

3. Otvori browser na http://localhost:5173

---

## Scenario 1: Testiranje Login-a i User Profila

### Korak 1: Registruj korisnika (preko Postman-a ili cURL)

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marko Markovic",
    "email": "marko@mail.com",
    "password": "password123"
  }'
```

### Korak 2: Login preko client aplikacije

1. Otvori http://localhost:5173
2. Idi na tab "Login Primer"
3. Unesi:
   - Email: marko@mail.com
   - Password: password123
4. Klikni "Prijavi se"
5. Otvori Console (F12) i vidi logove
6. Provjeri localStorage - trebalo bi da vidiš:
   - accessToken
   - refreshToken
   - user

### Korak 3: Ucitaj profil

1. Kopiraj svoj User ID iz konzole (ili iz localStorage -> user -> id)
2. Idi na tab "User Profile Primer"
3. Unesi User ID
4. Klikni "Učitaj korisnika"
5. Vidi podatke o korisniku

---

## Scenario 2: Testiranje UPDATE endpoint-a

### Preko browser console-a:

```javascript
// 1. Otvori Console (F12)
// 2. Importuj servis (već je dostupan u React aplikaciji)

// 3. Uzmi user ID iz localStorage
const user = JSON.parse(localStorage.getItem('user'));
const userId = user.id;

// 4. Azuriraj ime
import { updateUser } from './api/services/userService';

updateUser(userId, { name: 'Novo Ime' })
  .then(response => {
    console.log('Uspešno:', response.data);
  })
  .catch(error => {
    console.error('Greška:', error.response?.data);
  });
```

### Preko Postman-a:

1. Uzmi accessToken iz localStorage
2. POST request:

```
PUT http://localhost:3000/users/<user_id>
Headers:
  Authorization: Bearer <access_token>
  Content-Type: application/json
Body:
{
  "name": "Novo Ime",
  "email": "novi@mail.com"
}
```

---

## Scenario 3: Testiranje GET ALL USERS (samo admin)

### Napravi admin korisnika:

1. Manuelno u MongoDB Compass ili mongosh:

```javascript
db.users.updateOne(
  { email: "marko@mail.com" },
  { $set: { role: "admin" } }
)
```

2. Login ponovo da dobiješ novi token sa admin role-om

### Testiranje preko browser console-a:

```javascript
import { getAllUsers } from './api/services/userService';

getAllUsers()
  .then(response => {
    console.log('Broj korisnika:', response.data.count);
    console.log('Korisnici:', response.data.users);
  })
  .catch(error => {
    console.error('Greška:', error.response?.data);
  });
```

### Testiranje preko Postman-a:

```
GET http://localhost:3000/users
Headers:
  Authorization: Bearer <admin_access_token>
```

---

## Scenario 4: Testiranje DELETE endpoint-a (samo admin)

### UPOZORENJE: Ovo će trajno obrisati korisnika!

### Preko browser console-a:

```javascript
import { deleteUser } from './api/services/userService';

const userIdToDelete = '...'; // ID korisnika kojeg želiš obrisati

deleteUser(userIdToDelete)
  .then(response => {
    console.log(response.data.message); // "Korisnik obrisan."
  })
  .catch(error => {
    console.error('Greška:', error.response?.data);
  });
```

### Preko Postman-a:

```
DELETE http://localhost:3000/users/<user_id>
Headers:
  Authorization: Bearer <admin_access_token>
```

---

## Scenario 5: Testiranje Refresh Token Flow

### Simulacija isteka access token-a:

1. Otvori axios.js
2. Privremeno dodaj timeout od 5 sekundi za access token:

```javascript
// U interceptoru, dodaj privremeni kod:
const accessToken = generateAccessToken(user); // exp: 5s umesto 15m
```

3. Login
4. Sacekaj 6 sekundi
5. Pokusaj da učitaš profil
6. Axios će automatski:
   - Dobiti 401 error
   - Pozvati /auth/refresh sa refresh token-om
   - Dobiti novi access token
   - Ponoviti originalni zahtev
7. Vidi Console logove - trebalo bi da vidiš:
   - "[401] Access token istekao, pokušavam refresh..."
   - "Token osvežen, ponavljam originalni zahtev..."

---

## Scenario 6: Testiranje Error Handling-a

### 403 Forbidden - Pokušaj da pristupiš tuđem profilu

1. Login kao obican user (ne admin)
2. Pokušaj da učitaš profil drugog user-a:

```javascript
getUserById('neki_drugi_user_id')
  .then(response => console.log(response.data))
  .catch(error => {
    console.log(error.response?.status); // 403
    console.log(error.response?.data.message); // "Nemaš pristup tuđem profilu."
  });
```

### 404 Not Found - Nepostojeći user

```javascript
getUserById('507f1f77bcf86cd799439999') // Fake ID
  .then(response => console.log(response.data))
  .catch(error => {
    console.log(error.response?.status); // 404
    console.log(error.response?.data.message); // "Korisnik nije pronađen."
  });
```

### 401 Unauthorized - Nema tokena

```javascript
// Obriši token
localStorage.removeItem('accessToken');

// Pokušaj da učitaš profil
getUserById('...')
  .catch(error => {
    console.log(error.response?.status); // 401
  });
```

---

## Korisni Command-ovi

### Provera tokena (JWT Decode)

Idi na https://jwt.io i kopiraj svoj access token da vidiš sadržaj:

```json
{
  "id": "...",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Provera localStorage-a (Browser Console)

```javascript
// Vidi sve
console.log(localStorage);

// Vidi access token
console.log(localStorage.getItem('accessToken'));

// Vidi user podatke
console.log(JSON.parse(localStorage.getItem('user')));

// Obriši sve
localStorage.clear();
```

### Provera Network Tab-a

1. Otvori Network tab (F12)
2. Filtriraj: XHR ili Fetch
3. Klikni na request da vidiš:
   - Headers (Authorization: Bearer ...)
   - Request Payload
   - Response

---

## Cesta Greška i Rešenja

### Greška: "Cannot read property 'id' of null"

Rešenje: Nisi ulogovan. Login prvo.

### Greška: 403 Forbidden na /users

Rešenje: Nisi admin. Promeni role u bazi na "admin".

### Greška: 401 Unauthorized

Rešenje: Token je istekao ili nevažeći. Login ponovo.

### Greška: CORS error

Rešenje: Proveri da li server radi i da li ima cors() middleware.

### Greška: "Cannot connect to server"

Rešenje: Proveri da li server radi na http://localhost:3000

---
