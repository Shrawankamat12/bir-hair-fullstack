const router = require('express').Router();
const { getActivityLogs } = require('../../controllers/activityLog.controller');

router.get('/', getActivityLogs);

module.exports = router;
