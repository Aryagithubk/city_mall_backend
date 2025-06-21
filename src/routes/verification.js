const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { authenticate } = require('../middleware/auth');
const { createLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);

router.post('/:id/verify-image', createLimiter(15 * 60 * 1000, 10), verificationController.verifyImage);

module.exports = router;