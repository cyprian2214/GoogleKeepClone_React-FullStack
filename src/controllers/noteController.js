const noteService = require("../services/noteService");
const {
  parseOptionalString,
  parseOptionalBoolean,
  parseOptionalColor
} = require("../utils/validators");
const ApiError = require("../utils/apiError");

const listNotes = async (req, res) => {
  const notes = await noteService.listNotes(req.user.id, req.query);
  res.json(notes);
};

const getNote = async (req, res) => {
  const note = await noteService.getNote(req.user.id, req.params.id);
  res.json(note);
};

const createNote = async (req, res) => {
  const title = parseOptionalString(req.body?.title, "title");
  const content = parseOptionalString(req.body?.content, "content");
  const color = parseOptionalColor(req.body?.color) ?? "#ffffff";
  const pinned = parseOptionalBoolean(req.body?.pinned, "pinned") ?? false;
  const archived = parseOptionalBoolean(req.body?.archived, "archived") ?? false;
  const deleted = parseOptionalBoolean(req.body?.deleted, "deleted") ?? false;

  if (!title && !content) {
    throw new ApiError(400, "Title or content is required");
  }

  const note = await noteService.createNote(req.user.id, {
    title,
    content,
    color,
    pinned,
    archived,
    deleted
  });

  res.status(201).json(note);
};

const updateNote = async (req, res) => {
  const body = req.body || {};
  const data = {};

  if ("title" in body) data.title = parseOptionalString(body.title, "title");
  if ("content" in body) data.content = parseOptionalString(body.content, "content");
  if ("color" in body) data.color = parseOptionalColor(body.color);
  if ("pinned" in body) data.pinned = parseOptionalBoolean(body.pinned, "pinned");
  if ("archived" in body) data.archived = parseOptionalBoolean(body.archived, "archived");
  if ("deleted" in body) data.deleted = parseOptionalBoolean(body.deleted, "deleted");

  if (!Object.keys(data).length) {
    throw new ApiError(400, "At least one field must be provided");
  }

  const note = await noteService.updateNote(req.user.id, req.params.id, data);
  res.json(note);
};

const deleteNote = async (req, res) => {
  await noteService.deleteNote(req.user.id, req.params.id);
  res.status(204).send();
};

module.exports = {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote
};
