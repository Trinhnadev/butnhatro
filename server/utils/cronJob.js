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
            
            // 1. Auto-transition Pending -> Scheduled (1h15m before)
            // Range: [now + 70 mins, now + 80 mins] to ensure it catches bookings around the 75-min mark
            const seventyFiveMinsStart = new Date(now.getTime() + 70 * 60 * 1000);
            const seventyFiveMinsEnd = new Date(now.getTime() + 80 * 60 * 1000);
            
            const autoScheduled = await Booking.updateMany(
                {
                    status: 'pending',
                    viewTime: { $gte: seventyFiveMinsStart, $lte: seventyFiveMinsEnd }
                },
                { status: 'scheduled' }
            );
            
            if (autoScheduled.modifiedCount > 0) {
                console.log(`✅ Auto-scheduled ${autoScheduled.modifiedCount} pending bookings (1h15m before viewing)`);
            }

            // 2. Send Reminders (1h before)
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
            }).populate('roomId', 'title images priceMonthly location');

            if (upcomingBookings.length === 0) {
                return;
            }

            console.log(`⏰ Found ${upcomingBookings.length} upcoming appointments. Sending reminders...`);

            // Get all admin emails
            const admins = await User.find({ role: 'admin' }).select('email');
            const adminEmails = admins.map(admin => admin.email);

            for (const booking of upcomingBookings) {
                // 1. Send to Admin (Mandatory)
                if (adminEmails.length > 0) {
                    await sendViewingReminderEmail(booking, adminEmails, false);
                }

                // 2. Send to Guest (if account found by phone)
                const guestUser = await User.findOne({ phone: booking.phone }).select('email');
                if (guestUser && guestUser.email) {
                    await sendViewingReminderEmail(booking, guestUser.email, true);
                }

                // Mark as sent
                booking.reminderSent = true;
                await booking.save();
            }
        } catch (error) {
            console.error('❌ Cron job error:', error);
        }
    });

    console.log('🚀 Booking reminder cron job initialized');
};

module.exports = { initCronJobs };
