const LoginLog = require('../models/LoginLog');

const logUserActivity = async (userId, action, req, status = 'success') => {
  try {
    console.log('Logging user activity:', { userId, action, status });
    const log = new LoginLog({
      user: userId,
      action,
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      status
    });

    console.log('Created log entry:', log);
    await log.save();
    console.log('Log saved successfully');
    console.log(`User activity logged: ${action}`);
  } catch (error) {
    console.error('Error logging user activity:', error);
    console.error('Error details:', {
      userId,
      action,
      status,
      error: error.message,
      stack: error.stack
    });
    throw error; // Rethrow to handle in the calling function
  }
};

module.exports = { logUserActivity }; 