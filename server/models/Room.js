const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a room title'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        priceMonthly: {
            type: Number,
            required: [true, 'Please provide monthly rent price'],
            min: 0,
        },
        location: {
            city: {
                type: String,
                default: 'Can Tho',
            },
            street: {
                type: String,
                required: [true, 'Please provide street/area'],
            },
            ward: {
                type: String,
            },
            streetAddress: {
                type: String,
                required: [true, 'Please provide street address'],
            },
            geo: {
                lat: Number,
                lng: Number,
            },
        },
        area: {
            type: Number,
        },
        areaMin: {
            type: Number,
        },
        areaMax: {
            type: Number,
        },
        layout: {
            type: String,
            trim: true,
        },
        furnitures: {
            type: [String],
            default: [],
        },
        costs: {
            electricityPrice: {
                type: String,
            },
            waterPrice: {
                type: String,
            },
            wifi: {
                type: String,
            },
            utilityPerPerson: {
                type: Boolean,
                default: false,
            },
        },
        bedrooms: {
            type: Number,
            min: 0,
        },
        maxPeople: {
            type: Number,
            min: 1,
        },
        terms: {
            depositMonths: {
                type: Number,
                min: 0,
            },
            contractMonths: {
                type: Number,
                min: 0,
            },
        },
        category: {
            type: String,
            enum: ['Phòng trọ', 'Minihouse', 'Căn hộ', 'Nhà nguyên căn', 'Mặt bằng'],
            default: 'Phòng trọ',
        },
        amenities: {
            freeTime: {
                type: Boolean,
                default: false,
            },
            securityGate: {
                type: Boolean,
                default: false,
            },
            fingerprintLock: {
                type: Boolean,
                default: false,
            },
            parking: {
                type: Boolean,
                default: false,
            },
            carParking: {
                type: Boolean,
                default: false,
            },
            petFriendly: {
                type: Boolean,
                default: false,
            },
            hasBalcony: {
                type: Boolean,
                default: false,
            },
            hasElevator: {
                type: Boolean,
                default: false,
            },
            withOwner: {
                type: Boolean,
                default: false,
            },
        },
        googleMapsLink: {
            type: String,
            trim: true,
        },
        shortTermRental: {
            type: Boolean,
            default: false,
        },
        isFull: {
            type: Boolean,
            default: false,
        },
        nearbyUniversities: [
            {
                name: {
                    type: String,
                    required: true,
                },
                distanceKm: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
        isArchived: {
            type: Boolean,
            default: false,
        },
        availableFrom: {
            type: Date,
        },
        images: [
            {
                url: {
                    type: String,
                    required: true,
                },
                publicId: {
                    type: String,
                },
            },
        ],
        tags: {
            type: [String],
            default: [],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
roomSchema.index({ priceMonthly: 1 });
roomSchema.index({ 'location.street': 1 });
roomSchema.index({ isArchived: 1 });
roomSchema.index({ title: 'text', 'location.streetAddress': 'text', layout: 'text', description: 'text' });

module.exports = mongoose.model('Room', roomSchema);
