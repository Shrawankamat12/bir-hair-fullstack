const router = require('express').Router();
const { getAllCouponsAdmin, createCoupon, updateCoupon, deleteCoupon } = require('../../controllers/coupon.controller');
const validate = require('../../middleware/validate.middleware');
const { createCouponRules } = require('../../validators/coupon.validator');

router.get('/', getAllCouponsAdmin);
router.post('/', createCouponRules, validate, createCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;
