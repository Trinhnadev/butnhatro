const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const { generateToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // 1. Check if user already exists in main User collection
        const userExists = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (userExists) {
            return res.status(400).json({
                message: 'User already exists with this email or phone number',
                code: 'USER_EXISTS',
            });
        }

        // 2. Check/Update PendingUser - delete old pending with same email/phone
        await PendingUser.deleteOne({ $or: [{ email }, { phone }] });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // 3. Hash password manually since we are saving to PendingUser which might not have the hook
        // (Step 506 note: I added hooks to User but PendingUser needs manual or its own hook)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Create PendingUser
        await PendingUser.create({
            name,
            email,
            phone,
            passwordHash,
            role: role || 'user',
            otp,
            otpExpires
        });

        // 5. Send OTP
        const message = `Mã xác thực của bạn là: ${otp}. Mã này sẽ hết hạn trong 10 phút.`;

        await sendEmail({
            to: email,
            subject: 'Mã xác thực đăng ký - Hades House',
            text: message,
            html: `<h3>Xin chào ${name},</h3><p>Cảm ơn bạn đã đăng ký tài khoản tại Hades House.</p><p>Mã xác thực của bạn là: <strong style="font-size: 24px;">${otp}</strong></p><p>Mã này sẽ hết hạn trong 10 phút.</p>`,
        });

        res.status(201).json({
            message: 'OTP sent to email',
            email,
            requireOtp: true
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Verify OTP and Create Account
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }

        // 1. Find in PendingUser
        const pendingUser = await PendingUser.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!pendingUser) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // 2. Create actual User
        // Note: passwordHash is already hashed in PendingUser
        const newUser = await User.create({
            name: pendingUser.name,
            email: pendingUser.email,
            phone: pendingUser.phone,
            passwordHash: pendingUser.passwordHash,
            role: pendingUser.role,
            isVerified: true
        });

        // 3. Delete PendingUser
        await PendingUser.deleteOne({ _id: pendingUser._id });

        // Generate token
        const token = generateToken(newUser._id);

        res.json({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        console.log('Resend OTP requested for:', email);

        if (!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }

        // Check if user already exists in main User table
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Account already verified. Please login.' });
        }

        // Find in PendingUser
        const pendingUser = await PendingUser.findOne({ email });

        if (!pendingUser) {
            return res.status(404).json({ message: 'Registration session expired. Please register again.' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        pendingUser.otp = otp;
        pendingUser.otpExpires = otpExpires;
        await pendingUser.save();

        // Send OTP via email
        const message = `Mã xác thực mới của bạn là: ${otp}. Mã này sẽ hết hạn trong 10 phút.`;

        await sendEmail({
            to: email,
            subject: 'Gửi lại mã xác thực - Hades House',
            text: message,
            html: `<h3>Xin chào ${pendingUser.name},</h3><p>Đây là mã xác thực mới của bạn.</p><p>Mã xác thực: <strong style="font-size: 24px;">${otp}</strong></p><p>Mã này sẽ hết hạn trong 10 phút.</p>`,
        });

        res.json({ message: 'New OTP sent to email' });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { loginInput, password } = req.body; // loginInput can be email or phone

        // Validate
        if (!loginInput || !password) {
            return res.status(400).json({
                message: 'Please provide email/phone and password',
                code: 'MISSING_CREDENTIALS',
            });
        }

        // Check for user by email OR phone
        // Determine if input looks like an email
        const isEmail = loginInput.includes('@');
        const query = isEmail ? { email: loginInput } : { phone: loginInput };

        const user = await User.findOne(query).select('+passwordHash');

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS',
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS',
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};
