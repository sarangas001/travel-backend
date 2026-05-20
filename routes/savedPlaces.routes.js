const express = require('express');
const {
    listSavedPlaces,
    saveDestination,
    unsaveDestination
} = require('../controllers/savedPlaces.controller');

const router = express.Router();

router.get('/', listSavedPlaces);
router.post('/', saveDestination);
router.delete('/:destinationId', unsaveDestination);

module.exports = router;