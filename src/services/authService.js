const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const env = require("../config/env");
const ApiError = require("../utils/apiError");

const signToken = (userId) => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "7d" });
};

const register = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new ApiError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash }
  });

  return {
    token: signToken(user.id),
    user: { id: user.id, email: user.email }
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid email or password");

  return {
    token: signToken(user.id),
    user: { id: user.id, email: user.email }
  };
};

module.exports = {
  register,
  login,
  signToken
};
