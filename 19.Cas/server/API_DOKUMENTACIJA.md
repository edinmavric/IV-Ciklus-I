# API Dokumentacija - Server Endpoints

## Autentikacija (Authentication)

Svi zaštićeni endpoint-i zahtevaju JWT token u Authorization header-u:
```
Authorization: Bearer <access_token>
```

---

## AUTH ENDPOINTS

### 1. POST /auth/register
Registracija novog korisnika

**Body:**
```json
{
  "name": "Marko Markovic",
  "email": "marko@mail.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "Registrovan",
  "user": {
    "_id": "...",
    "name": "Marko Markovic",
    "email": "marko@mail.com",
    "role": "user"
  }
}
```

**Errors:**
- 400: Greška validacije (email već postoji, loši podaci...)

---

### 2. POST /auth/login
Prijavljivanje korisnika

**Body:**
```json
{
  "email": "marko@mail.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Ulogovan",
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": "...",
    "email": "marko@mail.com",
    "name": "Marko Markovic",
    "role": "user"
  }
}
```

**Errors:**
- 400: Email i lozinka su obavezni
- 404: Ne postoji user
- 401: Pogrešna lozinka

---

### 3. POST /auth/refresh
Osvežavanje access token-a pomoću refresh token-a

**Body:**
```json
{
  "token": "refresh_token_ovde"
}
```

**Response (200):**
```json
{
  "accessToken": "novi_access_token",
  "refreshToken": "novi_refresh_token"
}
```

**Errors:**
- 401: Nema refresh tokena
- 403: Refresh token nevažeći ili ne postoji

---

### 4. POST /auth/logout
Odjavljivanje korisnika (briše refresh token)

**Body:**
```json
{
  "email": "marko@mail.com"
}
```

**Response (200):**
```json
{
  "message": "Uspešno izlogovani."
}
```

---

## USER ENDPOINTS

### 1. GET /users
Dobavi sve korisnike (SAMO ADMIN)

**Autentikacija:** Obavezna (token)
**Autorizacija:** Admin

**Response (200):**
```json
{
  "count": 5,
  "users": [
    {
      "_id": "...",
      "name": "Marko Markovic",
      "email": "marko@mail.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    ...
  ]
}
```

**Errors:**
- 401: Nisi autentikovan (nema tokena ili token nevažeći)
- 403: Nemaš dozvolu (nisi admin)

**Napomena:** Password i refreshToken polja su automatski izuzeta iz response-a.

---

### 2. GET /users/:id
Dobavi jednog korisnika po ID-u

**Autentikacija:** Obavezna (token)
**Autorizacija:** Možeš videti samo svoj profil ili sve ako si admin

**Primer:**
```
GET /users/507f1f77bcf86cd799439011
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Marko Markovic",
  "email": "marko@mail.com",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- 401: Nisi autentikovan
- 403: Nemaš pristup tuđem profilu (ako pokušavaš da vidiš drugog user-a a nisi admin)
- 404: Korisnik nije pronađen

---

### 3. PUT /users/:id
Azuriraj podatke korisnika

**Autentikacija:** Obavezna (token)
**Autorizacija:** Možeš azurirati samo sebe ili sve ako si admin

**Primer:**
```
PUT /users/507f1f77bcf86cd799439011
```

**Body:**
```json
{
  "name": "Novo Ime",
  "email": "novi@mail.com"
}
```

**Response (200):**
```json
{
  "message": "Korisnik uspešno azuriran.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Novo Ime",
    "email": "novi@mail.com",
    "role": "user"
  }
}
```

**Napomene:**
- Ne možeš menjati password ovim endpoint-om (potreban je poseban endpoint)
- Ne možeš menjati refreshToken
- Samo admin može menjati role (ako pošalješ role a nisi admin, dobijaš 403)

**Errors:**
- 401: Nisi autentikovan
- 403: Nemaš dozvolu da menjaš tuđe podatke
- 404: Korisnik nije pronađen

---

### 4. DELETE /users/:id
Obriši korisnika (SAMO ADMIN)

**Autentikacija:** Obavezna (token)
**Autorizacija:** Admin

**Primer:**
```
DELETE /users/507f1f77bcf86cd799439011
```

**Response (200):**
```json
{
  "message": "Korisnik obrisan."
}
```

**Errors:**
- 401: Nisi autentikovan
- 403: Nemaš dozvolu (nisi admin)
- 404: Korisnik nije pronađen

---

## TESTIRANJE ENDPOINTS-A

### 1. Registracija
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marko Markovic",
    "email": "marko@mail.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marko@mail.com",
    "password": "password123"
  }'
```

Sačuvaj accessToken iz response-a!

### 3. Dobavi sve korisnike (admin)
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <access_token>"
```

### 4. Dobavi jednog korisnika
```bash
curl -X GET http://localhost:3000/users/<user_id> \
  -H "Authorization: Bearer <access_token>"
```

### 5. Azuriraj korisnika
```bash
curl -X PUT http://localhost:3000/users/<user_id> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Ime"
  }'
```

### 6. Obriši korisnika (admin)
```bash
curl -X DELETE http://localhost:3000/users/<user_id> \
  -H "Authorization: Bearer <access_token>"
```

---

## ERROR HANDLING

Svi endpoint-i koriste globalni error handler middleware koji vraća konzistentne error response-e.

**Format error response-a:**
```json
{
  "message": "Opis greške",
  "error": "Detaljnija poruka (samo u development mode-u)"
}
```

**HTTP Status Kodovi:**
- 200: OK - Uspešan zahtev
- 201: Created - Resurs kreiran (npr. registracija)
- 400: Bad Request - Loši podaci ili validaciona greška
- 401: Unauthorized - Nisi autentikovan (nema tokena ili je nevažeći)
- 403: Forbidden - Nemaš dozvolu (autentikovan si, ali nemaš pristup resursu)
- 404: Not Found - Resurs ne postoji
- 500: Internal Server Error - Greška na serveru

---

## MIDDLEWARE

### 1. auth.js
Proverava da li je korisnik autentikovan (validira JWT token).

**Korišćenje:**
```javascript
router.get('/protected', auth, async (req, res) => {
  // req.user sadrži { id, role }
});
```

### 2. authorize.js
Proverava da li korisnik ima odgovarajuću rolu.

**Korišćenje:**
```javascript
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  // Samo admin može pristupiti
});
```

### 3. errorHandler.js
Globalni error handler koji hvata sve greške i vraća konzistentne response-e.

---

## SIGURNOST

1. Password-i se hash-uju pomoću bcrypt-a pre čuvanja u bazi
2. JWT tokeni se potpisuju sa tajnim ključem (JWT_SECRET u .env)
3. Refresh tokeni omogućavaju duže sesije bez ponavljanja login-a
4. Svi zaštićeni endpoint-i zahtevaju validne tokene
5. Autorizacija na nivou rola (user, admin)
6. Password i refreshToken polja se automatski filtriraju iz response-a

---

## POVEZIVANJE SA FRONTEND-OM

Client (React + Axios) automatski:
1. Dodaje Authorization header sa tokenom (request interceptor)
2. Hvata 401 greške i pokušava refresh token (response interceptor)
3. Automatski logout ako refresh token nije uspeo
4. Parsira sve response-e kao JSON

Vidi client/src/api/axios.js za implementaciju.

---
