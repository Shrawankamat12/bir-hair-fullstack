const asyncHandler = require('express-async-handler');
const notificationService = require('../services/notification.service');

exports.getNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.listAll();
  res.json({ success: true, data });
});

exports.createNotification = asyncHandler(async (req, res) => {
  const data = await notificationService.push(req.body);
  res.status(201).json({ success: true, data });
});

exports.updateNotification = asyncHandler(async (req, res) => {
  const data = await notificationService.updateById(req.params.id, req.body);
  res.json({ success: true, data });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteById(req.params.id);
  res.json({ success: true, message: 'Notification deleted' });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead();
  res.json({ success: true, message: 'All notifications marked as read' });
});
