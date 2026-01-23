const express = require('express');
const {
    createBooking,
    getBookings,
    getMyBookings,
    updateBookingStatus,
    getBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Public route (can be used with or without auth)
router.post('/', createBooking);

// User routes
router.get('/my', protect, getMyBookings);

// Admin routes
router.get('/', protect, authorize('admin'), getBookings);
router.get('/:id', protect, authorize('admin'), getBooking);
router.patch('/:id/status', protect, authorize('admin'), updateBookingStatus);

module.exports = router;
