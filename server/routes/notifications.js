const express = require('express');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/notifications
 * Get notifications for the authenticated user (latest 50)
 */
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    return res.json({ data: { notifications, unreadCount }, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ data: null, error: 'Notification not found' });

    return res.json({ data: notification, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the user
 */
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    return res.json({ data: { message: 'All notifications marked as read' }, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!notification) return res.status(404).json({ data: null, error: 'Notification not found' });

    return res.json({ data: { message: 'Notification deleted' }, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * POST /api/notifications (admin only)
 * Create a notification for a user
 */
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { userId, title, message, type, data, link } = req.body;
    if (!userId || !title || !message || !type) {
      return res.status(400).json({ data: null, error: 'userId, title, message, type are required' });
    }

    const notification = await Notification.create({ userId, title, message, type, data, link });
    return res.status(201).json({ data: notification, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
