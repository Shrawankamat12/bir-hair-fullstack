const router = require('express').Router();
const { getStatus, createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/payment.controller');
const validate = require('../middleware/validate.middleware');
const { createRazorpayOrderRules, verifyRazorpayRules } = require('../validators/payment.validator');

router.get('/razorpay/status', getStatus);
router.post('/razorpay/order', createRazorpayOrderRules, validate, createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayRules, validate, verifyRazorpayPayment);

module.exports = router;
