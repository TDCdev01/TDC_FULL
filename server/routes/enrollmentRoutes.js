const express = require('express');
const router = express.Router();
const userAuth = require('../middleware/userAuth');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// Get user's enrolled courses
router.get('/my-courses', userAuth, async (req, res) => {
  try {
    // Find all completed enrollments for the user
    const enrollments = await Enrollment.find({
      user: req.user.id,
      status: 'completed'
    }).populate({
      path: 'course',
      select: 'title description image instructor price duration lessons',
      populate: {
        path: 'instructor',
        select: 'name'
      }
    }).sort({ completedAt: -1 });
    
    res.json({
      success: true,
      enrollments
    });
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load enrolled courses',
      error: error.message
    });
  }
});

// Get detailed enrollment info for a specific course
router.get('/:courseId', userAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log(`Checking enrollment for user ${req.user.id} and course ${courseId}`);
    
    // Find the enrollment
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
      status: 'completed'
    });
    
    console.log('Enrollment search result:', enrollment ? {
      id: enrollment._id,
      status: enrollment.status,
      completedAt: enrollment.completedAt
    } : 'Not found');
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    res.json({
      success: true,
      enrollment
    });
  } catch (error) {
    console.error('Error fetching enrollment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load enrollment details',
      error: error.message
    });
  }
});

module.exports = router; 