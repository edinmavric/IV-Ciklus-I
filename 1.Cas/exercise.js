// path === '/' prikazuje tekst
// === '/time' prikazuje trenutno vreme
// === '/date' prikazuje trenutni datum

// Kako prikazati trenutni datum a kako trenutno vreme u js-u

const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.end('Tekst')
  } else if (req.url === '/time') {
    res.end(`Trenutno vreme: ${new Date().toLocaleTimeString()}`)
  } else if (req.url === '/date') {
    res.end(`Trenutni datum: ${new Date().toLocaleDateString()}`)
  } else {
    res.statusCode = 404;
    res.end('404 Not Found!')
  }
})

server.listen(3001, () => {
  console.log('Server na: http://localhost:3001');
})