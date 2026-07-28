const { body } = require('express-validator');

exports.createOrderRules = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').isMongoId().withMessage('Each item needs a valid product id'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Each item needs a valid price'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('Each item needs a quantity of at least 1'),
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Shipping full name is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Shipping phone is required'),
  body('shippingAddress.line1').trim().notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('Shipping city is required'),
  body('shippingAddress.pincode').trim().notEmpty().withMessage('Shipping pincode is required'),
  body('paymentMethod').optional().isIn(['card', 'upi', 'cod']).withMessage('Invalid payment method'),
];

exports.updateOrderStatusRules = [
  body('status')
    .optional()
    .isIn(['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid order status'),
  body('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid payment status'),
];
