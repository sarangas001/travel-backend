const express = require('express');
const {
    getDestinations,
    getDestinationById,
    getDestinationReviews,
    createDestination,
    updateDestination,
    deleteDestination
} = require('../controllers/destinations.controller');
const { createReview } = require('../controllers/reviews.controller');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', getDestinations);
router.get('/:id', getDestinationById);
router.get('/:id/reviews', getDestinationReviews);
router.post('/:id/reviews', protect, createReview);
router.post('/', protect, requireRole('admin'), createDestination);
router.put('/:id', protect, requireRole('admin'), updateDestination);
router.delete('/:id', protect, requireRole('admin'), deleteDestination);

module.exports = router;