const bcrypt = require('bcrypt');

// Salt rounds is the cost of generating the hash (higher number => longer time)
const saltRounds = 10;

function hashPassword (password) {
  return bcrypt.hash(password, saltRounds);
}

module.exports = hashPassword;
