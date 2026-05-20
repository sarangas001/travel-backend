const express = require('express');
const {
    getProfile,
    updateProfile
} = require('../controllers/account.controller');

const router = express.Router();

router.get('/me', getProfile);
router.put('/me', updateProfile);

module.exports = router;