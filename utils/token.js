const crypto = require("crypto");

const generateToken = (size = 64) => {
  const buf = crypto.randomBytes(size).toString("hex").slice(0, size);
  return buf;
};

module.exports = generateToken;
