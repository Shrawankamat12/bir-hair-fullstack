const router = require('express').Router();
const { submitWholesaleInquiry } = require('../controllers/wholesale.controller');
const validate = require('../middleware/validate.middleware');
const { submitWholesaleRules } = require('../validators/wholesale.validator');

router.post('/', submitWholesaleRules, validate, submitWholesaleInquiry);

module.exports = router;
