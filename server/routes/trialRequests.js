const express = require('express');
const router = express.Router();
const TrialRequest = require('../models/TrialRequest');

router.post('/trial-requests', async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    const trialRequest = new TrialRequest({
      email,
      phone,
      status: 'pending'
    });

    await trialRequest.save();

    res.json({
      success: true,
      message: 'Trial request submitted successfully'
    });
  } catch (error) {
    console.error('Trial request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit trial request'
    });
  }
});

module.exports = router; 