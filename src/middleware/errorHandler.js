const ApiError = require("../utils/apiError");

const errorHandler = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ error: error.message });
  }

  if (error && error.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }

  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
};

module.exports = errorHandler;
