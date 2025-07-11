const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

function sign(payload, options = {}) {
  return jwt.sign(payload, secret, { expiresIn: '1h', ...options });
}

function verify(token) {
  return jwt.verify(token, secret);
}

module.exports = { sign, verify }; 