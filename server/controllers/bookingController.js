const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { sendBookingNotification } = require('../utils/emailService');

// @desc    Search bookings by phone (Public)
// @route   GET /api/bookings/search
// @access  Public
exports.searchBookings = async (req, res, next) => {
    try {
        const { phone } = req.query;

        if (!phone) {
            return res.status(400).json({
                message: 'Please provide phone number',
                code: 'MISSING_PHONE',
            });
        }

        const bookings = await Booking.find({ phone })
            .populate('roomId', 'title priceMonthly location images')
            .sort({ createdAt: -1 });

        res.json({
            bookings,
            count: bookings.length,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res, next) => {
    try {
        const { roomId } = req.body;

        // Check if room exists and is not archived
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                message: 'Room not found',
                code: 'ROOM_NOT_FOUND',
            });
        }

        if (room.isArchived) {
            return res.status(400).json({
                message: 'This room is not available for booking',
                code: 'ROOM_ARCHIVED',
            });
        }

        // Add userId if user is logged in
        if (req.user) {
            req.body.userId = req.user.id;
        }

        const booking = await Booking.create(req.body);

        const User = require('../models/User'); // Ensure User model is imported at top

        // ... inside createBooking ...

        // Populate room details
        await booking.populate('roomId', 'title priceMonthly location images');

        // Get all admin emails
        const admins = await User.find({ role: 'admin' }).select('email');
        const adminEmails = admins.map(admin => admin.email);

        // Send Email Notification (Non-blocking)
        if (adminEmails.length > 0) {
            sendBookingNotification(booking, adminEmails).catch(err => console.error('Background email failed:', err));
        }

        res.status(201).json({
            booking,
            bookingCode: booking.bookingCode,
            message: 'Booking created successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getBookings = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            roomId,
            startDate,
            endDate,
            search,
        } = req.query;

        // Build query
        const query = {};

        if (status) {
            query.status = status;
        }

        if (roomId) {
            query.roomId = roomId;
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Search by phone or name
        if (search) {
            query.$or = [
                { phone: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { bookingCode: { $regex: search, $options: 'i' } },
            ];
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const bookings = await Booking.find(query)
            .populate('roomId', 'title priceMonthly location')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Booking.countDocuments(query);

        res.json({
            bookings,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's own bookings
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('roomId', 'title priceMonthly location images')
            .sort({ createdAt: -1 });

        res.json({ bookings });
    } catch (error) {
        next(error);
    }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: 'Please provide status',
                code: 'MISSING_STATUS',
            });
        }

        const validStatuses = ['pending', 'contacted', 'scheduled', 'done', 'canceled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status',
                code: 'INVALID_STATUS',
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('roomId', 'title priceMonthly location');

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found',
                code: 'BOOKING_NOT_FOUND',
            });
        }

        res.json({
            booking,
            message: 'Booking status updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private/Admin
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('roomId', 'title priceMonthly location images')
            .populate('userId', 'name email');

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found',
                code: 'BOOKING_NOT_FOUND',
            });
        }

        res.json({ booking });
    } catch (error) {
        next(error);
    }
};
