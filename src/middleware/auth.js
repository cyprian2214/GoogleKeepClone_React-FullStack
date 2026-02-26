const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const env = require("../config/env");
const ApiError = require("../utils/apiError");

const authRequired = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");
  if (!token) return next(new ApiError(401, "Authorization required"));

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return next(new ApiError(401, "Invalid token"));
    req.user = user;
    return next();
  } catch (_) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

module.exports = authRequired;
