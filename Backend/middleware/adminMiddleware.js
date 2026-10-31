/**
 * Admin Authorization Middleware
 * Enforces that the authenticated user has role 'admin'
 */
module.exports = function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required. Please sign in."
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden: Admin access required."
    });
  }

  next();
};
