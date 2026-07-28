const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Run after an array of express-validator checks. Collects all failures
// into one 422 response instead of the request half-processing then
// throwing a raw Mongoose ValidationError later.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new AppError('Validation failed', 422, details));
}

module.exports = validate;
