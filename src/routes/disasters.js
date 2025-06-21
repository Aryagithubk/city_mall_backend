const express = require('express');
const router = express.Router();
const disasterController = require('../controllers/disasterController');
const { authenticate, authorize } = require('../middleware/auth');
const { createLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);

router.post('/', createLimiter(), disasterController.create);
router.get('/', disasterController.getAll);
router.get('/:id', disasterController.getById);
router.put('/:id', authorize(['admin', 'contributor']), disasterController.update);
router.delete('/:id', authorize(['admin']), disasterController.delete);

module.exports = router;