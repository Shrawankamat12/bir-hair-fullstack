const router = require('express').Router();
const { getBrands, getBrand } = require('../controllers/brand.controller');

router.get('/', getBrands);
router.get('/:id', getBrand);

module.exports = router;
