const asyncHandler = require('express-async-handler');
const orderService = require('../services/order.service');
const shippingService = require('../services/shipping.service');

// POST /api/v1/orders  (works for logged-in users and guest checkout)
exports.createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user, req.body);
  res.status(201).json({ success: true, data: order });
});

// GET /api/v1/orders/my
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getMyOrders(req.user._id);
  res.json({ success: true, data: orders });
});

// GET /api/v1/orders/:id  (id can be Mongo _id or human orderNumber)
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getByIdOrOrderNumber(req.params.id);
  res.json({ success: true, data: order });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.listAll(req.query.status);
  res.json({ success: true, data: orders });
});

// GET /api/v1/admin/orders/:id — full decorated order for the admin
// Order Details / Invoice / Packing-Slip / Shipping-Label pages
exports.getOrderAdmin = asyncHandler(async (req, res) => {
  const order = await orderService.getByIdAdmin(req.params.id);
  res.json({ success: true, data: order });
});

// PATCH /api/v1/admin/orders/:id/status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.params.id, req.body);
  res.json({ success: true, data: order });
});

// POST /api/v1/admin/orders/:id/ship — creates a Shiprocket shipment + AWB for this order.
exports.shipOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getByIdOrOrderNumber(req.params.id);

  const { shipmentId } = await shippingService.createShipment(order);
  const { awbCode, courierName } = await shippingService.assignAwb(shipmentId);

  const updated = await orderService.updateById(order._id, {
    shipping: {
      shipmentId,
      awbNumber: awbCode,
      courierPartner: courierName,
      trackingNumber: awbCode,
      shippedAt: new Date(),
    },
    orderStatus: 'shipped',
  });

  res.json({ success: true, data: updated });
});