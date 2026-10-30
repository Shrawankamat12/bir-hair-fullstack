const router = require('express').Router();
const {
  getHeroSliderAdmin,
  updateHeroSlider,
  initializeHeroSlider,
} = require('../../controllers/heroSlider.controller');
const { requireRole } = require('../../middleware/admin.middleware');
const { ROLES } = require('../../constants/roles');

// Reading is open to admin + staff (already gated by adminOnly in admin/index.js);
// changing the homepage hero is admin-only, same as site-content.
router.get('/', getHeroSliderAdmin);
router.put('/', requireRole(ROLES.ADMIN), updateHeroSlider);
router.post('/initialize', requireRole(ROLES.ADMIN), initializeHeroSlider);

module.exports = router;