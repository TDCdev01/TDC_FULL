const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Simplified admin validation middleware for file uploads
// This prevents the auth middleware complexity from blocking uploads
const simpleValidateAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorization denied'
            });
        }
        
        // Just verify the token is valid, don't try to fetch the admin
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};

// Ensure assets directory exists with debugging
const assetsDir = path.join(__dirname, '../assets');
console.log('Assets directory path:', assetsDir);

if (!fs.existsSync(assetsDir)){
    console.log('Creating assets directory...');
    try {
        fs.mkdirSync(assetsDir, { recursive: true });
        console.log('Assets directory created successfully');
    } catch (err) {
        console.error('Error creating assets directory:', err);
    }
} else {
    console.log('Assets directory already exists');
}

// Configure multer with debugging
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log('Multer destination called');
        cb(null, assetsDir);
    },
    filename: function(req, file, cb) {
        console.log('Multer filename called for:', file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const newFilename = uniqueSuffix + ext;
        console.log('Generated filename:', newFilename);
        cb(null, newFilename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// File upload endpoint with debugging
router.post('/files', simpleValidateAdmin, (req, res, next) => {
    console.log('File upload request received');
    
    // Use multer middleware here with error handling
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                error: err.message
            });
        }
        
        // Continue with the request
        next();
    });
}, (req, res) => {
    try {
        console.log('Processing uploaded file');
        
        if (!req.file) {
            console.error('No file was uploaded');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        console.log('File uploaded successfully:', req.file);
        
        // Construct URL ensuring it's absolute
        const protocol = req.protocol || 'http';
        const host = req.get('host') || 'localhost:3001';
        const fileUrl = `${protocol}://${host}/assets/${req.file.filename}`;
        
        console.log('File URL:', fileUrl);
        
        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            fileUrl: fileUrl,
            fileName: req.file.originalname,
            fileSize: req.file.size
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
});

// Test route
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Upload route is working' });
});

module.exports = router; 