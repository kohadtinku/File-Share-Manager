require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

const seed = async () => {
    try {
        await connectDB();

        // ---------------------------
        //  Create Admin User
        // ---------------------------
        const adminUser = await User.findOne({ username: 'admin' });
        if (!adminUser) {
            const hashed = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                password: hashed,
                role: 'admin'
            });
            console.log('Admin user created: username=admin password=admin123');
        } else {
            console.log('Admin already exists');
        }

        // ---------------------------
        //  Create Multiple Normal Users
        // ---------------------------
        const normalUsers = [
            { username: 'tinku', password: 'tinku123' },
            { username: 'pawan', password: 'pawan123' },
            { username: 'yash', password: 'yash123' },
            { username: 'ritik', password: 'ritik123' },
            { username: 'shubham', password: 'shubham123' }
        ];

        for (const user of normalUsers) {
            const exists = await User.findOne({ username: user.username });

            if (!exists) {
                const hashedPass = await bcrypt.hash(user.password, 10);
                await User.create({
                    username: user.username,
                    password: hashedPass,
                    role: 'user'
                });
                console.log(`User created: username=${user.username} password=${user.password}`);
            } else {
                console.log(`User ${user.username} already exists`);
            }
        }

        mongoose.connection.close();
        console.log('Seeding complete');

    } catch (err) {
        console.error('Seeding error:', err.message);
        process.exit(1);
    }
};

seed();
