const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { sendBookingNotification } = require('../utils/emailService');
const { sendNotification, sendToAllAdmins } = require('../utils/notificationService');

// Helper lấy io từ app
const getIO = (req) => req.app.get('io');

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

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found', code: 'ROOM_NOT_FOUND' });
        }

        if (room.isArchived) {
            return res.status(400).json({ message: 'This room is not available for booking', code: 'ROOM_ARCHIVED' });
        }

        if (req.user) {
            req.body.userId = req.user.id;
        }

        const booking = await Booking.create(req.body);
        await booking.populate('roomId', 'title priceMonthly location images');

        // Email notification (non-blocking)
        const admins = await User.find({ role: 'admin' }).select('email');
        const adminEmails = admins.map(a => a.email);
        if (adminEmails.length > 0) {
            sendBookingNotification(booking, adminEmails).catch(err =>
                console.error('Background email failed:', err)
            );
        }

        // In-app + Push notification đến tất cả admin
        await sendToAllAdmins(getIO(req), {
            type: 'booking_new',
            title: '📋 Booking mới!',
            message: `${booking.customerName} vừa đặt xem phòng ${room.title}`,
            data: {
                bookingId: booking._id.toString(),
                bookingCode: booking.bookingCode,
                roomTitle: room.title,
                customerName: booking.customerName,
            },
        });

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

        const query = {};

        if (status) query.status = status;
        if (roomId) query.roomId = roomId;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (search) {
            query.$or = [
                { phone: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { bookingCode: { $regex: search, $options: 'i' } },
            ];
        }

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
            pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
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

// @desc    Update booking status (Admin only)
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Please provide status', code: 'MISSING_STATUS' });
        }

        const validStatuses = ['pending', 'contacted', 'scheduled', 'done', 'canceled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status', code: 'INVALID_STATUS' });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('roomId', 'title priceMonthly location');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found', code: 'BOOKING_NOT_FOUND' });
        }

        // Gửi noti cho user nếu booking có userId
        if (booking.userId) {
            let title = '';
            let message = '';
            let type = '';

            if (status === 'scheduled') {
                type = 'booking_scheduled';
                title = '📅 Lịch xem phòng đã được xác nhận!';
                message = `Booking ${booking.bookingCode} đã được xếp lịch xem phòng ${booking.roomId?.title || ''}.`;
            } else if (status === 'done') {
                type = 'booking_done';
                title = '✅ Đã hoàn thành!';
                message = `Booking ${booking.bookingCode} đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ!`;
            } else if (status === 'canceled') {
                type = 'booking_rejected';
                title = '❌ Booking đã bị hủy';
                message = `Booking ${booking.bookingCode} của bạn đã bị hủy bởi quản trị viên.`;
            }

            if (type) {
                await sendNotification(getIO(req), {
                    recipientId: booking.userId,
                    type,
                    title,
                    message,
                    data: {
                        bookingId: booking._id.toString(),
                        bookingCode: booking.bookingCode,
                        roomTitle: booking.roomId?.title,
                    },
                });
            }
        }

        res.json({ booking, message: 'Booking status updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    User hủy booking của mình (chỉ được hủy nếu chưa qua giờ xem)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('roomId', 'title');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found', code: 'BOOKING_NOT_FOUND' });
        }

        // Chỉ cho phép hủy booking của chính mình (chưa qua userId) HOẶC trùng số điện thoại
        const isOwnerById = booking.userId && booking.userId.toString() === req.user.id;
        const isOwnerByPhone = booking.phone === req.user.phone;
        const isAdmin = req.user.role === 'admin';

        if (!isOwnerById && !isOwnerByPhone && !isAdmin) {
            return res.status(403).json({ 
                message: 'Vui lòng đăng nhập đúng tài khoản hoặc số điện thoại đã đặt phòng để hủy.', 
                code: 'FORBIDDEN' 
            });
        }

        // Không được hủy booking đã hủy
        if (booking.status === 'canceled') {
            return res.status(400).json({ message: 'Booking is already canceled', code: 'ALREADY_CANCELED' });
        }

        // Không được hủy booking đã hoàn thành
        if (booking.status === 'done') {
            return res.status(400).json({ message: 'Cannot cancel a completed booking', code: 'BOOKING_DONE' });
        }

        // Kiểm tra giờ xem: chỉ hủy được nếu viewTime chưa qua
        if (booking.viewTime && new Date(booking.viewTime) <= new Date()) {
            return res.status(400).json({
                message: 'Không thể hủy booking đã qua giờ xem phòng',
                code: 'VIEW_TIME_PASSED',
            });
        }

        // Cập nhật status
        booking.status = 'canceled';
        await booking.save();

        // Thông báo cho tất cả admin
        await sendToAllAdmins(getIO(req), {
            type: 'booking_canceled',
            title: '🚫 Khách hủy booking!',
            message: `${booking.customerName} đã hủy booking ${booking.bookingCode} - phòng: ${booking.roomId?.title || 'N/A'}`,
            data: {
                bookingId: booking._id.toString(),
                bookingCode: booking.bookingCode,
                roomTitle: booking.roomId?.title,
                customerName: booking.customerName,
            },
        });

        res.json({ booking, message: 'Booking canceled successfully' });
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
            return res.status(404).json({ message: 'Booking not found', code: 'BOOKING_NOT_FOUND' });
        }

        res.json({ booking });
    } catch (error) {
        next(error);
    }
};
