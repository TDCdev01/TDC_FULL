const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const upload = require('../middleware/upload');
const path = require('path');
const Enrollment = require('../models/Enrollment');
const jwt = require('jsonwebtoken');

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

// Modify the check-access endpoint to include complete course data for purchasers
router.get('/check-access/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
      status: 'completed'
    });
    
    // Get the course with all its content
    const course = await Course.findById(courseId).populate({
      path: 'modules',
      populate: {
        path: 'lessons'
      }
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const hasAccess = (course.price === 0) || !!enrollment;
    
    // For purchased courses, unlock all modules and lessons
    if (hasAccess && enrollment) {
      // We'll return the complete unlocked course data
      const unlockedCourse = {
        ...course.toObject(),
        modules: course.modules.map(module => ({
          ...module.toObject(),
          isLocked: false,
          lessons: module.lessons.map(lesson => ({
            ...lesson.toObject(),
            isLocked: false
          }))
        }))
      };
      
      return res.json({
        success: true,
        hasAccess: true,
        isPurchased: true,
        enrollmentDate: enrollment.completedAt,
        course: unlockedCourse
      });
    }
    
    // For non-purchased courses, return just the access status
    return res.json({
      success: true,
      hasAccess,
      isPurchased: false,
      enrollmentDate: enrollment ? enrollment.completedAt : null
    });
  } catch (error) {
    console.error('Access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check course access'
    });
  }
});

// Update the lesson access endpoint
router.get('/:courseId/modules/:moduleId/lessons/:lessonId', auth, async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    
    // First check if the user has purchased the course
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
      status: 'completed'
    });
    
    const isPurchased = !!enrollment;
    
    // Find the lesson
    const course = await Course.findById(courseId);
    const module = course.modules.id(moduleId);
    const lesson = module.lessons.id(lessonId);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // If the course is purchased, provide full access
    if (isPurchased) {
      return res.json({
        success: true,
        lesson: {
          ...lesson.toObject(),
          isLocked: false
        }
      });
    }
    
    // Otherwise apply the normal lesson unlock logic
    // (Keep your existing logic here for determining if a lesson should be locked)
    
    return res.json({
      success: true,
      lesson
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson'
    });
  }
});

// Fix the route path to match what the frontend expects
// Change from '/course/:id' to '/courses/:id'
router.get('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId)
      .populate('instructor', 'name email bio profilePicture')
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons'
        }
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is logged in and has purchased the course
    let isPurchased = false;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'abcd');
        
        // Check enrollment status
        const enrollment = await Enrollment.findOne({
          user: decoded.id,
          course: courseId,
          status: 'completed'
        });
        
        isPurchased = !!enrollment;
        
        // For purchased courses, mark all lessons as unlocked
        if (isPurchased) {
          course.modules.forEach(module => {
            module.isLocked = false;
            module.lessons.forEach(lesson => {
              lesson.isLocked = false;
            });
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Continue without authentication - will show default locks
      }
    }

    res.json({
      success: true,
      course,
      isPurchased
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course details'
    });
  }
});

module.exports = router; 