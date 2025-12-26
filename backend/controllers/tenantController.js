const Tenant = require('../models/Tenant');
const { validationResult } = require('express-validator');

// @desc    Get all tenants for logged-in user
// @route   GET /api/tenants
// @access  Private
exports.getTenants = async (req, res) => {
    try {
        const { status, search, limit = 100, page = 1 } = req.query;
        
        // Build query
        const query = { userId: req.user.id };
        
        if (status) {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { roomNumber: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Execute query with pagination
        const tenants = await Tenant.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();
        
        const total = await Tenant.countDocuments(query);
        
        res.json({
            status: 'success',
            data: {
                tenants,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get tenants error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching tenants'
        });
    }
};

// @desc    Get single tenant
// @route   GET /api/tenants/:id
// @access  Private
exports.getTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!tenant) {
            return res.status(404).json({
                status: 'error',
                message: 'Tenant not found'
            });
        }
        
        res.json({
            status: 'success',
            data: { tenant }
        });
    } catch (error) {
        console.error('Get tenant error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching tenant'
        });
    }
};

// @desc    Create new tenant
// @route   POST /api/tenants
// @access  Private
exports.createTenant = async (req, res) => {
    try {
        // Custom validation for better error messages
        const { name, phone, rentAmount, electricityBill, waterBill, maintenanceFee, otherCharges } = req.body;
        
        // Validate tenant name
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Tenant name is required.'
            });
        }
        
        if (name.trim().length < 3) {
            return res.status(400).json({
                status: 'error',
                message: 'Tenant name must be at least 3 characters long.'
            });
        }
        
        // Validate phone number if provided
        if (phone) {
            const phoneStr = phone.toString().trim();
            
            // Check if contains non-numeric characters
            if (!/^[0-9]+$/.test(phoneStr)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Phone number must contain only numeric digits (0–9).'
                });
            }
            
            // Check exact length
            if (phoneStr.length > 10) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Phone number must be exactly 10 digits. You entered more than 10 digits.'
                });
            }
            
            if (phoneStr.length < 10) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Phone number must be exactly 10 digits. You entered fewer digits.'
                });
            }
        }
        
        // Validate charges if provided
        const charges = { rentAmount, electricityBill, waterBill, maintenanceFee, otherCharges };
        for (const [key, value] of Object.entries(charges)) {
            if (value !== undefined && value !== null && value !== '') {
                // Check if numeric
                if (isNaN(value)) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Charges must be valid numbers.'
                    });
                }
                
                // Check if negative
                if (Number(value) < 0) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Charges cannot be negative.'
                    });
                }
            }
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: errors.array()
            });
        }
        
        // Check if room number already exists for this user
        const existingTenant = await Tenant.findOne({
            userId: req.user.id,
            roomNumber: req.body.roomNumber,
            status: 'active'
        });
        
        if (existingTenant) {
            return res.status(400).json({
                status: 'error',
                message: 'Room number already occupied by an active tenant'
            });
        }
        
        const tenantData = {
            ...req.body,
            userId: req.user.id
        };
        
        const tenant = await Tenant.create(tenantData);
        
        res.status(201).json({
            status: 'success',
            message: 'Tenant created successfully',
            data: { tenant }
        });
    } catch (error) {
        console.error('Create tenant error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating tenant'
        });
    }
};

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Private
exports.updateTenant = async (req, res) => {
    try {
        // Custom validation for better error messages
        const { name, phone, rentAmount, electricityBill, waterBill, maintenanceFee, otherCharges } = req.body;
        
        // Validate tenant name if provided
        if (name !== undefined) {
            if (!name || name.trim().length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Tenant name is required.'
                });
            }
            
            if (name.trim().length < 3) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Tenant name must be at least 3 characters long.'
                });
            }
        }
        
        // Validate phone number if provided
        if (phone !== undefined && phone !== '') {
            const phoneStr = phone.toString().trim();
            
            // Check if contains non-numeric characters
            if (!/^[0-9]+$/.test(phoneStr)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Phone number must contain only numeric digits (0–9).'
                });
            }
            
            // Check exact length
            if (phoneStr.length > 10) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Phone number must be exactly 10 digits. You entered more than 10 digits.'
                });
            }
            
            if (phoneStr.length < 10) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Phone number must be exactly 10 digits. You entered fewer digits.'
                });
            }
        }
        
        // Validate charges if provided
        const charges = { rentAmount, electricityBill, waterBill, maintenanceFee, otherCharges };
        for (const [key, value] of Object.entries(charges)) {
            if (value !== undefined && value !== null && value !== '') {
                // Check if numeric
                if (isNaN(value)) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Charges must be valid numbers.'
                    });
                }
                
                // Check if negative
                if (Number(value) < 0) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Charges cannot be negative.'
                    });
                }
            }
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: errors.array()
            });
        }
        
        const tenant = await Tenant.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!tenant) {
            return res.status(404).json({
                status: 'error',
                message: 'Tenant not found'
            });
        }
        
        // If room number is being changed, check availability
        if (req.body.roomNumber && req.body.roomNumber !== tenant.roomNumber) {
            const existingTenant = await Tenant.findOne({
                userId: req.user.id,
                roomNumber: req.body.roomNumber,
                status: 'active',
                _id: { $ne: req.params.id }
            });
            
            if (existingTenant) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Room number already occupied by another active tenant'
                });
            }
        }
        
        // Update fields
        Object.keys(req.body).forEach(key => {
            tenant[key] = req.body[key];
        });
        
        await tenant.save();
        
        res.json({
            status: 'success',
            message: 'Tenant updated successfully',
            data: { tenant }
        });
    } catch (error) {
        console.error('Update tenant error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating tenant'
        });
    }
};

// @desc    Delete tenant
// @route   DELETE /api/tenants/:id
// @access  Private
exports.deleteTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!tenant) {
            return res.status(404).json({
                status: 'error',
                message: 'Tenant not found'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Tenant deleted successfully'
        });
    } catch (error) {
        console.error('Delete tenant error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting tenant'
        });
    }
};

// @desc    Get tenant statistics
// @route   GET /api/tenants/stats
// @access  Private
exports.getTenantStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get all tenants for the user
        const tenants = await Tenant.find({ userId }).lean();
        
        // Calculate statistics
        const stats = {
            totalTenants: tenants.length,
            activeTenants: 0,
            inactiveTenants: 0,
            movedOutTenants: 0,
            totalRentAmount: 0,
            averageRent: 0
        };
        
        tenants.forEach(tenant => {
            if (tenant.status === 'active') {
                stats.activeTenants++;
                stats.totalRentAmount += tenant.rentAmount;
            } else if (tenant.status === 'inactive') {
                stats.inactiveTenants++;
            } else if (tenant.status === 'moved_out') {
                stats.movedOutTenants++;
            }
        });
        
        if (stats.activeTenants > 0) {
            stats.averageRent = Math.round(stats.totalRentAmount / stats.activeTenants);
        }
        
        res.json({
            status: 'success',
            data: { stats }
        });
    } catch (error) {
        console.error('Get tenant stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching tenant statistics'
        });
    }
};
