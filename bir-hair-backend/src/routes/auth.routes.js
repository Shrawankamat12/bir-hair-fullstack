const router = require('express').Router();
const passport = require('../config/passport');

const {
  register,
  login,
  adminLogin,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  googleCallback,
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


router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/login?error=google_not_configured`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});


// message instead of a raw JSON error page.
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const message = encodeURIComponent(err?.message || 'Google sign-in failed. Please try again.');
      return res.redirect(`${clientUrl}/login?error=google_failed&message=${message}`);
    }
    req.user = user;
    next();
  })(req, res, next);
}, googleCallback);

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