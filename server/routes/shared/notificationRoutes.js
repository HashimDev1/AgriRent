const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../../controllers/shared/notificationController');
const { protect } = require('../../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
