require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Room.deleteMany({});
        await Booking.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            passwordHash: 'password123',
            role: 'admin',
        });
        console.log('👤 Admin user created');

        // Create sample user
        const user = await User.create({
            name: 'Nguyen Van A',
            email: 'user@example.com',
            passwordHash: 'password123',
            role: 'user',
        });
        console.log('👤 Sample user created');

        // Create sample rooms
        const rooms = await Room.insertMany([
            {
                title: '🍏🍏MINIHOUSE MẶT TIỀN KDC 91B 2 PHÒNG NGỦ RIÊNG',
                priceMonthly: 4300000,
                location: {
                    city: 'Can Tho',
                    district: 'Ninh Kieu',
                    ward: 'An Hoa',
                    streetAddress: 'KDC 91B, Đường Nguyễn Văn Cừ',
                },
                areaMin: 35,
                areaMax: 40,
                layout: 'Phòng khách, 2 phòng ngủ riêng, bếp, WC',
                furnitures: ['AC', 'Fridge', 'Water Heater', 'Stove'],
                costs: {
                    electricityPrice: '4k/kWh',
                    waterPrice: '9.5k/m³',
                    wifi: 'Included',
                },
                maxPeople: 4,
                terms: {
                    depositMonths: 1,
                    contractMonths: 12,
                },
                amenities: {
                    freeTime: true,
                    securityGate: true,
                    fingerprintLock: false,
                    parking: true,
                    allowCouple: true,
                },
                isArchived: false,
                images: [
                    {
                        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
                        publicId: 'sample1',
                    },
                    {
                        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
                        publicId: 'sample2',
                    },
                ],
                tags: ['2 bedrooms', 'free time', 'AC', 'near university'],
                createdBy: admin._id,
            },
            {
                title: 'MINIHOUSE ĐƯỜNG NGUYỄN VĂN CỪ - GẦN ĐẠI HỌC CẦN THƠ',
                priceMonthly: 3000000,
                location: {
                    city: 'Can Tho',
                    district: 'Ninh Kieu',
                    ward: 'An Khanh',
                    streetAddress: '123 Nguyễn Văn Cừ',
                },
                area: 30,
                layout: 'Phòng khách, 1 phòng ngủ, bếp, WC',
                furnitures: ['AC', 'Fridge', 'Washer'],
                costs: {
                    electricityPrice: '3k/kWh',
                    waterPrice: '60k/month',
                    wifi: 'Private wifi per room',
                },
                maxPeople: 2,
                terms: {
                    depositMonths: 1,
                    contractMonths: 6,
                },
                amenities: {
                    freeTime: true,
                    securityGate: true,
                    fingerprintLock: false,
                    parking: true,
                    allowCouple: true,
                },
                isArchived: false,
                images: [
                    {
                        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
                        publicId: 'sample3',
                    },
                ],
                tags: ['near Can Tho University', 'AC', 'washer'],
                createdBy: admin._id,
            },
            {
                title: 'MINIHOUSE 2 PHÒNG NGỦ - ĐƯỜNG 3/2 - GẦN TRƯỜNG Y DƯỢC',
                priceMonthly: 4000000,
                location: {
                    city: 'Can Tho',
                    district: 'Ninh Kieu',
                    ward: 'Xuan Khanh',
                    streetAddress: '456 Đường 3/2',
                },
                areaMin: 40,
                areaMax: 45,
                layout: 'Phòng khách, 2 phòng ngủ, bếp, 2 WC',
                furnitures: ['2 AC', 'Fridge', 'Washer', 'Water Heater', 'Table & Chairs'],
                costs: {
                    electricityPrice: '4k/kWh',
                    waterPrice: 'Free',
                    wifi: 'Free per room',
                },
                maxPeople: 4,
                terms: {
                    depositMonths: 1,
                    contractMonths: 6,
                },
                amenities: {
                    freeTime: true,
                    securityGate: true,
                    fingerprintLock: true,
                    parking: true,
                    allowCouple: true,
                },
                isArchived: false,
                images: [
                    {
                        url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
                        publicId: 'sample4',
                    },
                    {
                        url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
                        publicId: 'sample5',
                    },
                ],
                tags: ['2 bedrooms', 'fingerprint lock', 'near University of Medicine'],
                createdBy: admin._id,
            },
        ]);
        console.log(`🏠 ${rooms.length} rooms created`);

        // Create sample bookings
        const bookings = await Booking.insertMany([
            {
                roomId: rooms[0]._id,
                userId: user._id,
                customerName: 'Nguyen Van A',
                phone: '0901234567',
                desiredArea: 'Ninh Kieu',
                peopleCount: 2,
                budgetMax: 4500000,
                notes: 'Muốn xem phòng vào cuối tuần',
                viewTime: new Date('2026-01-25T14:00:00'),
                moveInDate: new Date('2026-02-01'),
                status: 'pending',
            },
            {
                roomId: rooms[1]._id,
                customerName: 'Tran Thi B',
                phone: '0912345678',
                desiredArea: 'Near Can Tho University',
                peopleCount: 1,
                budgetMax: 3500000,
                moveInDate: new Date('2026-02-15'),
                status: 'contacted',
            },
        ]);
        console.log(`📋 ${bookings.length} bookings created`);

        console.log('\n✅ Seed data created successfully!');
        console.log('\n📝 Default admin account:');
        console.log('   Email: admin@example.com');
        console.log('   Password: password123');
        console.log('\n📝 Sample user account:');
        console.log('   Email: user@example.com');
        console.log('   Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
