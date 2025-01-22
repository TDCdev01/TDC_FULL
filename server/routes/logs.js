const express = require('express');
const router = express.Router();
const LoginLog = require('../models/LoginLog');
const auth = require('../middleware/auth');

// Get user's login history
router.get('/logs/user/:userId', auth, async (req, res) => {
  try {
    const logs = await LoginLog.find({ user: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(50); // Limit to last 50 entries

    res.json({
      success: true,
      logs: logs.map(log => ({
        action: log.action,
        timestamp: log.timestamp,
        deviceInfo: log.deviceInfo,
        ipAddress: log.ipAddress,
        status: log.status
      }))
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, message: 'Error fetching logs' });
  }
});

// Get all logs (admin only)
router.get('/logs/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const logs = await LoginLog.find()
      .populate('user', 'email firstName lastName')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error fetching all logs:', error);
    res.status(500).json({ success: false, message: 'Error fetching logs' });
  }
});

module.exports = router; 