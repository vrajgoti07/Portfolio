const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized: No token provided or malformed authorization header"
    });
  }

  // Strip 'Bearer ' prefix, trim extra whitespace, and handle comma-separated duplicate headers from Thunder Client (Auth tab + Headers tab)
  const rawToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  const token = rawToken.split(",")[0].trim().replace(/^["']|["']$/g, "");

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: Token missing"
    });
  }

  const jwtSecret = process.env.JWT_SECRET || "default_secret_key";

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Unauthorized: Token has expired"
      });
    }
    return res.status(401).json({
      message: "Unauthorized: Invalid token"
    });
  }
};

module.exports = authMiddleware;
