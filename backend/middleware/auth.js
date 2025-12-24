const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - JWT authentication middleware
exports.protect = async (req, res, next) => {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            if (!req.user.isActive) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User account is deactivated'
                });
            }

            next();

        } catch (error) {
            console.error('JWT Verification Error:', error);

            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid token'
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token expired'
                });
            }

            return res.status(401).json({
                status: 'error',
                message: 'Not authorized to access this route'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Not authorized, no token provided'
        });
    }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};
