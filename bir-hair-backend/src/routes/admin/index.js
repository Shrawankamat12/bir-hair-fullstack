const router = require('express').Router();
const { protect } = require('../../middleware/auth.middleware');
const { adminOnly } = require('../../middleware/admin.middleware');

// everything under /api/v1/admin requires a logged-in admin/staff user
router.use(protect, adminOnly);

router.use('/dashboard', require('./dashboard.routes'));
router.use('/products', require('./product.routes'));
router.use('/categories', require('./category.routes'));
router.use('/subcategories', require('./subcategory.routes'));
router.use('/brands', require('./brand.routes'));
router.use('/collections', require('./collection.routes'));
router.use('/attributes', require('./attribute.routes'));
router.use('/inventory', require('./inventory.routes'));
router.use('/orders', require('./order.routes'));
router.use('/customers', require('./customer.routes'));
router.use('/users', require('./user.routes'));
router.use('/roles', require('./role.routes'));
router.use('/activity-logs', require('./activityLog.routes'));
router.use('/blogs', require('./blog.routes'));
router.use('/blog-categories', require('./blogCategory.routes'));
router.use('/blog-comments', require('./blogComment.routes'));
router.use('/testimonials', require('./testimonial.routes'));
router.use('/faqs', require('./faq.routes'));
router.use('/banners', require('./banner.routes'));
router.use('/coupons', require('./coupon.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/contact-messages', require('./contact.routes'));
router.use('/wholesale-inquiries', require('./wholesale.routes'));
router.use('/newsletter', require('./newsletter.routes'));
router.use('/newsletter-subscribers', require('./newsletter.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/media', require('./media.routes'));
router.use('/reports', require('./report.routes'));
router.use('/settings', require('./setting.routes'));
router.use('/site-content', require('./siteContent.routes'));
router.use('/upload', require('./upload.routes'));

module.exports = router;
