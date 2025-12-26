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

// @desc    Forgot password - Send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
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

        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'No account found with this email.'
            });
        }

        // Generate 6-digit reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const crypto = require('crypto');
        const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');
        
        // Set reset token and expiry (15 minutes)
        user.resetPasswordToken = hashedCode;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
        await user.save();

        // Send email with reset code
        const emailUtils = require('../utils/email');
        try {
            await emailUtils.sendPasswordResetEmail(user.email, user.name, resetCode);
            
            res.status(200).json({
                status: 'success',
                message: 'Password reset link has been sent to your email.'
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            
            // Clear reset token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            
            return res.status(500).json({
                status: 'error',
                message: 'Failed to send reset email. Please try again later.'
            });
        }
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during password reset request'
        });
    }
};

// @desc    Reset password with code
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
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

        const { email, resetCode, newPassword } = req.body;

        // Hash the provided code to match stored hash
        const crypto = require('crypto');
        const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');

        // Find user with matching email and token
        const user = await User.findOne({
            email,
            resetPasswordToken: hashedCode,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            // Check if user exists but token is invalid/expired
            const userExists = await User.findOne({ email });
            if (!userExists) {
                return res.status(404).json({
                    status: 'error',
                    message: 'No account found with this email.'
                });
            }
            
            // Token is either invalid or expired
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or already used reset link.'
            });
        }

        // Set new password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password has been reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during password reset'
        });
    }
};
