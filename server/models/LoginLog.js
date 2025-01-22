const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['login', 'logout'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    type: String,
    default: 'Unknown device'
  },
  ipAddress: {
    type: String,
    default: 'Unknown IP'
  },
  userAgent: {
    type: String,
    default: 'Unknown user agent'
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  details: {
    type: String,
    default: ''
  }
});

// Index for better query performance
loginLogSchema.index({ user: 1, timestamp: -1 });
loginLogSchema.index({ timestamp: -1 }); // Add index for timestamp queries

module.exports = mongoose.model('LoginLog', loginLogSchema); 