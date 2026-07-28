const router = require('express').Router();
const { getProducts, getProduct, getProductsByBadge, getProductsByFlag } = require('../controllers/product.controller');

router.get('/', getProducts);
router.get('/badge/:badge', getProductsByBadge);
router.get('/flag/:flag', getProductsByFlag);
router.get('/:idOrSlug', getProduct);

module.exports = router;
