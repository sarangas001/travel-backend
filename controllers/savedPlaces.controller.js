const SavedDestination = require('../models/savedDestination.model');
const Destination = require('../models/destination.model');
const { validateSavedPlacePayload } = require('../validation/requests');

const listSavedPlaces = async (req, res, next) => {
    try {
        const savedPlaces = await SavedDestination.find({ userId: req.user.sub })
            .sort('-createdAt')
            .populate('destinationId')
            .lean();

        res.status(200).json({
            data: savedPlaces.map((item) => ({
                id: item._id,
                createdAt: item.createdAt,
                destination: item.destinationId
            }))
        });
    } catch (error) {
        next(error);
    }
};

const saveDestination = async (req, res, next) => {
    try {
        const errors = validateSavedPlacePayload(req.body);

        if (errors.length) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        const destination = await Destination.findById(req.body.destinationId).lean();

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        const existing = await SavedDestination.findOne({
            userId: req.user.sub,
            destinationId: req.body.destinationId
        });

        if (existing) {
            return res.status(409).json({ message: 'Destination already saved' });
        }

        const savedPlace = await SavedDestination.create({
            userId: req.user.sub,
            destinationId: req.body.destinationId
        });

        res.status(201).json({
            message: 'Destination saved',
            data: savedPlace
        });
    } catch (error) {
        next(error);
    }
};

const unsaveDestination = async (req, res, next) => {
    try {
        const savedPlace = await SavedDestination.findOneAndDelete({
            userId: req.user.sub,
            destinationId: req.params.destinationId
        });

        if (!savedPlace) {
            return res.status(404).json({ message: 'Saved destination not found' });
        }

        res.status(200).json({
            message: 'Destination unsaved'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listSavedPlaces,
    saveDestination,
    unsaveDestination
};