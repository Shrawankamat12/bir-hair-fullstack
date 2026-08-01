const router = require('express').Router();
const { getCollections, getCollection } = require('../controllers/collection.controller');

router.get('/', getCollections);
router.get('/:id', getCollection);

module.exports = router;
