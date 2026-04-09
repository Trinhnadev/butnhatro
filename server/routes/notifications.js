const express = require('express');
const {
    getNotifications,
    markRead,
    markAllRead,
    savePushSubscription,
    getVapidKey,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Notifications
router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markRead);

// Push
router.get('/push/vapid-key', getVapidKey);
router.post('/push/subscribe', protect, savePushSubscription);

module.exports = router;
