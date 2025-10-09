Za domaci napraviti sledece:

server.js - napraviti HTTP server koji:
- uvozi http i fs module
- uvozi handleRequest funkciju iz routes.js fajla
- pokrece server na portu 3000

routes.js - napraviti modul koji:
- eksportuje funkciju handleRequest koja:
  - definise rute i odgovore koje se nalaze na njima.
  - svaki put kada korisnik pristupi ruti, ispisuje u konzoli ili u log.txt fajlu ili na oba nacina koju je rutu posetio. (koristiti fs modul, i appendFile metodu, pogledati kako ta metoda radi!!!).