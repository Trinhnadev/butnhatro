const express = require('express');
const {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    archiveRoom,
    unarchiveRoom,
    deleteRoom,
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Public routes
router.get('/', getRooms);
router.get('/:id', getRoom);

// Admin routes
router.post('/', protect, authorize('admin'), createRoom);
router.put('/:id', protect, authorize('admin'), updateRoom);
router.patch('/:id/archive', protect, authorize('admin'), archiveRoom);
router.patch('/:id/unarchive', protect, authorize('admin'), unarchiveRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

module.exports = router;
