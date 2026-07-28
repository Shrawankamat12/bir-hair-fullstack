const asyncHandler = require('express-async-handler');
const faqService = require('../services/faq.service');

exports.getFaqs = asyncHandler(async (req, res) => {
  const faqs = await faqService.listPublic();
  res.json({ success: true, data: faqs });
});

exports.getAllFaqsAdmin = asyncHandler(async (req, res) => {
  const faqs = await faqService.listAll();
  res.json({ success: true, data: faqs });
});

exports.createFaq = asyncHandler(async (req, res) => {
  const faq = await faqService.create(req.body);
  res.status(201).json({ success: true, data: faq });
});

exports.updateFaq = asyncHandler(async (req, res) => {
  const faq = await faqService.updateById(req.params.id, req.body);
  res.json({ success: true, data: faq });
});

exports.deleteFaq = asyncHandler(async (req, res) => {
  await faqService.deleteById(req.params.id);
  res.json({ success: true, message: 'FAQ deleted' });
});
