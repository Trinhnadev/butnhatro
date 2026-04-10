const cron = require('node-cron');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendViewingReminderEmail } = require('./emailService');

const initCronJobs = () => {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log('🔍 Checking for upcoming viewing appointments...');

            const now = new Date();
            const oneHourLaterStart = new Date(now.getTime() + 55 * 60 * 1000);
            const oneHourLaterEnd = new Date(now.getTime() + 65 * 60 * 1000);

            // Find bookings:
            // 1. Status is 'scheduled'
            // 2. viewTime is roughly 1 hour from now
            // 3. reminderSent is false
            const upcomingBookings = await Booking.find({
                status: 'scheduled',
                reminderSent: { $ne: true },
                viewTime: {
                    $gte: oneHourLaterStart,
                    $lte: oneHourLaterEnd
                }
            }).populate('roomId', 'title');

            if (upcomingBookings.length === 0) {
                return;
            }

            console.log(`⏰ Found ${upcomingBookings.length} upcoming appointments. Sending reminders...`);

            // Get all admin emails
            const admins = await User.find({ role: 'admin' }).select('email');
            const adminEmails = admins.map(admin => admin.email);

            if (adminEmails.length === 0) {
                console.log('⚠️ No admin emails found. Skipping reminders.');
                return;
            }

            for (const booking of upcomingBookings) {
                const success = await sendViewingReminderEmail(booking, adminEmails);
                if (success) {
                    booking.reminderSent = true;
                    await booking.save();
                }
            }
        } catch (error) {
            console.error('❌ Cron job error:', error);
        }
    });

    console.log('🚀 Booking reminder cron job initialized');
};

module.exports = { initCronJobs };
