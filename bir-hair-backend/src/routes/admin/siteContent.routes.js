const router = require('express').Router();
const { getSiteContent, updateSiteContent } = require('../../controllers/siteContent.controller');
const { requireRole } = require('../../middleware/admin.middleware');
const { ROLES } = require('../../constants/roles');

router.get('/', getSiteContent);
router.put('/', requireRole(ROLES.ADMIN), updateSiteContent);

module.exports = router;
