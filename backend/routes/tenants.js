const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const tenantController = require('../controllers/tenantController');

// @route   GET /api/tenants/stats
// @desc    Get tenant statistics
// @access  Private
router.get('/stats', protect, tenantController.getTenantStats);

// @route   GET /api/tenants
// @desc    Get all tenants for logged-in user
// @access  Private
router.get('/', protect, tenantController.getTenants);

// @route   GET /api/tenants/:id
// @desc    Get single tenant
// @access  Private
router.get('/:id', protect, tenantController.getTenant);

// @route   POST /api/tenants
// @desc    Create new tenant
// @access  Private
router.post('/', protect, tenantController.createTenant);

// @route   PUT /api/tenants/:id
// @desc    Update tenant
// @access  Private
router.put('/:id', protect, tenantController.updateTenant);

// @route   DELETE /api/tenants/:id
// @desc    Delete tenant
// @access  Private
router.delete('/:id', protect, tenantController.deleteTenant);

module.exports = router;
