/**
 * Admin Authorization Middleware
 * Enforces that the authenticated user has role 'admin'
 * and strictly matches the designated admin email: vrajgoti07@gmail.com
 */
module.exports = function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required. Please sign in."
    });
  }

  const userEmail = (req.user.email || "").toLowerCase().trim();
  const userRole = req.user.role;

  if (userRole !== "admin" || userEmail !== "vrajgoti07@gmail.com") {
    return res.status(403).json({
      message: "Forbidden: Admin access restricted exclusively to vrajgoti07@gmail.com."
    });
  }

  next();
};
