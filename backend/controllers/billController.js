const Bill = require('../models/Bill');
const Tenant = require('../models/Tenant');
const { validationResult } = require('express-validator');

// @desc    Get all bills for logged-in user
// @route   GET /api/bills
// @access  Private
exports.getBills = async (req, res) => {
    try {
        const { status, tenantId, month, year, limit = 100, page = 1 } = req.query;
        
        // Build query
        const query = { userId: req.user.id };
        
        if (status) {
            query.paymentStatus = status;
        }
        
        if (tenantId) {
            query.tenantId = tenantId;
        }
        
        if (month) {
            query.billMonth = month;
        }
        
        if (year) {
            query.billYear = parseInt(year);
        }
        
        // Execute query with pagination
        const bills = await Bill.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();
        
        const total = await Bill.countDocuments(query);
        
        res.json({
            status: 'success',
            data: {
                bills,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get bills error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching bills'
        });
    }
};

// @desc    Get single bill
// @route   GET /api/bills/:id
// @access  Private
exports.getBill = async (req, res) => {
    try {
        const bill = await Bill.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!bill) {
            return res.status(404).json({
                status: 'error',
                message: 'Bill not found'
            });
        }
        
        res.json({
            status: 'success',
            data: { bill }
        });
    } catch (error) {
        console.error('Get bill error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching bill'
        });
    }
};

// @desc    Create new bill
// @route   POST /api/bills
// @access  Private
exports.createBill = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: errors.array()
            });
        }
        
        const billData = {
            ...req.body,
            userId: req.user.id
        };
        
        // Calculate total if not provided
        if (!billData.totalAmount) {
            billData.totalAmount = 
                (billData.rentAmount || 0) +
                (billData.electricityBill || 0) +
                (billData.waterBill || 0) +
                (billData.maintenanceFee || 0) +
                (billData.otherCharges || 0) -
                (billData.discount || 0);
        }
        
        const bill = await Bill.create(billData);
        
        res.status(201).json({
            status: 'success',
            message: 'Bill created successfully',
            data: { bill }
        });
    } catch (error) {
        console.error('Create bill error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating bill'
        });
    }
};

// @desc    Update bill
// @route   PUT /api/bills/:id
// @access  Private
exports.updateBill = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: errors.array()
            });
        }
        
        const bill = await Bill.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!bill) {
            return res.status(404).json({
                status: 'error',
                message: 'Bill not found'
            });
        }
        
        // Update fields
        Object.keys(req.body).forEach(key => {
            bill[key] = req.body[key];
        });
        
        // Recalculate total if amount fields changed
        if (req.body.rentAmount || req.body.electricityBill || req.body.waterBill || 
            req.body.maintenanceFee || req.body.otherCharges || req.body.discount) {
            bill.totalAmount = 
                (bill.rentAmount || 0) +
                (bill.electricityBill || 0) +
                (bill.waterBill || 0) +
                (bill.maintenanceFee || 0) +
                (bill.otherCharges || 0) -
                (bill.discount || 0);
        }
        
        await bill.save();
        
        res.json({
            status: 'success',
            message: 'Bill updated successfully',
            data: { bill }
        });
    } catch (error) {
        console.error('Update bill error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating bill'
        });
    }
};

// @desc    Delete bill
// @route   DELETE /api/bills/:id
// @access  Private
exports.deleteBill = async (req, res) => {
    try {
        const bill = await Bill.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!bill) {
            return res.status(404).json({
                status: 'error',
                message: 'Bill not found'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Bill deleted successfully'
        });
    } catch (error) {
        console.error('Delete bill error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting bill'
        });
    }
};

// @desc    Update bill payment status
// @route   PATCH /api/bills/:id/status
// @access  Private
exports.updateBillStatus = async (req, res) => {
    try {
        const { paymentStatus, paymentDate, paymentMethod } = req.body;
        
        const bill = await Bill.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!bill) {
            return res.status(404).json({
                status: 'error',
                message: 'Bill not found'
            });
        }
        
        bill.paymentStatus = paymentStatus;
        if (paymentStatus === 'paid') {
            bill.paymentDate = paymentDate || new Date();
            bill.paymentMethod = paymentMethod || 'cash';
        }
        
        await bill.save();
        
        res.json({
            status: 'success',
            message: 'Bill status updated successfully',
            data: { bill }
        });
    } catch (error) {
        console.error('Update bill status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating bill status'
        });
    }
};

// @desc    Get bill statistics
// @route   GET /api/bills/stats
// @access  Private
exports.getBillStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get all bills for the user
        const bills = await Bill.find({ userId }).lean();
        
        // Calculate statistics
        const stats = {
            totalRevenue: 0,
            paidAmount: 0,
            pendingAmount: 0,
            overdueAmount: 0,
            totalBills: bills.length,
            paidBills: 0,
            pendingBills: 0,
            overdueBills: 0
        };
        
        bills.forEach(bill => {
            const amount = parseFloat(bill.totalAmount);
            
            if (bill.paymentStatus === 'paid') {
                stats.paidAmount += amount;
                stats.totalRevenue += amount;
                stats.paidBills++;
            } else if (bill.paymentStatus === 'pending') {
                stats.pendingAmount += amount;
                stats.pendingBills++;
            } else if (bill.paymentStatus === 'overdue') {
                stats.overdueAmount += amount;
                stats.overdueBills++;
            }
        });
        
        res.json({
            status: 'success',
            data: { stats }
        });
    } catch (error) {
        console.error('Get bill stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching bill statistics'
        });
    }
};
