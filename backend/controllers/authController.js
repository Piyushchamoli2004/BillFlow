const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password, organization, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            organization,
            phone,
            role: 'admin'
        });

        // Generate token
        const token = generateToken(user._id);

        // Update last login
        await user.updateLastLogin();

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organization: user.organization,
                    phone: user.phone
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during registration',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check if user exists and get password field
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'Your account has been deactivated. Please contact support.'
            });
        }

        // Compare password
        const isPasswordMatch = await user.comparePassword(password);
        
        if (!isPasswordMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Update last login
        await user.updateLastLogin();

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organization: user.organization,
                    phone: user.phone,
                    lastLogin: user.lastLogin
                },
                token
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during login',
            error: error.message
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
    try {
        res.status(200).json({
            status: 'success',
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during logout'
        });
    }
};
