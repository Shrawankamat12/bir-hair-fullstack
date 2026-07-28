const asyncHandler = require('express-async-handler');
const newsletterService = require('../services/newsletter.service');

exports.subscribe = asyncHandler(async (req, res) => {
  const sub = await newsletterService.subscribe(req.body.email);
  res.status(201).json({ success: true, data: sub, message: 'Subscribed!' });
});

exports.getAllSubscribersAdmin = asyncHandler(async (req, res) => {
  const subs = await newsletterService.listAll();
  res.json({ success: true, data: subs });
});

exports.deleteSubscriberAdmin = asyncHandler(async (req, res) => {
  await newsletterService.deleteById(req.params.id);
  res.json({ success: true, message: 'Subscriber removed' });
});
