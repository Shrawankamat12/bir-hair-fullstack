const router = require('express').Router();
const { getNotifications, createNotification, updateNotification, deleteNotification, markAllRead } = require('../../controllers/notification.controller');

router.get('/', getNotifications);
router.post('/', createNotification);
router.put('/mark-all-read', markAllRead);
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);

module.exports = router;
