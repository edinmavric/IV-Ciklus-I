# Blog Platforma - Domaći Zadatak

## Cilj Projekta

Studenti trebaju da izrade **mini blog platformu** sa sledećim funkcionalnostima:

### Neregistrovani Korisnici

- Mogu videti sve blog postove

### Registrovani Korisnici

- Mogu objaviti novi blog post
- Mogu izmeniti sopstvene postove
- Mogu obrisati sopstvene postove

### Admin Korisnici

- Mogu obrisati bilo koji blog post
- Mogu videti listu svih korisnika

---

## Tehnologije

### Backend

- **Node.js + Express** - Web framework
- **MongoDB + Mongoose** - Database
- **JWT (JSON Web Token)** - Autentifikacija
- **Bcrypt** - Heširanje lozinki
- **Middleware** - Autorizacija po rolama (user, admin)

### Frontend

- **React + Vite** - Frontend framework
- **React Router** - Rutiranje između stranica
- **Context API/Zustand** - State management za autentifikaciju
- **Fetch/Axios** - API komunikacija
- **CSS/Tailwind** - Stilovanje

---

## Funkcionalni Zahtevi

### Autentifikacija

#### Backend Rute

```
POST   /api/auth/register     - Registracija novog korisnika
POST   /api/auth/login        - Login korisnika (vraća JWT)
GET    /api/auth/me           - Informacije o trenutnom korisniku
POST   /api/auth/logout       - Logout (opciono)
```

#### Frontend

- **Register stranica** - Forma za registraciju
- **Login stranica** - Forma za prijavu
- **Auth Context** - Čuva token i podatke o korisniku
- **localStorage** - Perzistencija tokena

---

### Blog Posts - CRUD Operacije

#### Backend Rute

```
GET    /api/posts             - Prikaz svih postova (public)
POST   /api/posts             - Kreiranje novog posta (auth required)
GET    /api/posts/:id         - Prikaz jednog posta
PUT    /api/posts/:id         - Ažuriranje posta (samo vlasnik)
DELETE /api/posts/:id         - Brisanje posta (vlasnik ili admin)
```

#### Frontend Stranice

- **Home** - Listanje svih postova sa PostCard komponentama
- **SinglePost** - Prikaz detaljnog posta
- **NewPost** - Forma za kreiranje novog posta
- **EditPost** - Forma za ažuriranje posta

---

### User Role System

#### User Model

```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hešovana),
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  createdAt: Date
}
```

#### Admin Privilegije

- Može obrisati bilo koji post
- Može videti listu svih korisnika (GET /api/users)
- Može promeniti role korisnika (opciono)

---

## Struktura Projekta

### Backend

```
backend/
├── server.js                 # Entry point
├── package.json
├── .env                      # Environment varijable
├── config/
│   └── db.js                # MongoDB konekcija
├── models/
│   ├── User.js              # User schema
│   └── Post.js              # Post schema
├── routes/
│   ├── auth.js              # Autentifikacijske rute
│   ├── posts.js             # Blog post rute
│   └── users.js             # User management rute
└── middleware/
    └── authMiddleware.js    # JWT validacija i autorizacija
```

### Frontend

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx            # Entry point
│   ├── App.jsx             # Glavna komponenta sa rutama
│   ├── pages/
│   │   ├── Login.jsx       # Login stranica
│   │   ├── Register.jsx    # Register stranica
│   │   ├── Home.jsx        # Prikaz svih postova
│   │   ├── SinglePost.jsx  # Detalj jednog posta
│   │   ├── NewPost.jsx     # Forma za novi post
│   │   └── EditPost.jsx    # Forma za ažuriranje posta
│   ├── components/
│   │   ├── Navbar.jsx      # Navigacijska komponenta
│   │   ├── PostCard.jsx    # Komponenta za prikaz posta u listi
│   │   └── PrivateRoute.jsx # Zaštita ruta (auth required)
│   ├── context/
│   │   └── AuthContext.jsx # Auth state management
│   └── styles/
│       └── index.css       # Globalni stilovi
```

---

## Implementacijski Zahtevi

### Backend

#### Database Models

- [ ] User model sa svim poljima
- [ ] Post model sa referencom na User
- [ ] Mongoose validacije

#### Authentication

- [ ] JWT token generisanje
- [ ] Bcrypt heširanje lozinki
- [ ] Refresh token logika (opciono)

#### Middleware

- [ ] `authMiddleware.js` za JWT validaciju
- [ ] `roleMiddleware.js` za proveru admin uloge
- [ ] Error handling middleware

#### Controllers/Routes

- [ ] Auth rute (register, login, me)
- [ ] Post CRUD rute
- [ ] User listing ruta (admin samo)

### Frontend

#### Komponente

- [ ] Navbar sa login/logout dugmadima
- [ ] PostCard komponenta
- [ ] PrivateRoute komponenta

#### Stranice

- [ ] Login i Register stranica
- [ ] Home sa listanjem postova
- [ ] SinglePost stranica
- [ ] NewPost forma
- [ ] EditPost forma

#### Context/State

- [ ] AuthContext sa logikom
- [ ] Custom useAuth hook

---

## Bonus Zadaci

### 1. Pagination

- Dodati paginaciju na /api/posts ruti
- Frontend trebao bi da prikaže stranicu po stranicu

### 2. Like/Dislike Sistem

- Dodati likes polje na Post model
- Ruta za dodavanje/uklanjanja lajka: `POST /api/posts/:id/like`

### 3. Komentari

- Dodati Comments model sa referencom na Post i User
- CRUD rute za komentare
- Prikaz komentara na SinglePost stranici

### 4. Dark/Light Theme

- Context za theme
- CSS varijable ili Tailwind classes
- Toggle dugme u Navbar-u

### 5. Global Error Handler

- Centralizovani error handling u Express-u
- Konzistentni error odgovori
- Proper HTTP status kodovi

### 6. Input Validacija

- Frontend validacija pre nego što se pošalje zahtev
- Backend validacija sa detaljnim error porukama

### 7. Loading States

- Prikaz loading spinner-a tokom fetch zahteva
- Disable dugmadi tokom submission-a

---

## Napomene

1. **Sigurnost**

   - Nikada ne čuvati lozinku u plain text-u
   - JWT tokeni trebali bi da imaju expiration
   - CORS pravilno konfigurirati
   - Environment varijable za sensitive podatke

2. **Best Practices**

   - Koristiti `async/await` za sve async operacije
   - Proper error handling svuda
   - Validacija svih input podataka
   - Clean code i konzistentno formatiranje

3. **Testing**

   - Testirati sve rute sa Postman-om ili sličnim alatom
   - Testirati edge case-ove (duplikat email, nepostojeći id, itd.)

4. **Dokumentacija**
   - Dokumentovati sve API endpoint-e
   - Opisati kako setovati environment varijable
   - Upustva za pokretanje projekta

---

## Checklist za Submission

- [ ] Backend server pokrenuta bez greške
- [ ] Frontend Vite dev server pokrenuta bez greške
- [ ] Sve funkcionalnosti iz zahteva implementirane
- [ ] Error handling za sve slučajeve
- [ ] Code je čitljiv i dokumentovan
- [ ] Minimalno 2-3 bonus zadatka implementirano
- [ ] Projekat radi na svim modernim browserima

---

## Učenje

Kroz ovaj projekat naučićete:

Full-stack razvoj (Frontend + Backend)
REST API dizajn
Autentifikacija i autorizacija
Database design i relacije
React hooks i Context API
JWT tokeni
Security best practices
Error handling
Async JavaScript

---

## Trebanja Pomoć?

Ako imate pitanja ili nailazite na probleme:

1. Čitajte error poruke pažljivo
2. Koristite browser DevTools (Console tab)
3. Koristite Postman da testirate backend rute
4. Kontaktirajte instruktora

---
