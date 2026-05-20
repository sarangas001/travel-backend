const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const savedDestinationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    destinationId: {
        type: Schema.Types.ObjectId,
        ref: 'Destination',
        required: true
    }
}, {
    timestamps: true
});

savedDestinationSchema.index({ userId: 1, destinationId: 1 }, { unique: true });

const SavedDestination = mongoose.model('SavedDestination', savedDestinationSchema);

module.exports = SavedDestination;
