const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            required: true,
        },
        subscription: {
            endpoint: { type: String, required: true },
            keys: {
                p256dh: { type: String, required: true },
                auth: { type: String, required: true },
            },
        },
    },
    { timestamps: true }
);

// 1 user có thể có nhiều device
pushSubscriptionSchema.index({ userId: 1 });
// unique theo endpoint (1 device - 1 subscription)
pushSubscriptionSchema.index({ 'subscription.endpoint': 1 }, { unique: true });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
