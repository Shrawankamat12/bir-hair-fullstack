const router = require('express').Router();
const { getAllOrders, getOrderAdmin, updateOrderStatus, shipOrder } = require('../../controllers/order.controller');
const validate = require('../../middleware/validate.middleware');
const { updateOrderStatusRules } = require('../../validators/order.validator');

router.get('/', getAllOrders);
router.get('/:id', getOrderAdmin);
router.put('/:id', updateOrderStatusRules, validate, updateOrderStatus);
router.post('/:id/ship', shipOrder);

module.exports = router;
