const validateAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorization denied'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.adminId);
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token, authorization denied'
            });
        }
        
        req.admin = {
            id: admin._id,
            name: admin.name,
            isAdmin: admin.isAdmin
        };
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};

module.exports = { validateAdmin }; 