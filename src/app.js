const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const env = require("./config/env");
const authRequired = require("./middleware/auth");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(express.static(env.staticDir));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(env.staticDir, "index.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", authRequired, noteRoutes);
app.use("/api/reminders", authRequired, reminderRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
