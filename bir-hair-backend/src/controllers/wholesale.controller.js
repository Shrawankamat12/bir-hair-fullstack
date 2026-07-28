const asyncHandler = require('express-async-handler');
const wholesaleService = require('../services/wholesale.service');

exports.submitWholesaleInquiry = asyncHandler(async (req, res) => {
  const inquiry = await wholesaleService.create(req.body);
  res.status(201).json({ success: true, data: inquiry });
});

exports.getAllInquiriesAdmin = asyncHandler(async (req, res) => {
  const inquiries = await wholesaleService.listAll(req.query.status);
  res.json({ success: true, data: inquiries });
});

exports.updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await wholesaleService.updateById(req.params.id, req.body);
  res.json({ success: true, data: inquiry });
});

exports.deleteInquiry = asyncHandler(async (req, res) => {
  await wholesaleService.deleteById(req.params.id);
  res.json({ success: true, message: 'Inquiry deleted' });
});
