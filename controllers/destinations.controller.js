const Destination = require('../models/destination.model');
const Review = require('../models/review.model');
const { validateDestinationPayload } = require('../validation/requests');

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

const createDestination = async (req, res, next) => {
    try {
        const errors = validateDestinationPayload(req.body);

        if (errors.length) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        const destination = await Destination.create({
            name: req.body.name.trim(),
            description: req.body.description.trim(),
            category: req.body.category.trim(),
            media: Array.isArray(req.body.media) ? req.body.media : [],
            location: {
                type: 'Point',
                coordinates: req.body.location.coordinates
            },
            address: req.body.address || {},
            tags: Array.isArray(req.body.tags) ? req.body.tags : []
        });

        res.status(201).json({ data: destination });
    } catch (error) {
        next(error);
    }
};

const updateDestination = async (req, res, next) => {
    try {
        const destination = await Destination.findById(req.params.id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        const updates = {};

        if (req.body.name !== undefined) updates.name = req.body.name.trim();
        if (req.body.description !== undefined) updates.description = req.body.description.trim();
        if (req.body.category !== undefined) updates.category = req.body.category.trim();
        if (req.body.media !== undefined) updates.media = req.body.media;
        if (req.body.location !== undefined) updates.location = req.body.location;
        if (req.body.address !== undefined) updates.address = req.body.address;
        if (req.body.tags !== undefined) updates.tags = req.body.tags;

        const updated = await Destination.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).lean();

        res.status(200).json({ data: updated });
    } catch (error) {
        next(error);
    }
};

const deleteDestination = async (req, res, next) => {
    try {
        const deleted = await Destination.findByIdAndDelete(req.params.id).lean();

        if (!deleted) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        res.status(200).json({ message: 'Destination deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDestinations,
    getDestinationById,
    getDestinationReviews,
    createDestination,
    updateDestination,
    deleteDestination
};