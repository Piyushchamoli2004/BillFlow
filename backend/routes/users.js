const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { query } = require('../config/database');
    
    const result = await query(
      `SELECT user_id, email, name, phone, organization, created_at, last_login
       FROM users WHERE user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { query } = require('../config/database');
    const { name, phone, organization } = req.body;

    const result = await query(
      `UPDATE users 
       SET name = $1, phone = $2, organization = $3
       WHERE user_id = $4
       RETURNING user_id, email, name, phone, organization`,
      [name, phone, organization, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

module.exports = router;
