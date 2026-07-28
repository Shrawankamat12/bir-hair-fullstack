const router = require('express').Router();
const { getSiteContent } = require('../controllers/siteContent.controller');

router.get('/', getSiteContent);

module.exports = router;
