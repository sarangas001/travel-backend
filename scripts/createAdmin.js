const dotenv = require('dotenv');
const connectDatabase = require('../config/database');
const User = require('../models/user.model');
const { hashPassword } = require('../utils/auth');

dotenv.config();

const run = async () => {
    try {
        const username = "admin_user";
        const email = "admin@gmail.com";
        const password = "admin@123"; // You can also get this from environment variables for better security

        if (!username || !email || !password) {
            throw new Error('ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be defined');
        }

        await connectDatabase();

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            if (!existingUser.roles.includes('admin')) {
                existingUser.roles = Array.from(new Set([...(existingUser.roles || []), 'admin']));
                await existingUser.save();
                console.log(`Updated existing user to admin: ${email}`);
            } else {
                console.log(`Admin already exists: ${email}`);
            }

            process.exit(0);
        }

        const passwordHash = await hashPassword(password);

        await User.create({
            username,
            email: email.toLowerCase(),
            passwordHash,
            authProvider: 'local',
            roles: ['admin'],
            profile: {
                firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
                lastName: process.env.ADMIN_LAST_NAME || 'User',
                avatarUrl: process.env.ADMIN_AVATAR_URL || ''
            }
        });

        console.log(`Admin user created: ${email}`);
        process.exit(0);
    } catch (error) {
        console.error(`Admin bootstrap failed: ${error.message}`);
        process.exit(1);
    }
};

run();
