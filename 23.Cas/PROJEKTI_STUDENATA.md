# Full-Stack Projekti za Studente

## Rok za završetak: 18.12.2025.

---

## 1. Mustafa - **Event Ticket System** (Sistem za prodaju karata)

### Opis
Aplikacija za kreiranje događaja (koncerti, utakmice, konferencije) i online prodaju karata.

### Funkcionalnosti
- Registracija i login korisnika (obični korisnici i organizatori)
- Organizatori mogu kreirati događaje sa:
  - Nazivom, opisom, datumom, lokacijom
  - Različitim tipovima karata (VIP, Regular, Student)
  - Ograničenim brojem karata po tipu
- Korisnici mogu:
  - Pretraživati događaje po kategoriji, datumu, lokaciji
  - Kupovati karte (simulacija plaćanja)
  - Dobiti QR kod kao potvrdu kupovine
  - Pregledati istoriju kupljenih karata
- Dashboard za organizatore sa statistikom prodaje
- Email notifikacije pri kupovini

### Razmisli sam
- Kako sprečiti "overbooking" kada više korisnika istovremeno kupuje poslednje karte?
- Kako implementirati sistem čekanja (waitlist) za rasprodate događaje?

---

## 2. Fatih - **Recipe Sharing Platform** (Platforma za deljenje recepata)

### Opis
Društvena mreža za ljubitelje kuvanja gde korisnici dele recepte i prate omiljene kuvare.

### Funkcionalnosti
- Registracija i profili korisnika sa avatar slikom
- Kreiranje recepata sa:
  - Sastojcima (sa količinama)
  - Koracima pripreme
  - Vremenom pripreme i težinom
  - Upload slika jela
  - Kategorijama (dorućak, ručak, desert, vegan...)
- Follow sistem (prati omiljene kuvare)
- Like i komentar sistem na receptima
- Bookmark/Save recepti za kasnije
- Napredna pretraga (po sastojcima, vremenu, kategoriji)
- "Feed" sa receptima od praćenih korisnika

### Razmisli sam
- Kako implementirati pretragu "imam ove sastojke, šta mogu da skuvam"?
- Kako napraviti sistem za skaliranje recepata (za 2, 4, 8 osoba)?

---

## 3. Imran - **Fitness Tracker** (Aplikacija za praćenje treninga)

### Opis
Aplikacija za kreiranje treninga, praćenje napretka i deljenje workout rutina.

### Funkcionalnosti
- Registracija sa fizičkim podacima (visina, težina, ciljevi)
- Biblioteka vežbi sa:
  - Nazivom, opisom, mišićnom grupom
  - Video/GIF demonstracijom (URL)
- Kreiranje custom workout rutina
- Logovanje završenih treninga sa:
  - Serijama, ponavljanjima, kilažom
  - Trajanjem treninga
- Grafički prikaz napretka (Chart.js)
- Kalkulator BMI, kalorija, makronutrijenata
- Deljenje rutina sa drugim korisnicima
- Sistem dostignuća (badges) za konzistentnost

### Razmisli sam
- Kako izračunati preporučenu kilažu za sledeći trening baziranu na prethodnim?
- Kako implementirati "streak" sistem za motivaciju?

---

## 4. Alija - **Job Board Portal** (Portal za oglase za posao)

### Opis
Platforma koja povezuje poslodavce i kandidate za posao.

### Funkcionalnosti
- Dva tipa korisnika: Kandidati i Kompanije
- Kompanije mogu:
  - Kreirati profil kompanije sa logom
  - Postavljati oglase za posao
  - Pregledati prijave i CV-ove
  - Menjati status prijave (primljen, odbijen, intervju)
- Kandidati mogu:
  - Kreirati detaljan profil/CV
  - Upload CV dokumenta (PDF)
  - Aplicirati na oglase
  - Pratiti status svojih prijava
  - Sačuvati zanimljive oglase
- Filtriranje oglasa po: lokaciji, plati, tipu (remote, hybrid, office)
- Email notifikacije o statusu prijave

### Razmisli sam
- Kako implementirati "match score" između kandidata i oglasa?
- Kako sprečiti spam prijave od strane kandidata?

---

## 5. Danel - **Online Learning Platform** (E-learning platforma)

### Opis
Platforma za kreiranje i pohađanje online kurseva.

### Funkcionalnosti
- Tri uloge: Student, Instruktor, Admin
- Instruktori mogu:
  - Kreirati kurseve sa modulima i lekcijama
  - Upload video materijala (YouTube embed ili URL)
  - Kreirati kvizove sa pitanjima
  - Pregledati napredak studenata
- Studenti mogu:
  - Pretraživati i upisivati kurseve
  - Pratiti lekcije i označavati završene
  - Rešavati kvizove i dobijati bodove
  - Dobiti sertifikat po završetku kursa
- Progress bar za svaki kurs
- Sistem ocenjivanja kurseva (1-5 zvezda + komentar)
- Dashboard sa statistikom

### Razmisli sam
- Kako generisati PDF sertifikat sa imenom studenta i datumom?
- Kako implementirati "prerequisites" - kursevi koji moraju biti završeni pre nekog drugog?

---

## 6. Avdo - **Inventory Management System** (Sistem za upravljanje zalihama)

### Opis
Aplikacija za mala preduzeća za praćenje proizvoda, zaliha i narudžbina.

### Funkcionalnosti
- Upravljanje proizvodima:
  - Naziv, SKU, kategorija, cena
  - Količina na stanju
  - Minimum stock alert
- Upravljanje dobavljačima
- Kreiranje narudžbina (ulaz/izlaz robe)
- Automatska notifikacija kada zalihe padnu ispod minimuma
- Izveštaji:
  - Najprodavaniji proizvodi
  - Vrednost zaliha
  - Istorija transakcija
- Export izveštaja u CSV/Excel format
- Barcode/SKU pretraga
- Multi-user sa različitim ulogama (admin, warehouse, viewer)

### Razmisli sam
- Kako implementirati "batch tracking" - praćenje serija proizvoda?
- Kako napraviti sistem za automatsko naručivanje kada zalihe padnu?

---

## 7. Demir - **Real Estate Listing App** (Aplikacija za nekretnine)

### Opis
Portal za oglašavanje i pretragu nekretnina za prodaju ili iznajmljivanje.

### Funkcionalnosti
- Korisnici: Obični i Agenti/Vlasnici
- Kreiranje oglasa sa:
  - Tipom (stan, kuća, poslovni prostor)
  - Lokacijom (grad, adresa)
  - Kvadraturom, brojem soba, spratom
  - Cenom (prodaja ili kirija)
  - Multiple slike nekretnine
  - Dodatne karakteristike (parking, lift, terasa...)
- Napredna pretraga i filtriranje
- Mapa prikaz nekretnina (Leaflet.js)
- Kontakt forma za zakazivanje gledanja
- Favorite lista
- Poređenje nekretnina (uporedi 2-3 nekretnine)
- Slični oglasi preporuka

### Razmisli sam
- Kako izračunati cenu po kvadratu i rangirati "fer cene"?
- Kako implementirati notifikacije za nove nekretnine po kriterijumima korisnika?

---

## 8. Amer - **Restaurant Reservation System** (Sistem za rezervacije restorana)

### Opis
Aplikacija za restorane da upravljaju stolovima i rezervacijama.

### Funkcionalnosti
- Panel za restoran:
  - Definisanje stolova (kapacitet, lokacija u restoranu)
  - Radno vreme i neradni dani
  - Meni sa kategorijama i cenama
  - Pregled svih rezervacija (kalendar view)
  - Potvrda/otkazivanje rezervacija
- Panel za goste:
  - Pretraga restorana po lokaciji, kuhinji, oceni
  - Pregled dostupnih termina
  - Online rezervacija sa brojem osoba i vremenom
  - Specijalni zahtevi (rođendan, alergije...)
  - Istorija rezervacija
- Email/SMS potvrda rezervacije
- Sistem ocenjivanja posle posete
- Waitlist za pune termine

### Razmisli sam
- Kako optimalno rasporediti goste po stolovima (4 osobe mogu na sto za 4 ili 6)?
- Kako upravljati "no-show" gostima i implementirati penale?

---

## 9. Sara - **Personal Finance Manager** (Upravljanje ličnim finansijama)

### Opis
Aplikacija za praćenje prihoda, rashoda i finansijskih ciljeva.

### Funkcionalnosti
- Sigurna registracija i login
- Dodavanje transakcija:
  - Prihodi i rashodi
  - Kategorije (hrana, transport, zabava, računi...)
  - Datum, iznos, opis
  - Ponavljajuće transakcije (kirija, pretplate)
- Budžeti po kategorijama sa upozorenjima
- Štedni ciljevi (npr. "Laptop - 1000€")
- Dashboard sa:
  - Grafici potrošnje po kategorijama (pie chart)
  - Trend prihoda/rashoda kroz vreme (line chart)
  - Trenutni bilans
- Mesečni/godišnji izveštaji
- Export podataka u CSV
- Dark/Light mode

### Razmisli sam
- Kako predvideti buduće troškove na osnovu istorijskih podataka?
- Kako implementirati "split transaction" za deljenje računa sa cimerima?

---

## 10. Stefan - **Project Management Tool** (Alat za upravljanje projektima)

### Opis
Trello/Jira-like aplikacija za upravljanje projektima i taskovima u timu.

### Funkcionalnosti
- Kreiranje organizacija/timova
- Pozivanje članova u tim (putem email-a)
- Projekti sa:
  - Nazivom, opisom, deadline-om
  - Board view (Kanban) sa kolonama (To Do, In Progress, Done)
  - List view
- Taskovi sa:
  - Naslovom, opisom
  - Prioritetom (Low, Medium, High, Critical)
  - Assignee (dodeljeni član)
  - Due date
  - Labelama/tagovima
  - Komentarima
  - Checklist (subtaskovi)
- Drag & drop taskova između kolona
- Filtriranje po assignee, prioritetu, labeli
- Activity log (ko je šta uradio)
- Dashboard sa statistikom projekta

### Razmisli sam
- Kako implementirati real-time update kada neko pomeri task (WebSocket)?
- Kako napraviti sistem notifikacija za assignovane taskove i komentare?

---

## Kriterijumi ocenjivanja

| Kriterijum | Bodovi |
|------------|--------|
| Funkcionalnost (sve feature radi) | 40 |
| Kvalitet koda (čist, organizovan) | 20 |
| UI/UX dizajn | 15 |
| Kreativnost i dodatne funkcije | 15 |
| Dokumentacija i prezentacija | 10 |
| **Ukupno** | **100** |

---

## Napomene

1. **Svaki student radi samostalno** - plagijat rezultira ocenom 0
2. **Git je obavezan** - redovni commitovi pokazuju napredak
3. **README.md** mora sadržati:
   - Opis projekta
   - Uputstvo za instalaciju
   - Listu implementiranih funkcionalnosti
4. **Pitanja su dobrodošla** - bolje pitati nego pogađati
5. **Deadline je striktan** - bez izuzetaka

---

*Sretno sa radom!*

**DEADLINE**: 18.12.2025.
