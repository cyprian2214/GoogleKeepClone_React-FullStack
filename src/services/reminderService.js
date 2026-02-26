const prisma = require("../lib/prisma");
const ApiError = require("../utils/apiError");

const createReminder = async (userId, { noteId, remindAt, email, message }) => {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw new ApiError(404, "Note not found");

  return prisma.reminder.create({
    data: {
      noteId,
      userId,
      remindAt,
      email,
      message: message || null
    }
  });
};

const listReminders = async (userId, status) => {
  const where = { userId };
  if (status) where.status = status;
  return prisma.reminder.findMany({
    where,
    include: { note: true },
    orderBy: { remindAt: "asc" }
  });
};

const cancelReminder = async (userId, reminderId) => {
  const updated = await prisma.reminder.updateMany({
    where: {
      id: reminderId,
      userId,
      status: { in: ["PENDING", "FAILED"] }
    },
    data: { status: "CANCELED" }
  });

  if (!updated.count) {
    throw new ApiError(404, "Reminder not found");
  }
};

const getDuePendingReminders = async (limit = 20) => {
  return prisma.reminder.findMany({
    where: {
      status: "PENDING",
      remindAt: { lte: new Date() }
    },
    include: {
      note: true,
      user: true
    },
    orderBy: { remindAt: "asc" },
    take: limit
  });
};

const markReminderSent = async (id) => {
  await prisma.reminder.update({
    where: { id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      lastError: null
    }
  });
};

const markReminderFailed = async (id, errorMessage) => {
  await prisma.reminder.update({
    where: { id },
    data: {
      status: "FAILED",
      lastError: String(errorMessage).slice(0, 1000)
    }
  });
};

const cleanupOldSentReminders = async (retentionDays) => {
  const before = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  await prisma.reminder.deleteMany({
    where: {
      status: "SENT",
      sentAt: { lt: before }
    }
  });
};

module.exports = {
  createReminder,
  listReminders,
  cancelReminder,
  getDuePendingReminders,
  markReminderSent,
  markReminderFailed,
  cleanupOldSentReminders
};
