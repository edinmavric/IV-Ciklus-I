import jwt from 'jsonwebtoken';

// JWT_SECRET = u terminalu: openssl rand -hex 32

export function authMiddleware(req, res, next) {
  // Klijent salje header: Autorization: Bearer <token koji je dobio na loginu>
  const authHeader = req.headers.authorization;

  // 1. Da li header postoji?
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Niste autorizovani' });
  }

  // 2. Izvuci token
  const token = authHeader.split(' ')[1];

  try {
    // 3. Proveri token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Ubaci podatke u req.user
    req.user = decoded; // { id: "...", role: "student" }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token nije validan' });
  }
}

// req.body: {
//   "email"
//   "password"
// }
// req.header: {
//    Autorization: Bearer <token>
// }
