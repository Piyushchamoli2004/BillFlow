const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const billController = require('../controllers/billController');

// @route   GET /api/bills/stats
// @desc    Get bill statistics
// @access  Private
router.get('/stats', protect, billController.getBillStats);

// @route   GET /api/bills
// @desc    Get all bills for logged-in user
// @access  Private
router.get('/', protect, billController.getBills);

// @route   GET /api/bills/:id
// @desc    Get single bill
// @access  Private
router.get('/:id', protect, billController.getBill);

// @route   POST /api/bills
// @desc    Create new bill
// @access  Private
router.post('/', protect, billController.createBill);

// @route   PUT /api/bills/:id
// @desc    Update bill
// @access  Private
router.put('/:id', protect, billController.updateBill);

// @route   PATCH /api/bills/:id/status
// @desc    Update bill payment status
// @access  Private
router.patch('/:id/status', protect, billController.updateBillStatus);

// @route   DELETE /api/bills/:id
// @desc    Delete bill
// @access  Private
router.delete('/:id', protect, billController.deleteBill);

module.exports = router;
