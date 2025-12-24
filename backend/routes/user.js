const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Protected routes (require authentication)
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/stats', protect, userController.getUserStats);

module.exports = router;
