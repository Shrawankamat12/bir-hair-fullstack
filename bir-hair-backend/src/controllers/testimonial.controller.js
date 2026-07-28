const asyncHandler = require('express-async-handler');
const testimonialService = require('../services/testimonial.service');

exports.getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.listPublic();
  res.json({ success: true, data: testimonials });
});

exports.getAllTestimonialsAdmin = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.listAll();
  res.json({ success: true, data: testimonials });
});

exports.createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await testimonialService.create(req.body);
  res.status(201).json({ success: true, data: testimonial });
});

exports.updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await testimonialService.updateById(req.params.id, req.body);
  res.json({ success: true, data: testimonial });
});

exports.deleteTestimonial = asyncHandler(async (req, res) => {
  await testimonialService.deleteById(req.params.id);
  res.json({ success: true, message: 'Testimonial deleted' });
});
