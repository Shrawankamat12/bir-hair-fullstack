const router = require('express').Router();

const {
  register,
  login,
  adminLogin,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../validators/auth.validator');

const { authLimiter } = require('../middleware/rateLimiter.middleware');

// Register
router.post(
  '/register',
  authLimiter,
  registerRules,
  validate,
  register
);

// Login
router.post(
  '/login',
  authLimiter,
  loginRules,
  validate,
  login
);

// Admin Login
router.post(
  '/admin-login',
  authLimiter,
  loginRules,
  validate,
  adminLogin
);

// Current user
router.get('/me', protect, getMe);

// Logout
router.post('/logout', logout);

// Forgot password
router.post(
  '/forgot-password',
  forgotPasswordRules,
  validate,
  forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  resetPasswordRules,
  validate,
  resetPassword
);

// Change password
router.post('/change-password', protect, changePassword);

module.exports = router;