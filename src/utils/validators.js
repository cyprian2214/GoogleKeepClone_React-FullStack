const ApiError = require("./apiError");

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

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
  if (!parsed) throw new ApiError(400, `${field} is required`);
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

const parseRequiredFutureDate = (value, field) => {
  if (!value) throw new ApiError(400, `${field} is required`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${field} must be a valid ISO date`);
  }
  if (date.getTime() <= Date.now()) {
    throw new ApiError(400, `${field} must be in the future`);
  }
  return date;
};

module.exports = {
  parseOptionalString,
  parseRequiredString,
  parseOptionalBoolean,
  parseOptionalColor,
  parseRequiredFutureDate
};
