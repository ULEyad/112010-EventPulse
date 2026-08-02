/**
 * Operational error class. Any error thrown or passed to next() as an
 * AppError is considered "safe" - its message is meant to be shown to the
 * client. Anything else (a bug, an unexpected exception) is treated as a
 * programming error and hidden from the client by the central error handler.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
