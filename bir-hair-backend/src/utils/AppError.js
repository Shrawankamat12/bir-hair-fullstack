// Operational error class — throw `new AppError('message', 404)` from anywhere
// (controller, service, repository) and the central error middleware will
// format it consistently. Falls back gracefully for plain Error() throws too,
// so all the existing `res.status(404); throw new Error('...')` code in the
// original controllers keeps working exactly as before.
class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
