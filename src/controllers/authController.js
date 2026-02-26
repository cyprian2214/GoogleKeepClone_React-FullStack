const authService = require("../services/authService");
const { parseRequiredString } = require("../utils/validators");
const ApiError = require("../utils/apiError");

const register = async (req, res) => {
  const email = parseRequiredString(req.body?.email, "email");
  const password = parseRequiredString(req.body?.password, "password");
  if (password.length < 6) {
    throw new ApiError(400, "password must be at least 6 characters");
  }

  const result = await authService.register({ email, password });
  res.status(201).json(result);
};

const login = async (req, res) => {
  const email = parseRequiredString(req.body?.email, "email");
  const password = parseRequiredString(req.body?.password, "password");

  const result = await authService.login({ email, password });
  res.json(result);
};

module.exports = {
  register,
  login
};
