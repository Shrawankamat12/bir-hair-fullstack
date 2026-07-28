const router = require('express').Router();
const { getSummary } = require('../../controllers/dashboard.controller');

router.get('/', getSummary);

module.exports = router;
