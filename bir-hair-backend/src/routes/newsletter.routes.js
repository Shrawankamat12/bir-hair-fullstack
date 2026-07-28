const router = require('express').Router();
const { subscribe } = require('../controllers/newsletter.controller');
const validate = require('../middleware/validate.middleware');
const { subscribeRules } = require('../validators/newsletter.validator');

router.post('/subscribe', subscribeRules, validate, subscribe);

module.exports = router;
