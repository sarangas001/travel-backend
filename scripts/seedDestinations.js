const dotenv = require('dotenv');
const connectDatabase = require('../config/database');
const Destination = require('../models/destination.model');

dotenv.config();

const seedData = [
    {
        name: 'Blue Lagoon Beach',
        description: 'A scenic coastal destination with clear water, soft sand, and dramatic sunset views.',
        category: 'Beach',
        media: [
            {
                type: 'image',
                url: 'https://example.com/media/blue-lagoon.jpg',
                caption: 'Blue Lagoon shoreline'
            }
        ],
        location: {
            type: 'Point',
            coordinates: [120.9842, 14.5995]
        },
        address: {
            city: 'Manila',
            country: 'Philippines'
        },
        tags: ['beach', 'sunset', 'swimming']
    },
    {
        name: 'Skyline Mountain Trail',
        description: 'A high-elevation hiking route with panoramic views and well-marked trekking paths.',
        category: 'Mountain',
        media: [
            {
                type: 'image',
                url: 'https://example.com/media/skyline-trail.jpg',
                caption: 'Mountain trail overview'
            }
        ],
        location: {
            type: 'Point',
            coordinates: [121.0437, 14.6760]
        },
        address: {
            city: 'Quezon City',
            country: 'Philippines'
        },
        tags: ['hiking', 'adventure', 'nature']
    }
];

const run = async () => {
    try {
        await connectDatabase();
        await Destination.deleteMany({});
        await Destination.insertMany(seedData);
        console.log('Destination seed completed');
        process.exit(0);
    } catch (error) {
        console.error('Destination seed failed:', error.message);
        process.exit(1);
    }
};

run();