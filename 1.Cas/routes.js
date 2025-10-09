exports.handleRequest = (req, res) => {
  if (req.url === '/') {
    res.end('Pocetna stranica');
  } else if (req.url === '/about') {
    res.end('O nama stranica');
  } else {
    res.end('404 Not Found');
  }
}

// 2. nacin:
// function handleRequest(req, res) {
//   if (req.url === '/') {
//     res.end('Pocetna stranica');
//   } else if (req.url === '/about') {
//     res.end('O nama stranica');
//   } else {
//     res.end('404 Not Found');
//   }
// }

// module.exports = handleRequest;
