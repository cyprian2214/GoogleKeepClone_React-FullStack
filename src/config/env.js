const path = require("path");

const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "",
  staticDir: path.join(__dirname, "..", ".."),
  reminderPollIntervalMs: Number(process.env.REMINDER_POLL_INTERVAL_MS || 15000),
  reminderRetentionDays: Number(process.env.REMINDER_RETENTION_DAYS || 30),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || ""
};

module.exports = env;
