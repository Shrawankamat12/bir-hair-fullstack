const router = require('express').Router();
const { getAttributes, getAttribute, createAttribute, updateAttribute, deleteAttribute } = require('../../controllers/attribute.controller');

router.get('/', getAttributes);
router.get('/:id', getAttribute);
router.post('/', createAttribute);
router.put('/:id', updateAttribute);
router.delete('/:id', deleteAttribute);

module.exports = router;
