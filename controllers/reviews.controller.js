const Review = require('../models/review.model');
const Destination = require('../models/destination.model');
const { validateReviewPayload } = require('../validation/requests');

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

        const reviewStats = await Review.aggregate([
            { $match: { destinationId: destination._id } },
            {
                $group: {
                    _id: '$destinationId',
                    ratingAverage: { $avg: '$rating' },
                    reviewCount: { $sum: 1 }
                }
            }
        ]);

        if (reviewStats.length) {
            await Destination.findByIdAndUpdate(destination._id, {
                $set: {
                    ratingAverage: Number(reviewStats[0].ratingAverage.toFixed(2)),
                    reviewCount: reviewStats[0].reviewCount
                }
            });
        }

        res.status(201).json({ data: review });
    } catch (error) {
        next(error);
    }
};

module.exports = { createReview };