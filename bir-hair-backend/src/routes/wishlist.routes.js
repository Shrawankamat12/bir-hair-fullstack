const router = require('express').Router();
const { getWishlist, toggleWishlist } = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

module.exports = router;
