### Zadatak
# Server 1 – Rad sa os modulom, ima 3 rute:

- / → vraća plain text: "Dobrodošli na Server 1!"

- /data → vraća sadržaj iz data.js fajla kao JSON (npr. niz korisnika)

- /info → koristi os modul i vraća trenutno slobodnu memoriju (os.freemem())

# Server 2 – Rad sa path modulom, ima 3 rute:

- / → vraća plain text "Dobrodošli na Server 2!"

- /data → vraća sadržaj iz data.js fajla kao JSON (npr. niz knjiga)

- /path → koristi path modul da vrati apsolutnu putanju do data.js fajla (path.join(\_\_dirname, "data.js"))

- # koristi writeHead() sa ispravnim Content-Type
- # sve modularno – logika ruta u posebnom routes.js

# Server 3 – Rad sa fs modulom, ima 3 rute:

- / → vraća plain text "Dobrodošli na Server 3!"

- /data → vraća sadržaj iz data.js fajla kao JSON (npr. niz proizvoda)

- /save → koristi fs.appendFileSync() da zapiše u log.txt:
  "Korisnik prvi put pristupio /data u 14:25:31"
  (zapiši vreme kad je korisnik otvorio /data)

- # koristi writeHead() sa ispravnim Content-Type
- # sve modularno – logika ruta u posebnom routes.js

# Zajednički zahtev za sva tri servera:

- svaki ima 404 rutu ako adresa ne postoji:
`res.writeHead(404, { "Content-Type": "text/plain" });`
`res.end("Stranica ne postoji.");`

- koristi writeHead() sa ispravnim Content-Type
- sve modularno – logika ruta u posebnom routes.js

# Svaki server koristi drugi port

- Server 1 → port 3000

- Server 2 → port 4000

- Server 3 → port 5000

# Napomena:

- U svakom server.js importovati routes.js i koristiti createServer(routes.handleRequest)

- U data.js može biti bilo šta – studenti sami biraju podatke (niz korisnika, knjiga, proizvoda itd.)

- Svi odgovori moraju imati ispravan Content-Type (text/plain ili application/json)

# BONUS:

- U trećem serveru (fs), ako log.txt ne postoji — automatski ga napravi kada korisnik prvi put otvori /data.

# Šta se proverava:

- modularna organizacija (server.js, routes.js, data.js)

- pravilna upotreba http, fs, path, os

- upotreba writeHead() sa Content-Type

- ispravno rukovanje rutama i greškama (404)

- čitljiv, uredan kod i komentari
