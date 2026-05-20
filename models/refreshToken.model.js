const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    tokenId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    tokenHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    revokedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;