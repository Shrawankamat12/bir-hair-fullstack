const router = require('express').Router();
const { getAllReviewsAdmin, updateReviewAdmin, approveReview, replyToReview, deleteReview } = require('../../controllers/review.controller');

router.get('/', getAllReviewsAdmin);
router.put('/:id', updateReviewAdmin);
router.put('/:id/approve', approveReview);
router.post('/:id/reply', replyToReview);
router.delete('/:id', deleteReview);

module.exports = router;
