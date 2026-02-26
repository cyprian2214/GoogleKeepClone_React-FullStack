const path = require("path");

const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "",
  staticDir: path.join(__dirname, "..", "..")
};

module.exports = env;
