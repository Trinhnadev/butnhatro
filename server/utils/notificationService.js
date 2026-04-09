const webpush = require('web-push');

webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

const PushSubscription = require('../models/PushSubscription');
const Notification = require('../models/Notification');

/**
 * Tạo notification trong DB + emit socket event + gửi Web Push
 */
const sendNotification = async (io, { recipientId, type, title, message, data, role }) => {
    try {
        // 1. Lưu vào DB
        const noti = await Notification.create({ recipient: recipientId, type, title, message, data });

        // 2. Emit realtime qua socket (nếu user đang online)
        if (io) {
            io.to(`user:${recipientId}`).emit('notification', {
                _id: noti._id,
                type, title, message, data,
                read: false,
                createdAt: noti.createdAt,
            });
        }

        // 3. Gửi Web Push đến tất cả subscriptions của user
        const subscriptions = await PushSubscription.find({ userId: recipientId });
        const payload = JSON.stringify({ title, body: message, data });

        const pushPromises = subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(sub.subscription, payload);
            } catch (err) {
                // Subscription hết hạn → xóa
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await PushSubscription.deleteOne({ _id: sub._id });
                }
            }
        });
        await Promise.allSettled(pushPromises);

        return noti;
    } catch (err) {
        console.error('sendNotification error:', err.message);
    }
};

/**
 * Gửi notification đến tất cả admin
 */
const sendToAllAdmins = async (io, { type, title, message, data }) => {
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(admins.map(admin =>
        sendNotification(io, { recipientId: admin._id, type, title, message, data, role: 'admin' })
    ));
};

module.exports = { sendNotification, sendToAllAdmins };
