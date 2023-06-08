const bcrypt = require("bcrypt");
const saltRound = 10;

const createBcrypt = async (password) => {
  const salt = await bcrypt.genSalt(saltRound);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const checkBcrypt = async (hashedPassword, password) => {
  const result = await bcrypt.compare(password, hashedPassword);
  return result;
};

module.exports = { createBcrypt, checkBcrypt };
