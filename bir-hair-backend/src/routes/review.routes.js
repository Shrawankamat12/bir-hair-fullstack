const router = require('express').Router();
const { getProductReviews, createReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createReviewRules } = require('../validators/review.validator');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReviewRules, validate, createReview);

module.exports = router;
