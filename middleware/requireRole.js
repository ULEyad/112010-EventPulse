const AppError = require('../utils/AppError');

/**
 * Restricts a route to the given roles, e.g. requireRole('admin').
 * Must run after requireAuth so req.user is already populated.
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

module.exports = requireRole;
