// Primer slanja header-a za /protected rutu na backendu

fetch('/protected', {
  method: 'GET',
  headers: {
    'x-api-key': 'tajna123',
  },
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Niste autorizovani');
    }
    return response.text();
  })
  .then(data => {
    console.log(data); // Ispisuje: imate pristup!
  })
  .catch(error => {
    console.error('Greska:', error.message);
  });
