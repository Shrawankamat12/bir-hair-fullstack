const router = require('express').Router();
const { getFaqs } = require('../controllers/faq.controller');

router.get('/', getFaqs);

module.exports = router;
