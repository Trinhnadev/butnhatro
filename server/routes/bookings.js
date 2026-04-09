const express = require('express');
const {
    createBooking,
    searchBookings,
    getBookings,
    getMyBookings,
    updateBookingStatus,
    cancelBooking,
    getBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Public route (can be used with or without auth)
router.get('/search', searchBookings);
router.post('/', createBooking);

// User routes
router.get('/my', protect, getMyBookings);
router.patch('/:id/cancel', protect, cancelBooking);

// Admin routes
router.get('/', protect, authorize('admin'), getBookings);
router.get('/:id', protect, authorize('admin'), getBooking);
router.patch('/:id/status', protect, authorize('admin'), updateBookingStatus);

module.exports = router;
