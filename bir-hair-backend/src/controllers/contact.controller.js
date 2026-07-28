const asyncHandler = require('express-async-handler');
const contactService = require('../services/contact.service');

exports.submitContact = asyncHandler(async (req, res) => {
  const message = await contactService.create(req.body);
  res.status(201).json({ success: true, data: message });
});

exports.getAllContactsAdmin = asyncHandler(async (req, res) => {
  const messages = await contactService.listAll(req.query.status);
  res.json({ success: true, data: messages });
});

// PUT /api/v1/admin/contact-messages/:id — generic update (status change and/or reply text)
exports.updateContactAdmin = asyncHandler(async (req, res) => {
  const message = await contactService.updateById(req.params.id, req.body);
  res.json({ success: true, data: message });
});

exports.deleteContactAdmin = asyncHandler(async (req, res) => {
  await contactService.deleteById(req.params.id);
  res.json({ success: true, message: 'Message deleted' });
});
