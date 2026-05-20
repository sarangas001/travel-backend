const Review = require('../models/review.model');
const Destination = require('../models/destination.model');
const { validateReviewPayload, validateReviewUpdatePayload } = require('../validation/requests');

const recalculateDestinationStats = async (destinationId) => {
    const reviewStats = await Review.aggregate([
        { $match: { destinationId } },
        {
            $group: {
                _id: '$destinationId',
                ratingAverage: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    if (!reviewStats.length) {
        await Destination.findByIdAndUpdate(destinationId, {
            $set: {
                ratingAverage: 0,
                reviewCount: 0
            }
        });

        return;
    }

    await Destination.findByIdAndUpdate(destinationId, {
        $set: {
            ratingAverage: Number(reviewStats[0].ratingAverage.toFixed(2)),
            reviewCount: reviewStats[0].reviewCount
        }
    });
};

const createReview = async (req, res, next) => {
    try {
        const errors = validateReviewPayload(req.body);

        if (errors.length) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        const destination = await Destination.findById(req.params.id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        const existingReview = await Review.findOne({
            destinationId: req.params.id,
            userId: req.user.sub
        });

        if (existingReview) {
            return res.status(409).json({ message: 'You have already reviewed this destination' });
        }

        const review = await Review.create({
            destinationId: req.params.id,
            userId: req.user.sub,
            rating: req.body.rating,
            comment: req.body.comment || ''
        });

        await recalculateDestinationStats(destination._id);

        res.status(201).json({ data: review });
    } catch (error) {
        next(error);
    }
};

const updateReview = async (req, res, next) => {
    try {
        const errors = validateReviewUpdatePayload(req.body);

        if (errors.length) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        const review = await Review.findOne({
            destinationId: req.params.id,
            userId: req.user.sub
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (req.body.rating !== undefined) {
            review.rating = req.body.rating;
        }

        if (req.body.comment !== undefined) {
            review.comment = req.body.comment;
        }

        await review.save();
        await recalculateDestinationStats(review.destinationId);

        res.status(200).json({ data: review });
    } catch (error) {
        next(error);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findOneAndDelete({
            destinationId: req.params.id,
            userId: req.user.sub
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await recalculateDestinationStats(review.destinationId);

        res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createReview, updateReview, deleteReview };