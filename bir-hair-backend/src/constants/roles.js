// Central place for role + permission definitions.
// Route-level checks still use adminOnly/protect exactly as before (no behavior change),
// this module just gives Phase 2+ (granular permissions) somewhere to plug into.

const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  STAFF: 'staff',
});

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.STAFF];

// Placeholder permission map — not enforced yet, reserved for a future
// granular-permissions middleware so we don't have to touch routes again later.
const PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: ['*'],
  [ROLES.STAFF]: [
    'products:read', 'products:write',
    'orders:read', 'orders:write',
    'categories:read', 'categories:write',
  ],
  [ROLES.CUSTOMER]: [],
});

module.exports = { ROLES, ADMIN_ROLES, PERMISSIONS };
