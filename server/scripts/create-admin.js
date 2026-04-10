require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'beostv05@gmail.com';
        const passwordHash = 'Abc@12345';
        
        let admin = await User.findOne({ email });

        if (admin) {
            console.log('Admin already exists. Updating password...');
            admin.passwordHash = passwordHash;
            admin.role = 'admin';
            await admin.save();
            console.log('✅ Admin user updated successfully');
        } else {
            console.log('Creating new admin user...');
            admin = await User.create({
                name: 'Administrator',
                email: email,
                passwordHash: passwordHash,
                phone: '0999999999', // Default phone number
                role: 'admin',
                isVerified: true
            });
            console.log('✅ Admin user created successfully');
        }

        console.log('\n📝 Admin credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${passwordHash}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating/updating admin:', error);
        process.exit(1);
    }
};

createAdmin();
