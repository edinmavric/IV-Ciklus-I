## Zadatak 1 — Globalni middleware: Logger + Student proveravač

Opis:

1. Napravite middleware `logger` koji ispisuje u konzolu svaki zahtev u formatu:

	 `[vreme] METODA ruta`

	 Primer:

	 `[2025-10-19T14:23:56.232Z] GET /profile`

2. Napravite middleware `studentCheck` koji proverava da li je u header-u prisutan:

	 `X-Student: VaseIme`

	 - Ako header nedostaje — vratite:

		 ```js
		 res.status(400).send('Header X-Student je obavezan!')
		 ```
	 - Ako postoji — pozovite `next()`.

3. Registrujte ova dva middleware-a globalno (redosled je bitan):

	 ```js
	 app.use(logger);
	 app.use(studentCheck);
	 ```

Napomena: logger treba da bude pre `studentCheck` kako biste videli i neuspešne zahteve u logu.

---

## Zadatak 2 — Lokalni middleware: Provera uloge korisnika

Opis:

1. Napravite middleware `checkRole` koji čita query parametar `role` i proverava vrednost `admin`.

	 - Ako je `role=admin` → pozovite `next()`.
	 - Ako nije → vratite:

		 ```js
		 res.status(403).send('Zabranjen pristup!')
		 ```

2. Kreirajte rute:

	 - `GET /dashboard` — koristi `checkRole` middleware i vraća tekst:

		 ```text
		 Dobrodošao na admin dashboard!
		 ```
	 - `GET /profile` — javna ruta bez provere, vraća:

		 ```text
		 Ovo je korisnički profil.
		 ```

3. Primeri za testiranje u pregledaču ili terminalu:

	 - `http://localhost:3000/dashboard?role=admin`  (očekivano: 200 + dashboard)
	 - `http://localhost:3000/dashboard?role=user`   (očekivano: 403)
	 - `http://localhost:3000/profile`               (očekivano: 200 + profil)

---

## Zadatak 3 — Middleware lanac (više middleware-a po ruti)

Opis:

1. Napravite rutu `GET /secret` koja koristi dva middleware-a u sledećem redosledu:

	 - `checkTime` — proverava trenutni sat (lokalno vreme servera). Dozvoljen opseg:
		 od 08:00 do 20:00 (uključivo).
		 - Ako je u opsegu → `next()`
		 - Ako nije →

			 ```js
			 res.status(403).send('Pristup moguć samo između 8h i 20h!')
			 ```

	 - `checkAuth` — proverava header `x-api-key` i očekuje vrednost `tajni123`.
		 - Ako je tačan → `next()`
		 - Ako nije →

			 ```js
			 res.status(401).send('Neautorizovan pristup!')
			 ```

2. Ako oba middleware-a prođu, ruta vraća:

	 ```js
	 res.send('Dobrodošli u tajnu sekciju!');
	 ```

3. Primer testa (fetch iz browser konzole):

	 ```js
	 fetch('/secret', {
		 headers: {
			 'x-api-key': 'tajni123',
			 'X-Student': 'Edin'
		 }
	 })
		 .then(res => res.text())
		 .then(console.log);
	 ```

---

## Zadatak 4 — Globalni 404 middleware

Opis:

1. Nakon svih ruta dodajte globalni 404 middleware koji vraća HTML poruku:

	 ```js
	 res.status(404).send('<h2>404 - Stranica nije pronađena</h2>');
	 ```

2. Testirajte pristupom nepostojeće rute (npr. `/nepostoji`).

---

---

## Zadatak 5 — Validacija podataka u POST ruti

Opis:

1. Napravite rutu `POST /register` koja prima JSON telo sa sledećim poljima:

	 ```json
	 {
		 "username": "string",
		 "email": "string",
		 "password": "string"
	 }
	 ```

2. Napravite middleware `validateRegister` koji proverava:

	 - `username` mora biti duži od 3 karaktera
	 - `email` mora sadržati znak `@`
	 - `password` mora biti duži od 5 karaktera

	 Ako neka provera ne prođe, vratite:

	 ```js
	 res.status(400).json({ error: 'Podaci nisu validni!' });
	 ```

	 Ako prođe — pozovite `next()`.

3. Ako je validacija uspešna, ruta `POST /register` može vratiti:

	 ```js
	 res.json({ message: 'Uspešno registrovan korisnik!' });
	 ```

4. Primer testa (fetch iz browser konzole):

	 ```js
	 fetch('/register', {
		 method: 'POST',
		 headers: {
			 'Content-Type': 'application/json',
			 'X-Student': 'Edin'
		 },
		 body: JSON.stringify({
			 username: 'EdinM',
			 email: 'edin@example.com',
			 password: '123456'
		 })
	 })
		 .then(res => res.json())
		 .then(console.log);
	 ```

Napomena: ovaj middleware se registruje lokalno samo za `POST /register`.

---

## Zadatak 6 — Rute sa različitim nivoima pristupa

Opis:

1. Napravite dve rute:

	 - `GET /public-info` — javna ruta, dostupna svima. Primer odgovora:

		 ```text
		 Ovo je javna informacija.
		 ```

	 - `GET /vip-info` — koristi middleware `checkVip` koji proverava query parametar `vip`.
		 - Ako `vip=true` → `next()`
		 - Ako nije →

			 ```js
			 res.status(403).send('Pristup VIP informacijama zabranjen!')
			 ```

2. Dodajte globalni `logger` middleware (ako već nije dodat) kako bi bilo vidljivo ko pristupa rutama.

3. Test primeri:

	 - `/public-info` → uvek dostupno
	 - `/vip-info?vip=true` → dozvoljen pristup
	 - `/vip-info` ili `/vip-info?vip=false` → 403

Napomena: ovaj zadatak vežba kombinaciju javne rute, privatnog middleware-a i upotrebu query parametara za kontrolu pristupa.

## BONUS — Middleware timer (opciono)

1. Napišite middleware `timer` koji meri vreme obrade svakog zahteva (u milisekundama) i ispisuje:

	 ```text
	 Zahtev GET /data obrađen za 12ms
	 ```

2. Registrujte `timer` globalno, ali nakon `logger` (tako da je logiranje prvo).

3. Primer POST zahteva (fetch):

	 ```js
	 fetch('/data', {
		 method: 'POST',
		 headers: {
			 'Content-Type': 'application/json',
			 'X-Student': 'Edin'
		 },
		 body: JSON.stringify({ name: 'Edin', age: 23 })
	 })
		 .then(res => res.json())
		 .then(console.log);
	 ```

---
