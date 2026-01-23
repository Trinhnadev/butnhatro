const express = require('express');
const { uploadImages, deleteImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Admin only routes
router.post(
    '/',
    protect,
    authorize('admin'),
    upload.array('images', 30),
    uploadImages
);

router.delete('/:publicId', protect, authorize('admin'), deleteImage);

module.exports = router;
