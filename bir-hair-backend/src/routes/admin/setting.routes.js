const router = require('express').Router();
const { getSettings, updateSettings } = require('../../controllers/setting.controller');
const { requireRole } = require('../../middleware/admin.middleware');
const { ROLES } = require('../../constants/roles');

router.get('/', getSettings);
router.put('/', requireRole(ROLES.ADMIN), updateSettings);

module.exports = router;
