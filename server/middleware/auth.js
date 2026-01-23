const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            message: 'Not authorized to access this route',
            code: 'UNAUTHORIZED',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-passwordHash');

        if (!req.user) {
            return res.status(401).json({
                message: 'User not found',
                code: 'USER_NOT_FOUND',
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Not authorized, token failed',
            code: 'INVALID_TOKEN',
        });
    }
};

// Generate JWT token
exports.generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};
