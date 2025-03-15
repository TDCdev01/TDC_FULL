const jwt = require('jsonwebtoken');
const User = require('../models/User');

const userAuth = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    console.log('User Auth header:', authHeader ? authHeader.substring(0, 20) + '...' : 'missing');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization token was found' 
      });
    }
    
    // Format should be "Bearer [token]"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        success: false, 
        message: 'Authorization format is incorrect. Format should be Bearer [token]' 
      });
    }
    
    const token = parts[1];
    
    // Verify the token - add more debugging
    console.log('About to verify token in userAuth middleware');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'abcd');
    console.log('Token successfully decoded:', decoded);
    
    // FIX: Use the correct field name from the token (userId instead of id)
    const userId = decoded.userId || decoded.id; // Support both formats
    
    if (!userId) {
      console.log('No user ID found in token:', decoded);
      return res.status(401).json({
        success: false,
        message: 'Invalid token format: No user ID found'
      });
    }
    
    // Check if user exists with the correct field
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('User found:', user.email);
    
    // Add user info to request with consistent field naming
    req.user = {
      id: user._id, // Keep this consistent for other parts of the app
      userId: user._id, // Add this for completeness
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    next();
  } catch (error) {
    console.error('User authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed', 
      error: error.message 
    });
  }
};

module.exports = userAuth; 