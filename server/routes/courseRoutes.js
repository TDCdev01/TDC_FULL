const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const upload = require('../middleware/upload');
const path = require('path');

// Create a new course
router.post('/courses', auth, async (req, res) => {
    try {
        console.log('Received course data:', req.body); // Debug log

        const courseData = {
            ...req.body,
            createdBy: req.adminId,
            resources: req.body.resources.map(resource => ({
                type: resource.type,
                count: resource.count
            }))
        };

        const course = new Course(courseData);
        await course.save();

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            course
        });
    } catch (error) {
        console.error('Course creation error:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating course',
            error: error.message
        });
    }
});

// Get all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching courses',
            error: error.message
        });
    }
});

// Get a single course
router.get('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        res.json({
            success: true,
            course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching course',
            error: error.message
        });
    }
});

// Delete a course
router.delete('/courses/:id', auth, async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting course',
            error: error.message
        });
    }
});

// Update a course
router.put('/courses/:id', auth, async (req, res) => {
    try {
        const courseId = req.params.id;
        const updates = req.body;

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.json({
            success: true,
            message: 'Course updated successfully',
            course: updatedCourse
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating course',
            error: error.message
        });
    }
});

// Add this new route for file uploads
router.post('/courses/upload-file', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const fileUrl = `/assets/${req.file.filename}`;
        res.json({
            success: true,
            file: {
                url: fileUrl,
                name: req.file.originalname,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file'
        });
    }
});

// Add this to serve files
router.get('/assets/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../assets', req.params.filename);
    res.sendFile(filePath);
});

module.exports = router; 