const router = require('express').Router();
const { getAttributes } = require('../controllers/attribute.controller');

router.get('/', getAttributes);

module.exports = router;
