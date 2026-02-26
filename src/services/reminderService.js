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
      status: { in: ["PENDING", "FAILED", "SENT"] }
    },
    data: { status: "CANCELED" }
  });

  if (!updated.count) {
    throw new ApiError(404, "Reminder not found");
  }
};
module.exports = {
  createReminder,
  listReminders,
  cancelReminder
};
