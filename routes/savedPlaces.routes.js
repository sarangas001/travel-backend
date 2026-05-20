const express = require('express');
const {
    listSavedPlaces,
    saveDestination,
    unsaveDestination
} = require('../controllers/savedPlaces.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', listSavedPlaces);
router.post('/', saveDestination);
router.delete('/:destinationId', unsaveDestination);

module.exports = router;