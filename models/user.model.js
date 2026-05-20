const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    passwordHash: {
        type: String,
        required: true
    },
    profile: {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        avatarUrl: { type: String, default: '' }
    },
    authProvider: {
        type: String,
        required: true,
        enum: ['local', 'google', 'apple'],
        default: 'local'
    },
    authProviderId: {
        type: String
    },
    roles: {
        type: [String],
        enum: ['user', 'admin'],
        default: ['user']
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
