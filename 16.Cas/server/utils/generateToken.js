import jwt from 'jsonwebtoken';

export function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role }, // payload
    process.env.JWT_SECRET,            // secret
    { expiresIn: '1h' }                // options
  );
}
