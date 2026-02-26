const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter = null;

const isConfigured = () => Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass && env.smtpFrom);

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
  }
  return transporter;
};

const sendReminderEmail = async ({ to, noteTitle, noteContent, remindAt, message }) => {
  if (!isConfigured()) {
    throw new Error("SMTP is not configured");
  }

  const subject = `Reminder: ${noteTitle || "Untitled note"}`;
  const text = [
    `This is your reminder for: ${noteTitle || "Untitled note"}`,
    noteContent ? `Content: ${noteContent}` : null,
    message ? `Message: ${message}` : null,
    `Scheduled for: ${new Date(remindAt).toISOString()}`
  ].filter(Boolean).join("\n");

  await getTransporter().sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text
  });
};

module.exports = {
  isConfigured,
  sendReminderEmail
};
