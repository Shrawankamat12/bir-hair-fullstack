const router = require('express').Router();
const { getRoles, getRole, createRole, updateRole, deleteRole } = require('../../controllers/role.controller');
const { requireRole } = require('../../middleware/admin.middleware');
const { ROLES } = require('../../constants/roles');

router.get('/', getRoles);
router.get('/:id', getRole);
// Managing roles/permissions is an elevated action — admin only, not staff.
router.post('/', requireRole(ROLES.ADMIN), createRole);
router.put('/:id', requireRole(ROLES.ADMIN), updateRole);
router.delete('/:id', requireRole(ROLES.ADMIN), deleteRole);

module.exports = router;
