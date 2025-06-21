const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/socialMediaController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/:id/social-media', socialMediaController.getSocialMediaReports);

module.exports = router;