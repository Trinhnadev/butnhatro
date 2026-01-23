const { cloudinary } = require('../config/cloudinary');

// @desc    Upload images to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
exports.uploadImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: 'Please upload at least one image',
                code: 'NO_FILES',
            });
        }

        // Map uploaded files to return URLs and public IDs
        const images = req.files.map((file) => ({
            url: file.path,
            publicId: file.filename,
        }));

        res.json({
            images,
            message: 'Images uploaded successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private/Admin
exports.deleteImage = async (req, res, next) => {
    try {
        const { publicId } = req.params;

        await cloudinary.uploader.destroy(publicId);

        res.json({
            message: 'Image deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
