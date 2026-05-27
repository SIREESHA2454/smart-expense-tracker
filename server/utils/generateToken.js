const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // PAYLOAD: what we store inside the token
    process.env.JWT_SECRET,   // SECRET: used to sign (and later verify)
    { expiresIn: '30d' }      // OPTIONS: token expires in 30 days
  );
};

module.exports = generateToken;