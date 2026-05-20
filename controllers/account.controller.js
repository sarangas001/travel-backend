const User = require('../models/user.model');
const { validateProfilePayload } = require('../validation/requests');

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.sub).select('-passwordHash').lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const errors = validateProfilePayload(req.body);

        if (errors.length) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        const updates = {};

        if (req.body.firstName !== undefined) {
            updates['profile.firstName'] = req.body.firstName.trim();
        }

        if (req.body.lastName !== undefined) {
            updates['profile.lastName'] = req.body.lastName.trim();
        }

        if (req.body.avatarUrl !== undefined) {
            updates['profile.avatarUrl'] = req.body.avatarUrl.trim();
        }

        const user = await User.findByIdAndUpdate(
            req.user.sub,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-passwordHash').lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile
};