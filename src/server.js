require("dotenv").config();

const app = require("./app");
const env = require("./config/env");
const prisma = require("./lib/prisma");

const server = app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
