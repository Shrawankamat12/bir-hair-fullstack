const asyncHandler = require('express-async-handler');
const customerService = require('../services/customer.service');

exports.getCustomers = asyncHandler(async (req, res) => {
  const data = await customerService.listAll();
  res.json({ success: true, data });
});

exports.getCustomer = asyncHandler(async (req, res) => {
  const data = await customerService.getById(req.params.id);
  res.json({ success: true, data });
});

exports.createCustomer = asyncHandler(async (req, res) => {
  const data = await customerService.create(req.body);
  res.status(201).json({ success: true, data });
});

exports.updateCustomer = asyncHandler(async (req, res) => {
  const data = await customerService.updateById(req.params.id, req.body);
  res.json({ success: true, data });
});

exports.deleteCustomer = asyncHandler(async (req, res) => {
  await customerService.deleteById(req.params.id);
  res.json({ success: true, message: 'Customer deleted' });
});
