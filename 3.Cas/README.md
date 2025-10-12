server.js

Napiši Express server koji ima sledeće rute:

GET rute

/
pošalji HTML fajl index.html pomoću res.sendFile.

/about
vraća <h1>O nama</h1>

/user/:name
koristi req.params i vraća tekst:
"Zdravo, {{ name }}!"

/search
koristi req.query i vraća tekst:
"Pretraga za pojam: {{ query }} u kategoriji: {{ category }}"

Primer:
/search?query=node&category=backend

/users
vraća niz korisnika u JSON formatu:

[
  { "id": 1, "name": "Sara" },
  { "id": 2, "name": "Marko" },
  { "id": 3, "name": "Amir" }
]

POST rute

/add-user
prima JSON telo sa name i age, i vraća tekst:
"Dodat je korisnik {{ name }} koji ima {{ age }} godina"

/feedback
prima JSON telo sa message, i vraća tekst:
"Poruka primljena: {{ message }}"

Middleware
app.use(express.json());
app.use(cors());

index.html

Ovaj HTML služi kao interfejs za slanje i testiranje podataka serveru.

<!DOCTYPE html>
<html lang="sr">
  <head>
    <meta charset="UTF-8" />
    <title>Express Domaći</title>
  </head>
  <body>
    <h1>Express Domaći</h1>

    <h2>Dodaj korisnika</h2>
    <form id="userForm">
      <input type="text" id="name" placeholder="Ime" required />
      <input type="number" id="age" placeholder="Godine" required />
      <button type="submit">Pošalji</button>
    </form>

    <h2>Pošalji feedback</h2>
    <form id="feedbackForm">
      <input type="text" id="message" placeholder="Tvoja poruka" required />
      <button type="submit">Pošalji</button>
    </form>

    <h2>Test GET rute</h2>
    <a href="/about">O nama</a><br />
    <a href="/user/Marko">Zdravo, Marko</a><br />
    <a href="/search?query=node&category=backend">Pretraga primer</a><br />
    <a href="/users">Prikaži korisnike</a>

    <script>
      document
        .getElementById('userForm')
        .addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = document.getElementById('name').value;
          const age = document.getElementById('age').value;

          const res = await fetch('/add-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, age }),
          });

          const data = await res.text();
          alert(data);
        });

      document
        .getElementById('feedbackForm')
        .addEventListener('submit', async (e) => {
          e.preventDefault();
          const message = document.getElementById('message').value;

          const res = await fetch('/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
          });

          const data = await res.text();
          alert(data);
        });
    </script>
  </body>
</html>

Dodaj /math/:a/:b rutu koja vraća zbir dva broja.
I rutu multiply koja prima dva broja u query parametru i vraća njihov proizvod.