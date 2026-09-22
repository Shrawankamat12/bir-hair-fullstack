const router = require('express').Router();
const { getStatus } = require('../controllers/payment.controller');

// GET /api/v1/payments/status — { configured, paymentLink }
router.get('/status', getStatus);

module.exports = router;