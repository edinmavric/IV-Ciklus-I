const http = require('http');

const users = [
  { id: 1, name: 'Avdo' },
  { id: 2, name: 'Amer' },
  { id: 3, name: 'Mustafa' },
];

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Pocetna stranica');
  } else if (req.url === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('O nama stranica');
  } else if (req.url === '/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(3000, () => {
  console.log('radi!');
});

// fetch('http://localhost:3000/users')
//  .then(res => res.json())
//  .then(data => console.log(data))
//  .catch(err => console.error(err))

// data.js - sadrzi podatke o namirnicama (id, naziv, cena, kolicina)
// routes.js - imace rutu za pristup tim podacima o namirnicama (/shop)
// server.js - inicijalizovati server