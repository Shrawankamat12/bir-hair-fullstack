const router = require('express').Router();
const { getCollections } = require('../controllers/collection.controller');

router.get('/', getCollections);

module.exports = router;
