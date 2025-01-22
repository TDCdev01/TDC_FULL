const express = require('express');
const router = express.Router();
const { logUserActivity } = require('../services/logService');

// In your login route
router.post('/login', async (req, res) => {
  try {
    // ... existing login logic ...

    if (user) {
      // Log successful login
      await logUserActivity(user._id, 'login', req, 'success');
      
      // ... rest of your login success code ...
    } else {
      // Log failed login attempt
      await logUserActivity(req.body.email, 'login', req, 'failed');
      
      // ... rest of your login failure code ...
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// In your logout route
router.post('/logout', auth, async (req, res) => {
  try {
    // Log logout
    await logUserActivity(req.user._id, 'logout', req);
    
    // ... rest of your logout code ...
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}); 