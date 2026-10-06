const jwt = require("jsonwebtoken");

/**
 * Optional Authentication Middleware
 * Decodes JWT token if provided in Authorization header,
 * but does NOT block or reject requests if token is missing or invalid.
 */
module.exports = function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    req.user = null;
    return next();
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }

  next();
};
