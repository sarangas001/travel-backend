const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const destinationSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    media: [
        {
            type: { type: String, enum: ['image', 'video'], required: true },
            url: { type: String, required: true },
            caption: { type: String }
        }
    ],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    ratingAverage: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String],
        index: true
    }
}, {
    timestamps: true
});

destinationSchema.index({ name: 'text', description: 'text', tags: 'text' });
destinationSchema.index({ location: '2dsphere' });

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;
