function validateStudent(req, res, next) {
  const { name, age, city } = req.body;

  if (req.method === 'POST' || req.method === 'PUT') {
    if (!name || !age || !city)
      return res.status(400).send('Moraju se uneti sva polja');
  }

  if (name && name.length < 3)
    return res.status(400).send('Ime mora imati bar 3 karaktera');

  // Provera za age, mora da je veci od 12; - NAPOMENA: Sve iz body-ja je string
  if (age && +age < 12)
    return res.status(400).send('Student mora biti stariji od 12 godina');
  // Provera za city, mora da ima vise od 5 karaktera;
  if (city && city.length < 5)
    return res.status(400).send('Grad mora imati barem 5 karaktera');

  next();
}

module.exports = validateStudent;
