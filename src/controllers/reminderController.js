const reminderService = require("../services/reminderService");
const {
  parseOptionalString,
  parseRequiredString,
  parseRequiredFutureDate
} = require("../utils/validators");

const VALID_STATUSES = new Set(["PENDING", "SENT", "FAILED", "CANCELED"]);

const createReminder = async (req, res) => {
  const noteId = parseRequiredString(req.body?.noteId, "noteId");
  const email = parseOptionalString(req.body?.email, "email") || req.user.email;
  const message = parseOptionalString(req.body?.message, "message");
  const remindAt = parseRequiredFutureDate(req.body?.remindAt, "remindAt");

  const reminder = await reminderService.createReminder(req.user.id, {
    noteId,
    remindAt,
    email,
    message
  });

  res.status(201).json(reminder);
};

const listReminders = async (req, res) => {
  const status = req.query.status;
  const normalizedStatus = status ? String(status).toUpperCase() : undefined;
  if (normalizedStatus && !VALID_STATUSES.has(normalizedStatus)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const reminders = await reminderService.listReminders(req.user.id, normalizedStatus);
  res.json(reminders);
};

const cancelReminder = async (req, res) => {
  await reminderService.cancelReminder(req.user.id, req.params.id);
  res.status(204).send();
};

module.exports = {
  createReminder,
  listReminders,
  cancelReminder
};
