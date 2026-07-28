const router = require('express').Router();
const { register, login, adminLogin, getMe, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { registerRules, loginRules } = require('../validators/auth.validator');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/admin-login', authLimiter, loginRules, validate, adminLogin);
router.get('/me', protect, getMe);
router.post('/logout', logout);

module.exports = router;
