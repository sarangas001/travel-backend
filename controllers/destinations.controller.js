const Destination = require('../models/destination.model');
const Review = require('../models/review.model');

const buildPagination = (page, limit) => ({
    page: Math.max(parseInt(page, 10) || 1, 1),
    limit: Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100)
});

const getDestinations = async (req, res, next) => {
    try {
        const { search, category, sort = '-createdAt', near } = req.query;
        const { page, limit } = buildPagination(req.query.page, req.query.limit);
        const query = {};

        if (search) {
            query.$text = { $search: search };
        }

        if (category) {
            query.category = category;
        }

        if (near) {
            const [longitude, latitude, maxDistance] = near.split(',').map(Number);

            if ([longitude, latitude].some((value) => Number.isNaN(value))) {
                return res.status(400).json({ message: 'Invalid near query parameter' });
            }

            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    }
                }
            };

            if (!Number.isNaN(maxDistance)) {
                query.location.$near.$maxDistance = maxDistance;
            }
        }

        const [items, total] = await Promise.all([
            Destination.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Destination.countDocuments(query)
        ]);

        res.status(200).json({
            data: items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getDestinationById = async (req, res, next) => {
    try {
        const destination = await Destination.findById(req.params.id).lean();

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        res.status(200).json({ data: destination });
    } catch (error) {
        next(error);
    }
};

const getDestinationReviews = async (req, res, next) => {
    try {
        const { page, limit } = buildPagination(req.query.page, req.query.limit);
        const destinationId = req.params.id;

        const [items, total] = await Promise.all([
            Review.find({ destinationId })
                .sort('-createdAt')
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Review.countDocuments({ destinationId })
        ]);

        res.status(200).json({
            data: items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDestinations,
    getDestinationById,
    getDestinationReviews
};