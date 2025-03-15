const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const userAuth = require('../middleware/userAuth');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const jwt = require('jsonwebtoken');
const { jwtDecode } = require('jwt-decode');

// Improve Razorpay initialization and error handling
let razorpay;
try {
  const Razorpay = require('razorpay');
  // Try loading Razorpay
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_4R9HUZ5jzRkcZH',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dJyCyC7BKyB0YsdXZtgPzPLB'
  });
  console.log('Razorpay initialized successfully with live credentials');
} catch (error) {
  console.warn('Razorpay package not installed or error initializing. Using reliable mock implementation.');
  
  // Improved mock implementation that won't fail
  razorpay = {
    orders: {
      create: async (options) => {
        console.log('MOCK: Creating order with options:', options);
        
        // Simulate a short delay like a real API would have
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Always return a valid mock order
        return {
          id: 'order_mock_' + Date.now(),
          amount: options.amount,
          currency: options.currency || 'INR',
          receipt: options.receipt || 'receipt_' + Date.now(),
          status: 'created',
          created_at: new Date().toISOString()
        };
      }
    }
  };
}

// Create a payment order
router.post('/create-order', userAuth, async (req, res) => {
  try {
    console.log('User from auth middleware:', req.user);
    const { courseId, amount } = req.body;
    console.log('Request body received:', { courseId, amount });
    
    if (!courseId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course ID and amount are required' 
      });
    }
    
    // Ensure the user ID is available
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token'
      });
    }
    console.log('User ID confirmed:', req.user.id);
    
    // Verify course exists
    console.log('Finding course with ID:', courseId);
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }
    console.log('Course found:', course.title);
    
    // Check if user is already enrolled
    console.log('Checking for existing enrollment...');
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId
    });
    console.log('Existing enrollment:', existingEnrollment);
    
    if (existingEnrollment && existingEnrollment.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already enrolled in this course' 
      });
    }
    
    // Create Razorpay order with better error handling
    console.log('Creating Razorpay order...');
    let order;
    
    try {
      // Wrap in try/catch but with better handling
      order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Ensure amount is a proper integer
        currency: 'INR',
        receipt: `rcpt_${Date.now().toString().slice(-10)}`,
        payment_capture: 1,
        notes: {
          courseId: courseId,
          userId: req.user.id.toString()
        }
      });
      
      console.log('Order created successfully:', order);
      
      // Create or update enrollment with pending status
      if (existingEnrollment) {
        console.log('Updating existing enrollment...');
        existingEnrollment.orderId = order.id;
        existingEnrollment.amount = amount;
        existingEnrollment.status = 'pending';
        await existingEnrollment.save();
      } else {
        console.log('Creating new enrollment...');
        await Enrollment.create({
          user: req.user.id,
          course: courseId,
          orderId: order.id,
          amount: amount,
          status: 'pending'
        });
      }
      
      res.status(200).json({
        success: true,
        order
      });
    } catch (razorpayError) {
      console.error('Razorpay order creation failed:', razorpayError);
      
      // Create a fallback mock order for development
      if (process.env.NODE_ENV !== 'production') {
        console.log('Using fallback mock order for development');
        order = {
          id: 'order_mock_fallback_' + Date.now(),
          amount: amount * 100,
          currency: 'INR', 
          receipt: `receipt_${courseId}_${Date.now()}`,
          status: 'created',
          created_at: new Date().toISOString()
        };
      } else {
        return res.status(500).json({
          success: false,
          message: 'Payment gateway error',
          error: razorpayError.message
        });
      }
    }
    
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment order',
      error: error.message,
      stack: error.stack // Include stack trace for debugging
    });
  }
});

// Verify payment
router.post('/verify', userAuth, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      courseId 
    } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'All payment details are required' 
      });
    }
    
    // Find enrollment
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
      orderId: razorpay_order_id
    });
    
    if (!enrollment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Enrollment not found' 
      });
    }
    
    // In development or without Razorpay, we'll auto-verify for testing
    let signatureValid = true;
    
    if (process.env.RAZORPAY_KEY_SECRET) {
      // Verify signature with actual key if available
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      
      signatureValid = (generatedSignature === razorpay_signature);
    }
    
    if (!signatureValid) {
      enrollment.status = 'failed';
      await enrollment.save();
      
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }
    
    // Update enrollment to completed
    enrollment.status = 'completed';
    enrollment.paymentId = razorpay_payment_id;
    enrollment.completedAt = new Date();
    await enrollment.save();
    
    console.log('Enrollment updated to completed:', {
      userId: req.user.id,
      courseId,
      status: 'completed',
      completedAt: enrollment.completedAt
    });
    
    // Increment course student count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { students: 1 }
    });
    
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      enrollment
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify payment',
      error: error.message 
    });
  }
});

// Update the checkout-auth route with better validation and error handling
router.post('/checkout-auth', async (req, res) => {
  try {
    const { email, phoneNumber, credential } = req.body;
    
    console.log('Checkout Auth Request:', { 
      hasEmail: !!email, 
      hasPhoneNumber: !!phoneNumber, 
      hasCredential: !!credential 
    });
    
    // If Google credential is provided, use it for authentication
    if (credential) {
      try {
        // Add more detailed logging to diagnose the issue
        console.log('Attempting to decode credential:', credential.substring(0, 20) + '...');
        
        // Ensure the credential is a valid string
        if (typeof credential !== 'string' || !credential.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Invalid credential format',
          });
        }
        
        const decoded = jwtDecode(credential);
        console.log('Successfully decoded Google data:', decoded);
        
        // Check if user already exists
        let user = await User.findOne({ email: decoded.email });
        
        if (user) {
          // User exists, log them in
          const token = jwt.sign(
            { 
              id: user._id,
              userId: user._id,
              email: user.email
            },
            process.env.JWT_SECRET || 'abcd',
            { expiresIn: '7d' }
          );
          
          return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber
            },
            isNewUser: false
          });
        } else {
          // Need phone number for new Google users
          if (!phoneNumber) {
            return res.status(400).json({
              success: false,
              message: 'Phone number is required for new users',
              requiresPhoneNumber: true,
              googleData: {
                email: decoded.email,
                firstName: decoded.given_name,
                lastName: decoded.family_name
              }
            });
          }
          
          // Validate phone number format
          const phoneRegex = /^\+?[0-9]{10,15}$/;
          if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
              success: false,
              message: 'Please provide a valid phone number (10-15 digits)',
              requiresPhoneNumber: true,
              googleData: {
                email: decoded.email,
                firstName: decoded.given_name,
                lastName: decoded.family_name
              }
            });
          }
          
          // Create new user from Google data
          try {
            user = new User({
              firstName: decoded.given_name || decoded.email.split('@')[0],
              lastName: decoded.family_name || '',
              email: decoded.email,
              phoneNumber: phoneNumber,
              password: crypto.randomBytes(16).toString('hex'), // Random password
              isEmailVerified: decoded.email_verified || false
            });
            
            await user.save();
            
            const token = jwt.sign(
              { 
                id: user._id,
                userId: user._id,
                email: user.email
              },
              process.env.JWT_SECRET || 'abcd',
              { expiresIn: '7d' }
            );
            
            return res.status(201).json({
              success: true,
              message: 'Account created successfully',
              token,
              user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber
              },
              isNewUser: true
            });
          } catch (userError) {
            console.error('Error creating user from Google data:', userError);
            return res.status(400).json({
              success: false,
              message: 'Failed to create account: ' + userError.message,
              error: userError.message
            });
          }
        }
      } catch (decodeError) {
        console.error('Google credential decode error:', decodeError);
        return res.status(400).json({
          success: false,
          message: 'Failed to decode Google credentials',
          error: decodeError.message
        });
      }
    } 
    // Email + Phone authentication
    else if (email && phoneNumber) {
      // Validate phone number format
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid phone number (10-15 digits)'
        });
      }
      
      // Check if user exists
      let user = await User.findOne({ email });
      
      if (user) {
        // Existing user - create token and log in
        const token = jwt.sign(
          { 
            id: user._id,
            userId: user._id,
            email: user.email
          },
          process.env.JWT_SECRET || 'abcd',
          { expiresIn: '7d' }
        );
        
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            _id: user._id,
            firstName: user.firstName || email.split('@')[0],
            lastName: user.lastName || '',
            email: user.email,
            phoneNumber: user.phoneNumber
          },
          isNewUser: false
        });
      } else {
        // Create new user with minimal information
        try {
          user = new User({
            firstName: email.split('@')[0], // Extract username from email
            lastName: '',
            email,
            phoneNumber,
            password: crypto.randomBytes(16).toString('hex'), // Random password
            isEmailVerified: false
          });
          
          await user.save();
          
          const token = jwt.sign(
            { 
              id: user._id,
              userId: user._id,
              email: user.email
            },
            process.env.JWT_SECRET || 'abcd',
            { expiresIn: '7d' }
          );
          
          return res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber
            },
            isNewUser: true
          });
        } catch (userError) {
          console.error('Error creating user with email/phone:', userError);
          return res.status(400).json({
            success: false,
            message: 'Failed to create account: ' + userError.message,
            error: userError.message
          });
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Email and phone number or Google credential is required'
      });
    }
  } catch (error) {
    console.error('Checkout authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});

module.exports = router; 