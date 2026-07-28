function adminOnly(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    return next();
  }
  res.status(403);
  throw new Error('Admin access only');
}

// Stricter check for sensitive actions (managing other admin users, roles, settings)
// that shouldn't be delegated to 'staff' accounts. adminOnly still gates the
// whole /admin surface first; this narrows specific routes further.
function requireRole(...roles) {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) return next();
    res.status(403);
    throw new Error(`This action requires one of these roles: ${roles.join(', ')}`);
  };
}

module.exports = { adminOnly, requireRole };
