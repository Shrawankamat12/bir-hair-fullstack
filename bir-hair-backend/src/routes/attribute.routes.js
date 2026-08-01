const router = require('express').Router();
const { getAttributes, getAttribute } = require('../controllers/attribute.controller');

router.get('/', getAttributes);
router.get('/:id', getAttribute);

module.exports = router;
