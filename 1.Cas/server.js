const http = require('http');
const routes = require('./routes')

const server = http.createServer(routes.handleRequest);

server.listen(3000, () => {
  console.log('Server je pokrenut na http://localhost:3000');
});
