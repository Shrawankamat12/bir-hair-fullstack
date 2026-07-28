const router = require('express').Router();
const { getAllFaqsAdmin, createFaq, updateFaq, deleteFaq } = require('../../controllers/faq.controller');

router.get('/', getAllFaqsAdmin);
router.post('/', createFaq);
router.put('/:id', updateFaq);
router.delete('/:id', deleteFaq);

module.exports = router;
