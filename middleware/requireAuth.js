const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verifies the Bearer JWT on the request and attaches { id, role } to
 * req.user. Blocks the request with 401 if the token is missing, malformed,
 * or expired. The role always comes from the verified token, never from the
 * request body.
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token is missing', 401));
  }

  const token = authHeader.split(' ')[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = { id: decoded.id, role: decoded.role };
  next();
});

module.exports = requireAuth;
