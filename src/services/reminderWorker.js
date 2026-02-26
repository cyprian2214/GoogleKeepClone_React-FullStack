const env = require("../config/env");
const reminderService = require("./reminderService");
const emailService = require("./emailService");

let timer = null;
let cleanupTick = 0;

const runReminderTick = async () => {
  const reminders = await reminderService.getDuePendingReminders(25);

  for (const reminder of reminders) {
    try {
      await emailService.sendReminderEmail({
        to: reminder.email,
        noteTitle: reminder.note?.title,
        noteContent: reminder.note?.content,
        remindAt: reminder.remindAt,
        message: reminder.message
      });
      await reminderService.markReminderSent(reminder.id);
    } catch (error) {
      await reminderService.markReminderFailed(reminder.id, error.message || error);
    }
  }

  cleanupTick += 1;
  if (cleanupTick % 60 === 0) {
    await reminderService.cleanupOldSentReminders(env.reminderRetentionDays);
  }
};

const startReminderWorker = () => {
  if (timer) return;
  timer = setInterval(() => {
    runReminderTick().catch((error) => {
      console.error("Reminder worker tick failed", error);
    });
  }, env.reminderPollIntervalMs);

  runReminderTick().catch((error) => {
    console.error("Reminder worker startup tick failed", error);
  });
};

const stopReminderWorker = () => {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
};

module.exports = {
  startReminderWorker,
  stopReminderWorker
};
