// Global error handler
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error('Error:', err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, code: 'RESOURCE_NOT_FOUND' };
        return res.status(404).json(error);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        error = { message, code: 'DUPLICATE_FIELD' };
        return res.status(400).json(error);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message);
        error = { message, code: 'VALIDATION_ERROR' };
        return res.status(400).json(error);
    }

    res.status(err.statusCode || 500).json({
        message: error.message || 'Server Error',
        code: error.code || 'SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
