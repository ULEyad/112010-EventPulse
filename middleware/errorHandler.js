const AppError = require('../utils/AppError');

// Normalize common non-operational error types (bad ObjectId, duplicate
// unique key, Mongoose validation, bad/expired JWT) into clear, safe
// AppErrors instead of leaking internal driver/library details to the client.
const handleCastError = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFields = (err) => {
  const field = Object.keys(err.keyValue || {}).join(', ') || 'field';
  return new AppError(`Duplicate value for ${field}. Please use a different value.`, 409);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input data: ${messages.join('. ')}`, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpired = () => new AppError('Your token has expired. Please log in again.', 401);

/**
 * Central error middleware. Every error in the app - thrown, passed to
 * next(err), or forwarded by asyncHandler - ends up here. Unexpected
 * (non-operational) errors are logged in full on the server and replaced
 * with a generic message for the client, so internals are never exposed.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (error.name === 'CastError') error = handleCastError(error);
  if (error.code === 11000) error = handleDuplicateFields(error);
  if (error.name === 'ValidationError') error = handleValidationError(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpired();

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  if (!error.isOperational) {
    console.error('UNEXPECTED ERROR 💥', err);
  }

  res.status(statusCode).json({
    status,
    message: error.isOperational ? error.message : 'Something went wrong on the server',
  });
};

module.exports = errorHandler;
