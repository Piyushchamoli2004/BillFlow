const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organization: user.organization,
                    phone: user.phone,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, organization, phone } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (organization !== undefined) user.organization = organization;
        if (phone) user.phone = phone;

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organization: user.organization,
                    phone: user.phone
                }
            }
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get user stats
// @route   GET /api/user/stats
// @access  Private
exports.getUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // In a real application, you would fetch actual statistics here
        res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    totalBills: 247,
                    revenue: 87500,
                    tenants: 42,
                    pendingPayments: 21900,
                    paidPayments: 65600
                }
            }
        });

    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};
