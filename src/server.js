require("dotenv").config();

const app = require("./app");
const env = require("./config/env");
const prisma = require("./lib/prisma");
const { startReminderWorker, stopReminderWorker } = require("./services/reminderWorker");

const server = app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});

startReminderWorker();

const shutdown = async () => {
  stopReminderWorker();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
