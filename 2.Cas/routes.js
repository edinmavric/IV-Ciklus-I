const groceries = require('./data');

exports.handleRequests = (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Pocetna Stranica');
  } else if (req.url === '/shop' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(groceries));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Stranica ne postoji!');
  }
};
