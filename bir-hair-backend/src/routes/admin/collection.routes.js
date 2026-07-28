const router = require('express').Router();
const { getCollections, getCollection, createCollection, updateCollection, deleteCollection } = require('../../controllers/collection.controller');

router.get('/', getCollections);
router.get('/:id', getCollection);
router.post('/', createCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

module.exports = router;
