const router = require('express').Router();
const { getAllContactsAdmin, updateContactAdmin, deleteContactAdmin } = require('../../controllers/contact.controller');

router.get('/', getAllContactsAdmin);
router.put('/:id', updateContactAdmin);
router.delete('/:id', deleteContactAdmin);

module.exports = router;
