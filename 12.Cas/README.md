# Domaći Zadatak

Kreirati kompletan CRUD (Create, Read, Update, Delete) sistem za sledeće modele i njihove veze:

### 1. Modeli

#### Product (Proizvod)

- name (String)
- description (String)
- price (Number)
- category (Reference ka Category)
- manufacturer (Reference ka Manufacturer)
- inStock (Boolean)
- ratings (Array of References ka Rating)

#### Category (Kategorija)

- name (String)
- description (String)
- parentCategory (Self-reference, može biti null)
- products (Array of References ka Product)

#### Manufacturer (Proizvođač)

- name (String)
- country (String)
- yearEstablished (Number)
- products (Array of References ka Product)

#### Rating (Ocena)

- score (Number, 1-5)
- comment (String)
- user (String)
- product (Reference ka Product)
- dateCreated (Date)

### 2. Potrebne Funkcionalnosti

Za svaki model implementirati standardne CRUD operacije:

- CREATE - Kreiranje novog dokumenta
- READ - Čitanje pojedinačnog i svih dokumenata
- UPDATE - Ažuriranje dokumenta - samo PUT
- DELETE - Brisanje dokumenta

### 3. Specijalni Endpointi

Implementirati sledeće specijalne endpointe:

#### Products

1. Pretraga proizvoda po opsegu cena
2. Filtriranje proizvoda po kategoriji i proizvođaču
3. Sortiranje proizvoda po ceni (rastuće/opadajuće)
4. Pronalaženje najprodavanijih proizvoda
5. Prosečna ocena za proizvod

#### Categories

1. Pronalaženje svih podkategorija za datu kategoriju
2. Pronalaženje top 3 kategorije sa najviše proizvoda
3. Hijerarhijski prikaz kategorija (parent-child struktura)

#### Manufacturers

1. Pronalaženje proizvođača sa najviše proizvoda
2. Filtriranje proizvođača po državi
3. Prosečna cena proizvoda po proizvođaču

#### Ratings

1. Prosečna ocena po proizvodu
2. Filtriranje komentara po oceni
3. Najnoviji komentari za proizvod

### 4. Bonus Zadaci

1. Implementirati paginaciju za sve GET endpointe
2. Dodati pretragu proizvoda po tekstu (full-text search)
3. Implementirati sistem za preporuke proizvoda
4. Dodati mogućnost filtriranja po više parametara odjednom
