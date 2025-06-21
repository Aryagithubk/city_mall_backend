const express = require('express');
const router = express.Router();
const updateController = require('../controllers/updateController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/:id/official-updates', updateController.getOfficialUpdates);

module.exports = router;
