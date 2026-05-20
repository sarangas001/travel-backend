const express = require('express');
const {
    getDestinations,
    getDestinationById,
    getDestinationReviews
} = require('../controllers/destinations.controller');

const router = express.Router();

router.get('/', getDestinations);
router.get('/:id', getDestinationById);
router.get('/:id/reviews', getDestinationReviews);

module.exports = router;