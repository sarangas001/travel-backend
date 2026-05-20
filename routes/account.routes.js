const express = require('express');
const {
    getProfile,
    updateProfile
} = require('../controllers/account.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/me', getProfile);
router.put('/me', updateProfile);

module.exports = router;