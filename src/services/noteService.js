const prisma = require("../lib/prisma");
const ApiError = require("../utils/apiError");

const listNotes = async (userId, query) => {
  const { archived, pinned, q } = query;
  const where = { userId };

  if (archived === "true") where.archived = true;
  if (archived === "false") where.archived = false;
  if (pinned === "true") where.pinned = true;
  if (pinned === "false") where.pinned = false;

  if (q && typeof q === "string") {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } }
    ];
  }

  return prisma.note.findMany({
    where,
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }]
  });
};

const getNote = async (userId, noteId) => {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw new ApiError(404, "Note not found");
  return note;
};

const createNote = async (userId, data) => {
  return prisma.note.create({
    data: {
      ...data,
      userId
    }
  });
};

const updateNote = async (userId, noteId, data) => {
  const result = await prisma.note.updateMany({
    where: { id: noteId, userId },
    data
  });
  if (!result.count) throw new ApiError(404, "Note not found");
  return prisma.note.findFirst({ where: { id: noteId, userId } });
};

const deleteNote = async (userId, noteId) => {
  const deleted = await prisma.note.deleteMany({ where: { id: noteId, userId } });
  if (!deleted.count) throw new ApiError(404, "Note not found");
};

module.exports = {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote
};
