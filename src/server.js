const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "..")));

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const parseOptionalString = (value, field) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new ApiError(400, `${field} must be a string`);
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const parseRequiredString = (value, field) => {
  const parsed = parseOptionalString(value, field);
  if (!parsed) {
    throw new ApiError(400, `${field} is required`);
  }
  return parsed;
};

const parseOptionalBoolean = (value, field) => {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") {
    throw new ApiError(400, `${field} must be a boolean`);
  }
  return value;
};

const parseOptionalColor = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new ApiError(400, "color must be a string");
  }
  if (!HEX_COLOR_REGEX.test(value)) {
    throw new ApiError(400, "color must be a valid hex value like #fff or #ffffff");
  }
  return value;
};

const signToken = (user) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
};

const authRequired = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");
  if (!token) {
    throw new ApiError(401, "Authorization required");
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new ApiError(401, "Invalid token");
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.post("/api/auth/register", asyncHandler(async (req, res) => {
  const email = parseRequiredString(req.body?.email, "email").toLowerCase();
  const password = parseRequiredString(req.body?.password, "password");
  if (password.length < 6) {
    throw new ApiError(400, "password must be at least 6 characters");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash }
  });

  const token = signToken(user);
  res.status(201).json({ token, user: { id: user.id, email: user.email } });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const email = parseRequiredString(req.body?.email, "email").toLowerCase();
  const password = parseRequiredString(req.body?.password, "password");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(user);
  res.json({ token, user: { id: user.id, email: user.email } });
}));

app.get("/api/notes", authRequired, asyncHandler(async (req, res) => {
  const { archived, pinned, q } = req.query;
  const where = {};

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

  where.userId = req.user.id;

  const notes = await prisma.note.findMany({
    where,
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }]
  });

  res.json(notes);
}));

app.get("/api/notes/:id", authRequired, asyncHandler(async (req, res) => {
  const note = await prisma.note.findFirst({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
}));

app.post("/api/notes", authRequired, asyncHandler(async (req, res) => {
  const title = parseOptionalString(req.body?.title, "title");
  const content = parseOptionalString(req.body?.content, "content");
  const color = parseOptionalColor(req.body?.color) ?? "#ffffff";
  const pinned = parseOptionalBoolean(req.body?.pinned, "pinned") ?? false;
  const archived = parseOptionalBoolean(req.body?.archived, "archived") ?? false;

  if (!title && !content) {
    throw new ApiError(400, "Title or content is required");
  }

  const note = await prisma.note.create({
    data: { title, content, color, pinned, archived, userId: req.user.id }
  });

  res.status(201).json(note);
}));

app.put("/api/notes/:id", authRequired, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const data = {};
  if ("title" in body) data.title = parseOptionalString(body.title, "title");
  if ("content" in body) data.content = parseOptionalString(body.content, "content");
  if ("color" in body) data.color = parseOptionalColor(body.color);
  if ("pinned" in body) data.pinned = parseOptionalBoolean(body.pinned, "pinned");
  if ("archived" in body) data.archived = parseOptionalBoolean(body.archived, "archived");

  if (!Object.keys(data).length) {
    throw new ApiError(400, "At least one field must be provided");
  }

  const note = await prisma.note.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data
  });

  if (!note.count) {
    throw new ApiError(404, "Note not found");
  }

  const updated = await prisma.note.findFirst({
    where: { id: req.params.id, userId: req.user.id }
  });
  res.json(updated);
}));

app.delete("/api/notes/:id", authRequired, asyncHandler(async (req, res) => {
  const deleted = await prisma.note.deleteMany({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!deleted.count) {
    throw new ApiError(404, "Note not found");
  }
  res.status(204).send();
}));

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error && error.code === "P2025") {
    return res.status(404).json({ error: "Note not found" });
  }
  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
