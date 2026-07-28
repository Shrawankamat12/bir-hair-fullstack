const asyncHandler = require('express-async-handler');
const reportService = require('../services/report.service');

exports.salesReport = asyncHandler(async (req, res) => {
  const data = await reportService.sales(req.query);
  res.json({ success: true, data });
});
exports.ordersReport = asyncHandler(async (req, res) => {
  const data = await reportService.orders();
  res.json({ success: true, data });
});
exports.customersReport = asyncHandler(async (req, res) => {
  const data = await reportService.customers();
  res.json({ success: true, data });
});
exports.inventoryReport = asyncHandler(async (req, res) => {
  const data = await reportService.inventory();
  res.json({ success: true, data });
});
exports.productsReport = asyncHandler(async (req, res) => {
  const data = await reportService.products();
  res.json({ success: true, data });
});
