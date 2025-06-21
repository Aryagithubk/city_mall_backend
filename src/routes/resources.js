const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/:id/resources', resourceController.getNearbyResources);
router.post('/:id/resources', resourceController.createResource);

module.exports = router;