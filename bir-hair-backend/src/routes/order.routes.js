const router = require('express').Router();
const { createOrder, getMyOrders, getOrder } = require('../controllers/order.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createOrderRules } = require('../validators/order.validator');

router.post('/', optionalAuth, createOrderRules, validate, createOrder);   // guest or logged-in — req.user set hoga agar login hai
router.get('/my', protect, getMyOrders);
router.get('/:id', getOrder);                                // also used for order tracking by orderNumber

module.exports = router;