const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: [true, 'Room ID is required'],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        customerName: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [
                /^(0|\+84)[0-9]{9,10}$/,
                'Please provide a valid Vietnamese phone number',
            ],
        },
        desiredArea: {
            type: String,
            trim: true,
        },
        peopleCount: {
            type: Number,
            required: [true, 'Number of people is required'],
            min: 1,
        },
        budgetMax: {
            type: Number,
            min: 0,
        },
        notes: {
            type: String,
            trim: true,
        },
        viewTime: {
            type: Date,
        },
        moveInDate: {
            type: Date,
            required: [true, 'Move-in date is required'],
        },
        status: {
            type: String,
            enum: ['pending', 'contacted', 'scheduled', 'done', 'canceled'],
            default: 'pending',
        },
        bookingCode: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
bookingSchema.index({ roomId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ phone: 1 });
bookingSchema.index({ bookingCode: 1 });

// Generate booking code before saving
bookingSchema.pre('save', async function (next) {
    if (!this.bookingCode) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await mongoose.model('Booking').countDocuments();
        this.bookingCode = `BK${dateStr}${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
