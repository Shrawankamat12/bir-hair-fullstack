const router = require('express').Router();
const { getTestimonials } = require('../controllers/testimonial.controller');

router.get('/', getTestimonials);

module.exports = router;
