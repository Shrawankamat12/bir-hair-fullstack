const AppError = require('../utils/AppError');
const logger = require('../config/logger');

function notFound(req, res, next) {
  res.status(404);
  next(new AppError(`Route not found - ${req.originalUrl}`, 404));
}

// Normalizes any thrown error (AppError, Mongoose, JWT, or a plain `throw new Error()`
// from the original controllers) into the same { success, message } shape the
// frontend/admin already expect, so nothing there needs to change.
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Something went wrong';
  let details = err.details;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 422;
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = 'Validation failed';
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : 'Duplicate value';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token, please log in again';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired, please log in again';
  }

  if (statusCode >= 500) {
    logger.error(message, { stack: err.stack, path: req.originalUrl, method: req.method });
  } else {
    logger.warn(message, { path: req.originalUrl, method: req.method });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { errors: details }),
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler };
