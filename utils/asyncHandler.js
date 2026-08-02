/**
 * Wraps an async (or sync) Express route/middleware handler so that any
 * thrown error or rejected promise is forwarded to next(err) instead of
 * crashing the process or leaving the request hanging.
 */
const asyncHandler = (fn) => (req, res, next) => {
  try {
    Promise.resolve(fn(req, res, next)).catch(next);
  } catch (err) {
    next(err);
  }
};

module.exports = asyncHandler;
