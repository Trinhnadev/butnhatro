const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        passwordHash: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 6,
            select: false,
        },
        phone: {
            type: String,
            required: [true, 'Please provide a phone number'],
            unique: true,
            trim: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },

        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) {
        return;
    }

    // Check if password is already hashed (starts with $2a$ or $2b$ and is 60 chars)
    // This prevents double hashing when moving from PendingUser to User
    if ((this.passwordHash.startsWith('$2a$') || this.passwordHash.startsWith('$2b$')) && this.passwordHash.length === 60) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
