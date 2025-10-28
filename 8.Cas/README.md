------------------------------------------------------------------------

## Zadatak 1 --- Kreiranje modela

1.  Napravi novi fajl `models/Book.js`
2.  Napravi šemu za knjigu sa sledećim poljima:
    -   `title` (String)
    -   `author` (String)
    -   `year` (Number)
3.  Izvezi model pod imenom `Book`.

------------------------------------------------------------------------

## Zadatak 2 --- Kreiranje Express ruta

U glavnom fajlu (npr. `server.js`) dodaj sledeće rute:

1.  **POST `/books`** --- čuva novu knjigu u bazi\
    Koristi `.save()` metod.

2.  **GET `/books`** --- vraća sve knjige iz baze\
    Koristi `.find()` metod.

------------------------------------------------------------------------

## Zadatak 3 --- Testiranje

1.  Pokreni server pomoću:

    ``` bash
    node server.js
    ```

2.  Testiraj rute pomoću **Postman** ili **curl** komandi.\
    Na primer:

    ``` bash
    curl -X POST http://localhost:3000/books -H "Content-Type: application/json" -d '{"title":"Moby Dick","author":"Herman Melville","year":1851}'
    ```

------------------------------------------------------------------------

*Napomena*

-   Pazi da koristiš `express.json()` middleware.
-   Proveri da li si povezan sa bazom pomoću
    `console.log('Povezan sa bazom')`.
-   Ako dobiješ grešku `ValidationError`, proveri tipove podataka.