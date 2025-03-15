const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Token received:', token); // Debug log
        
        if (!token) {
            throw new Error('No token provided');
        }

        // Use JWT_SECRET from environment variables
        const decoded = jwt.verify(token, 'abcd'); // Use the same secret used for token creation
        console.log('Decoded token:', decoded); // Debug log

        const admin = await Admin.findOne({ _id: decoded.adminId }); // Changed from decoded._id to decoded.adminId
        console.log('Found admin:', admin); // Debug log

        if (!admin) {
            throw new Error('Admin not found');
        }

        req.adminId = admin._id;
        req.adminName = admin.name;
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Please authenticate',
            error: error.message
        });
    }
};

module.exports = auth; 