const router = require('express').Router();
const { getAllInquiriesAdmin, updateInquiry, deleteInquiry } = require('../../controllers/wholesale.controller');

router.get('/', getAllInquiriesAdmin);
router.put('/:id', updateInquiry);
router.delete('/:id', deleteInquiry);

module.exports = router;
