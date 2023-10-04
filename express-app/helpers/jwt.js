const { verify, sign } = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'SECRET';

function signToken(payload, expiresIn = null) {
  return sign(payload, JWT_SECRET_KEY, expiresIn ? { expiresIn } : null);
}

function verifyToken(token) {
  return verify(token, JWT_SECRET_KEY);
}

module.exports = { signToken, verifyToken };