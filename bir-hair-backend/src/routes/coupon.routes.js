const router = require('express').Router();
const { applyCoupon } = require('../controllers/coupon.controller');
const validate = require('../middleware/validate.middleware');
const { applyCouponRules } = require('../validators/coupon.validator');

router.post('/apply', applyCouponRules, validate, applyCoupon);

module.exports = router;
