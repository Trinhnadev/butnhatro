const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'user',
        },
        otp: {
            type: String,
            required: true,
        },
        otpExpires: {
            type: Date,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 600, // 10 minutes TTL
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('PendingUser', pendingUserSchema);
