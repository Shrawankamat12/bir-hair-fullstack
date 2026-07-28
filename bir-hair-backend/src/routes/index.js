const router = require('express').Router();

// ---- Public / storefront routes ----
router.use('/auth', require('./auth.routes'));
router.use('/products', require('./product.routes'));
router.use('/categories', require('./category.routes'));
router.use('/blogs', require('./blog.routes'));
router.use('/testimonials', require('./testimonial.routes'));
router.use('/faqs', require('./faq.routes'));
router.use('/banners', require('./banner.routes'));
router.use('/coupons', require('./coupon.routes'));
router.use('/contact', require('./contact.routes'));
router.use('/wholesale', require('./wholesale.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/site-content', require('./siteContent.routes'));
router.use('/brands', require('./brand.routes'));
router.use('/collections', require('./collection.routes'));
router.use('/subcategories', require('./subcategory.routes'));
router.use('/attributes', require('./attribute.routes'));

// ---- Logged-in customer routes ----
router.use('/cart', require('./cart.routes'));
router.use('/wishlist', require('./wishlist.routes'));
router.use('/orders', require('./order.routes'));
router.use('/users', require('./user.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/newsletter', require('./newsletter.routes'));

// ---- Admin panel routes (protected + adminOnly inside) ----
router.use('/admin', require('./admin/index'));

module.exports = router;
