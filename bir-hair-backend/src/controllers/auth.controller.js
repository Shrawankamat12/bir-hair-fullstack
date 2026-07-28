const asyncHandler = require('express-async-handler');
const authService = require('../services/auth.service');

// POST /api/v1/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.cookie('token', token, { httpOnly: true }).status(201).json({
    success: true,
    user: authService.toPublicUser(user),
    token,
  });
});

// POST /api/v1/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.cookie('token', token, { httpOnly: true }).json({
    success: true,
    user: authService.toPublicUser(user),
    token,
  });
});

// POST /api/v1/auth/admin-login  (same as login but only allows admin/staff)
exports.adminLogin = asyncHandler(async (req, res) => {
  const { user, token } = await authService.adminLogin(req.body);
  res.cookie('token', token, { httpOnly: true }).json({
    success: true,
    user: authService.toPublicUser(user),
    token,
  });
});

// GET /api/v1/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// POST /api/v1/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('token').json({ success: true, message: 'Logged out' });
});
