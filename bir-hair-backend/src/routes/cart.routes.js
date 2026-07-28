const router = require('express').Router();
const { getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { addToCartRules, updateCartItemRules } = require('../validators/cart.validator');

router.use(protect);
router.get('/', getCart);
router.post('/', addToCartRules, validate, addToCart);
router.put('/:productId', updateCartItemRules, validate, updateCartItem);
router.delete('/:productId', removeCartItem);

module.exports = router;
