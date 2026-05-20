const express = require('express');
const destinationsRouter = require('./destinations.routes');
const authRouter = require('./auth.routes');
const accountRouter = require('./account.routes');
const savedPlacesRouter = require('./savedPlaces.routes');

const router = express.Router();

router.use('/destinations', destinationsRouter);
router.use('/auth', authRouter);
router.use('/account', accountRouter);
router.use('/saved-places', savedPlacesRouter);

module.exports = router;