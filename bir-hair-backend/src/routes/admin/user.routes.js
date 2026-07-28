const router = require('express').Router();
const { getAllUsersAdmin, getUserAdmin, createUserAdmin, updateUserAdmin, deleteUserAdmin } = require('../../controllers/user.controller');
const { requireRole } = require('../../middleware/admin.middleware');
const { ROLES } = require('../../constants/roles');

router.get('/', getAllUsersAdmin);
router.get('/:id', getUserAdmin);
// Creating staff/admin accounts and changing another user's role/active-state
// are elevated actions — admin only, not staff.
router.post('/', requireRole(ROLES.ADMIN), createUserAdmin);
router.put('/:id', requireRole(ROLES.ADMIN), updateUserAdmin);
router.delete('/:id', requireRole(ROLES.ADMIN), deleteUserAdmin);

module.exports = router;
