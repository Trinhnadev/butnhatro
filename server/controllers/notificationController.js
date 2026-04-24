const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const webpush = require('web-push');

// @desc  Lấy danh sách noti của user đang login
// @route GET /api/notifications
// @access Private
exports.getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const unreadCount = await Notification.countDocuments({ recipient: req.user.id, read: false });
        const total = await Notification.countDocuments({ recipient: req.user.id });

        res.json({ 
            notifications, 
            unreadCount,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Đánh dấu 1 noti đã đọc
// @route PUT /api/notifications/:id/read
// @access Private
exports.markRead = async (req, res, next) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { read: true }
        );
        res.json({ message: 'Marked as read' });
    } catch (error) {
        next(error);
    }
};

// @desc  Đánh dấu tất cả đã đọc
// @route PUT /api/notifications/read-all
// @access Private
exports.markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { read: true }
        );
        res.json({ message: 'All marked as read' });
    } catch (error) {
        next(error);
    }
};

// @desc  Lưu Web Push subscription
// @route POST /api/push/subscribe
// @access Private
exports.savePushSubscription = async (req, res, next) => {
    try {
        const { subscription } = req.body;
        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ message: 'Invalid subscription' });
        }

        // Upsert: cập nhật nếu đã có, tạo mới nếu chưa
        await PushSubscription.findOneAndUpdate(
            { 'subscription.endpoint': subscription.endpoint },
            {
                userId: req.user.id,
                role: req.user.role,
                subscription,
            },
            { upsert: true, new: true }
        );

        res.json({ message: 'Subscription saved' });
    } catch (error) {
        next(error);
    }
};

// @desc  Trả về VAPID public key
// @route GET /api/push/vapid-key
// @access Public
exports.getVapidKey = (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};
