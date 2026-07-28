const router = require('express').Router();
const { getAllTestimonialsAdmin, createTestimonial, updateTestimonial, deleteTestimonial } = require('../../controllers/testimonial.controller');

router.get('/', getAllTestimonialsAdmin);
router.post('/', createTestimonial);
router.put('/:id', updateTestimonial);
router.delete('/:id', deleteTestimonial);

module.exports = router;
