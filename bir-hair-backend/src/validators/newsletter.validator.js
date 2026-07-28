const { body } = require('express-validator');

exports.subscribeRules = [body('email').trim().isEmail().withMessage('Valid email is required')];
