const { body } = require('express-validator');

exports.createOrderRules = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').isMongoId().withMessage('Each item needs a valid product id'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Each item needs a valid unit price'),
  body('items.*.discount').optional().isFloat({ min: 0 }).withMessage('Item discount must be a positive number'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item needs a quantity of at least 1'),

  body('shippingAddress.fullName').trim().notEmpty().withMessage('Shipping full name is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Shipping phone is required'),
  body('shippingAddress.line1').trim().notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('Shipping city is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('Shipping state is required'),
  body('shippingAddress.pincode').trim().notEmpty().withMessage('Shipping pincode is required'),

  body('billingAddress').optional(),
  body('billingAddress.fullName').if(body('billingAddress').exists()).trim().notEmpty().withMessage('Billing full name is required'),
  body('billingAddress.phone').if(body('billingAddress').exists()).trim().notEmpty().withMessage('Billing phone is required'),
  body('billingAddress.line1').if(body('billingAddress').exists()).trim().notEmpty().withMessage('Billing address is required'),
  body('billingAddress.city').if(body('billingAddress').exists()).trim().notEmpty().withMessage('Billing city is required'),
  body('billingAddress.state').if(body('billingAddress').exists()).trim().notEmpty().withMessage('Billing state is required'),
  body('billingAddress.pincode').if(body('billingAddress').exists()).trim().notEmpty().withMessage('Billing pincode is required'),

  body('shippingMethod').optional().isIn(['standard', 'express']).withMessage('Invalid shipping method'),
  body('paymentMethod').optional().isIn(['card', 'upi', 'netbanking', 'wallet', 'cod']).withMessage('Invalid payment method'),
  body('couponCode').optional().trim(),
  body('couponDiscount').optional().isFloat({ min: 0 }).withMessage('Coupon discount must be a positive number'),
  body('orderSource').optional().isIn(['Website', 'Admin', 'Mobile']).withMessage('Invalid order source'),
];

exports.updateOrderStatusRules = [
  body('orderStatus')
    .optional()
    .isIn([
      'pending',
      'placed',
      'confirmed',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned',
      'refunded',
    ])
    .withMessage('Invalid order status'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded'])
    .withMessage('Invalid payment status'),
  body('trackingNumber').optional().trim(),
  body('note').optional().trim(),
];