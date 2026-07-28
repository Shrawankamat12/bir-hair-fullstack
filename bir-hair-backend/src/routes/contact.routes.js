const router = require('express').Router();
const { submitContact } = require('../controllers/contact.controller');
const validate = require('../middleware/validate.middleware');
const { submitContactRules } = require('../validators/contact.validator');

router.post('/', submitContactRules, validate, submitContact);

module.exports = router;
