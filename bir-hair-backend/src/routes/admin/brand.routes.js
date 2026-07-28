const router = require('express').Router();
const { getBrands, getBrand, createBrand, updateBrand, deleteBrand } = require('../../controllers/brand.controller');

router.get('/', getBrands);
router.get('/:id', getBrand);
router.post('/', createBrand);
router.put('/:id', updateBrand);
router.delete('/:id', deleteBrand);

module.exports = router;
