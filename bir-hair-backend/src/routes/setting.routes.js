const router = require('express').Router();
const { getPublicSettings } = require('../controllers/setting.controller');

// GET /api/v1/settings — public, read-only, safe subset of Settings
// (shipping thresholds/rates, tax rate, payment link, store contact info).
// Admin read/write stays on /api/v1/admin/settings (routes/admin/setting.routes.js).
router.get('/', getPublicSettings);

module.exports = router;
