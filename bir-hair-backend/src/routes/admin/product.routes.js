const router = require('express').Router();
const { getProductsAdmin, getProduct, createProduct, updateProduct, deleteProduct } = require('../../controllers/product.controller');
const validate = require('../../middleware/validate.middleware');
const normalizeProductBody = require('../../middleware/normalizeProductBody.middleware');
const { createProductRules, updateProductRules } = require('../../validators/product.validator');

router.get('/', getProductsAdmin);
router.get('/:idOrSlug', getProduct);
router.post('/', normalizeProductBody, createProductRules, validate, createProduct);
router.put('/:id', normalizeProductBody, updateProductRules, validate, updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
