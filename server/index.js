require('dotenv').config();

const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Profile = require('./models/Profile');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const path = require('path');
const Admin = require('./models/Admin');
const blogPostRoutes = require('./routes/blogPost');
const logRoutes = require('./routes/logs');
const { logUserActivity } = require('./services/logService');
const auth = require('./middleware/auth');
const { API_URL } = require('./config/config');
const BlogPost = require('./models/BlogPost');

const app = express();
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Mount the blog posts routes
app.use('/api', blogPostRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://anshuman:Anshuman123@cluster0.nqygv2g.mongodb.net/TDC?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  // Log the actual URI being used (but mask sensitive parts)
  const uri = process.env.MONGODB_URI || 'fallback_uri';
  console.log('Attempted connection with URI:', uri.replace(/\/\/.*@/, '//<credentials>@'));
});

// Add this to debug environment variables
console.log('Environment Variables Status:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not Set');
console.log('NODE_ENV:', process.env.NODE_ENV);

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client with validation
let client;
try {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials are missing');
  }
  client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('Twilio client initialized successfully');
} catch (error) {
  console.error('Twilio initialization error:', error);
}

// Store OTPs (in production, use a proper database)
const otpStore = new Map();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// SendGrid configuration
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Helper function to normalize phone number
const normalizePhoneNumber = (phoneNumber) => {
  // Remove any spaces, dashes, or other special characters
  let normalized = phoneNumber.replace(/\D/g, '');
  
  // If number starts with '+', remove it
  if (normalized.startsWith('+')) {
    normalized = normalized.substring(1);
  }
  
  // If number starts with country code (91), keep it as is
  // If it doesn't, assume it's an Indian number and add '91'
  if (!normalized.startsWith('91')) {
    normalized = '91' + normalized;
  }
  
  return normalized;
};

app.post('/api/send-otp', async (req, res) => {
  try {
    if (!client) {
      throw new Error('Twilio client not initialized');
    }

    const { phoneNumber, userId } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('Attempting to send OTP to:', phoneNumber);
    console.log('Using Twilio number:', process.env.TWILIO_PHONE_NUMBER);
    
    try {
      const message = await client.messages.create({
        body: `Your TDC verification code is: ${otp}. Valid for 5 minutes.`,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER
      });

      console.log('Message sent successfully:', message.sid);
      
      otpStore.set(phoneNumber, {
        otp,
        timestamp: Date.now(),
        attempts: 0,
        userId: userId || null
      });
      
      res.json({ 
        success: true, 
        message: 'OTP sent successfully',
        messageId: message.sid 
      });

    } catch (twilioError) {
      console.error('Twilio Error Details:', {
        status: twilioError.status,
        code: twilioError.code,
        message: twilioError.message,
        moreInfo: twilioError.moreInfo
      });
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP via Twilio',
        error: twilioError.message,
        code: twilioError.code
      });
    }

  } catch (error) {
    console.error('Error in send-otp endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    // TODO: Implement your OTP verification logic here
    const isValid = await verifyOtp(phoneNumber, otp); // Replace with actual verification logic

    if (isValid) {
      res.json({ success: true, message: 'OTP verified successfully.' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
  }
});

// Add this function to send welcome email
const sendWelcomeEmail = async (userEmail, firstName) => {
  const msg = {
    to: userEmail,
    from: 'iamuchihamadara001@gmail.com', // Your verified sender
    subject: 'Welcome to TopDataCOach 🎉',
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
  <h1 style="text-align: center; color: #0056b3;">Welcome to TopDataCoach, ${firstName}! 🎉</h1>
  <p>Hello ${firstName},</p>
  <p>We're thrilled to welcome you to the TopDataCoach community! Whether you're here to enhance your skills, build your career, or dive into the world of data, you've come to the right place.</p>
  <p>Here's what you can look forward to:</p> 
  <ul>
    <li>Expert-led courses designed to empower your growth.</li>
    <li>A vibrant community of learners and professionals.</li>
    <li>Dedicated resources to support your journey to success.</li>
  </ul>
  <p>To get started, log in to your account and explore our resources:</p>
  <p style="text-align: center;">
    <a href="https://topdatacoach.com/login" style="text-decoration: none; background-color: #0056b3; color: white; padding: 10px 20px; border-radius: 5px;">Access Your Dashboard</a>
  </p>
  <p>Need help or have questions? Our support team is always here for you. Just reply to this email or visit our <a href="https://topdatacoach.com/support" style="color: #0056b3;">Help Center</a>.</p>
  <p>Once again, welcome aboard! We can't wait to see what you'll achieve.</p>
  <p>Best regards,<br>The TopDataCoach Team</p>
</div>

    `
  };

  try {
    await sgMail.send(msg);
    console.log('Welcome email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// New endpoint to complete registration
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    // Normalize the phone number before saving
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { phoneNumber: normalizedPhoneNumber },
        { phoneNumber: normalizedPhoneNumber.substring(2) },
        { phoneNumber: `+${normalizedPhoneNumber}` }
      ] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone number already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with normalized phone number
    const user = new User({
      firstName,
      lastName,
      email,
      phoneNumber: normalizedPhoneNumber, // Store normalized number
      password: hashedPassword
    });

    await user.save();

    // Send welcome email
    await sendWelcomeEmail(email, firstName);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration'
    });
  }
});

// Optional: Add login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, phoneNumber, otp } = req.body;

    // Handle email/password login
    if (email && password) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Log successful login
      try {
        await logUserActivity(user._id, 'login', req, 'success');
      } catch (logError) {
        console.error('Error logging login activity:', logError);
      }

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isAdmin: user.isAdmin
        }
      });
    }

    // Handle phone/OTP login
    if (phoneNumber && otp) {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const storedOTP = otpStore.get(normalizedPhone);

      if (!storedOTP || storedOTP !== otp) {
        // Log failed login attempt
        if (storedOTP) {
          const user = await User.findOne({ phoneNumber: normalizedPhone });
          if (user) {
            await logUserActivity(user._id, 'login', req, 'failed');
          }
        }
        return res.status(401).json({ success: false, message: 'Invalid OTP' });
      }

      let user = await User.findOne({ phoneNumber: normalizedPhone });
      if (!user) {
        user = new User({ phoneNumber: normalizedPhone });
        await user.save();
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      
      // Log successful login
      try {
        await logUserActivity(user._id, 'login', req, 'success');
      } catch (logError) {
        console.error('Error logging login activity:', logError);
      }

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          isProfileComplete: user.isProfileComplete
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid login credentials'
    });

  } catch (error) {
    console.error('Login error:', error);
    // Log error if we have user information
    if (req.body.email || req.body.phoneNumber) {
      try {
        const user = await User.findOne({ 
          $or: [
            { email: req.body.email },
            { phoneNumber: req.body.phoneNumber ? normalizePhoneNumber(req.body.phoneNumber) : null }
          ]
        });
        if (user) {
          await logUserActivity(user._id, 'login', req, 'failed');
        }
      } catch (logError) {
        console.error('Error logging failed login:', logError);
      }
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Optional: Endpoint to receive message status updates
app.post('/api/message-status', (req, res) => {
  const messageSid = req.body.MessageSid;
  const messageStatus = req.body.MessageStatus;
  
  console.log('Message SID:', messageSid);
  console.log('Status:', messageStatus);
  
  res.sendStatus(200);
});

// Add middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Add a protected route example
app.get('/api/user-profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

// Get profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.userId });
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// Create or update profile
app.post('/api/profile', authenticateToken, async (req, res) => {
  try {
    const {
      name, dob, city, country, phone, email,
      education, department, occupation
    } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.userId },
      {
        userId: req.user.userId,
        name, dob, city, country, phone, email,
        education, department, occupation,
        updatedAt: Date.now()
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// Add this new endpoint for token refresh
app.post('/api/refresh-token', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate new token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ success: false, message: 'Error refreshing token' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: email,
      to: process.env.CONTACT_EMAIL,
      subject: `Contact Form: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

// Update the Google auth endpoint with better error handling
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, message: 'Credential is required' });
  }

  try {
    console.log('Received credential:', credential);

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID || "860236340511-50m5cq2vv6tb1lhhhmttt3v65a6hklki.apps.googleusercontent.com"
    });
    
    const payload = ticket.getPayload();
    console.log('Google payload:', payload);

    // Check if user exists
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        password: crypto.randomBytes(16).toString('hex'),
        verified: true
      });
      await user.save();
      console.log('New user created:', user);
    }

    // Generate JWT token
    const newToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Generated token and sending response');

    res.status(200).json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Detailed Google auth error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credential',
      error: error.message 
    });
  }
});

// Update the Facebook authentication endpoint
app.post('/api/auth/facebook', async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    // Fetch user data from Facebook
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,first_name,last_name,email&access_token=${accessToken}`
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create temporary user data (similar to Google flow)
    const tempUser = {
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      facebookId: data.id,
      password: crypto.randomBytes(16).toString('hex') // Generate random password
    };

    // Return temporary user data
    res.json({
      success: true,
      message: 'Temporary user created',
      tempUser
    });

  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed',
      error: error.message 
    });
  }
});

// Add Facebook signup completion endpoint
app.post('/api/auth/facebook/complete-signup', async (req, res) => {
  const { tempUser, phoneNumber, verificationCode } = req.body;

  try {
    // Verify OTP
    const storedData = otpStore.get(phoneNumber);
    if (!storedData || storedData.otp !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Create new user in DB only after OTP verification
    const user = new User({
      email: tempUser.email,
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      phoneNumber: phoneNumber,
      password: tempUser.password,
      facebookId: tempUser.facebookId
    });

    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Clear OTP from store
    otpStore.delete(phoneNumber);

    // Send success response
    res.json({
      success: true,
      message: 'Signup completed successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (error) {
    console.error('Complete signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete signup',
      error: error.message
    });
  }
});

// Add endpoint to verify email
app.post('/api/auth/verify-email', async (req, res) => {
  const { token } = req.body; // Token should be sent in the request body

  // Verify the token and find the user
  // You can implement your token verification logic here

  // If valid, update the user's emailVerified status
  const user = await User.findById(userId); // Get user by ID from token
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.emailVerified = true;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully' });
});

// Add these new endpoints for forgot password flow
app.post('/api/forgot-password/send-otp', async (req, res) => {
  try {
    let { phoneNumber } = req.body;
    
    // Normalize the phone number from the request
    const normalizedRequestNumber = normalizePhoneNumber(phoneNumber);
    
    console.log('Looking for phone number:', normalizedRequestNumber);
    
    // Check if user exists with this phone number
    const user = await User.findOne({
      $or: [
        { phoneNumber: normalizedRequestNumber },
        { phoneNumber: normalizedRequestNumber.substring(2) },
        { phoneNumber: `+${normalizedRequestNumber}` },
        { phoneNumber: `+91${normalizedRequestNumber.substring(2)}` }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number'
      });
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      // Format the phone number for Twilio (needs + prefix)
      const recipientNumber = `+${normalizedRequestNumber}`;
      
      const message = await client.messages.create({
        body: `Your TDC password reset code is: ${otp}. Valid for 5 minutes.`,
        to: recipientNumber,
        from: twilioPhoneNumber // Use the Twilio phone number for sending
      });

      // Store OTP with timestamp and userId
      otpStore.set(recipientNumber, {
        otp,
        timestamp: Date.now(),
        attempts: 0,
        userId: user._id
      });
      
      console.log('OTP sent successfully to:', recipientNumber);
      
      res.json({ 
        success: true, 
        message: 'OTP sent successfully'
      });

    } catch (twilioError) {
      console.error('Twilio Error:', twilioError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP',
        error: twilioError.message
      });
    }

  } catch (error) {
    console.error('Error in forgot-password/send-otp:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.post('/api/forgot-password/verify-otp', async (req, res) => {
  try {
    let { phoneNumber, otp } = req.body;
    
    // Normalize the phone number
    const normalizedPhoneNumber = `+${normalizePhoneNumber(phoneNumber)}`;
    
    const storedData = otpStore.get(normalizedPhoneNumber);
    
    if (!storedData || storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // OTP is valid, return success with userId
    res.json({
      success: true,
      message: 'OTP verified successfully',
      userId: storedData.userId
    });

  } catch (error) {
    console.error('Error in forgot-password/verify-otp:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

app.post('/api/forgot-password/reset', async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Error in forgot-password/reset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// Add Facebook login endpoint
app.post('/api/auth/facebook/login', async (req, res) => {
  try {
    const { userData } = req.body;

    if (!userData || !userData.email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email and facebookId
    let user = await User.findOne({
      $or: [
        { email: userData.email },
        { facebookId: userData.id }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found. Please sign up first.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (error) {
    console.error('Facebook login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

app.post('/api/auth/google/signup', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ 
      success: false, 
      message: 'Credential is required' 
    });
  }

  try {
    console.log('Received credential:', credential);

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID || "860236340511-50m5cq2vv6tb1lhhhmttt3v65a6hklki.apps.googleusercontent.com"
    });
    
    const payload = ticket.getPayload();
    console.log('Google payload:', payload);

    // Check if user exists
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create temporary user data
    const tempUser = {
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      googleId: payload.sub,
      password: crypto.randomBytes(16).toString('hex')
    };

    // Send response with temporary user data
    return res.json({
      success: true,
      message: 'Temporary user created',
      tempUser
    });

  } catch (error) {
    console.error('Google signup error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to process Google signup',
      error: error.message 
    });
  }
});

// Define the verifyOtp function if not already defined
const verifyOtp = (phoneNumber, otp) => {
  const storedData = otpStore.get(phoneNumber);

  if (!storedData) {
    return false;
  }

  // Check OTP expiration (5 minutes)
  if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
    otpStore.delete(phoneNumber);
    return false;
  }

  // Verify OTP
  if (storedData.otp === otp) {
    otpStore.delete(phoneNumber); // Clear OTP after successful verification
    console.log(`Phone number ${phoneNumber} verified successfully`);
    return true;
  } else {
    // Increment failed attempts
    storedData.attempts += 1;
    otpStore.set(phoneNumber, storedData);
    return false;
  }
};

// Add the /api/auth/google/complete-signup endpoint
app.post('/api/auth/google/complete-signup', async (req, res) => {
  const { tempUser, phoneNumber, verificationCode } = req.body;

  try {
    // Verify OTP
    const isValid = verifyOtp(phoneNumber, verificationCode);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.'
      });
    }

    // Create new user in DB only after OTP verification
    const user = new User({
      email: tempUser.email,
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      phoneNumber: phoneNumber,
      password: tempUser.password,
      googleId: tempUser.googleId || null // Ensure googleId is handled
    });

    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Clear OTP from store
    otpStore.delete(phoneNumber);

    // Return success response
    res.json({
      success: true,
      message: 'Signup completed successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (error) {
    console.error('Complete Google signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete signup',
      error: error.message
    });
  }
});

// Add this route before the catch-all route
app.get('/student/success', async (req, res) => {
  try {
    // You can replace this with actual database queries if needed
    const successStories = [
      {
        name: "Priya Sharma",
        role: "Full Stack Developer",
        company: "Microsoft",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        story: "From a non-tech background to landing my dream job at Microsoft in just 8 months!",
        rating: 5
      },
      {
        name: "Rahul Kumar",
        role: "Data Scientist",
        company: "Amazon",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        story: "TDC's AI course helped me transition from analytics to data science seamlessly.",
        rating: 5
      },
      {
        name: "Neha Patel",
        role: "Cloud Engineer",
        company: "Google",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        story: "The hands-on projects and mentorship were game-changers in my career.",
        rating: 5
      }
    ];

    res.json({
      success: true,
      stories: successStories
    });
  } catch (error) {
    console.error('Error fetching success stories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching success stories'
    });
  }
});

/**
 * Middleware to verify if the requester is an admin.
 * It checks the Admin model using adminId from the token.
 */
const isAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.adminId);
    if (!admin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin rights required.' 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error checking admin status' 
    });
  }
};

// Get all users (Admin Protected)
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        // Fetch all users excluding passwords
        const users = await User.find({}, '-password');
        return res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get user details (Admin Protected)
app.get('/api/admin/users/:userId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, '-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user details' 
    });
  }
});

// Update user for admin (Admin Protected)
app.put('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        isAdmin: req.body.isAdmin,
        status: req.body.status
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'User updated successfully',
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        isAdmin: updatedUser.isAdmin,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Error updating user' 
    });
  }
});

// Delete user (Admin Protected)
app.delete('/api/admin/users/:userId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user' 
    });
  }
});

// Reset user password (Admin Protected)
app.post('/api/admin/users/:userId/reset-password', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    user.password = hashedPassword;
    await user.save();

    // Send email with temporary password
    await sendPasswordResetEmail(user.email, tempPassword);

    res.json({ 
      success: true, 
      message: 'Password reset email sent successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error resetting password' 
    });
  }
});

// Admin Register
app.post('/api/admin/register', async (req, res) => {
    try {
        const { name, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ name });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this name already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const admin = new Admin({
            name,
            password: hashedPassword
        });

        await admin.save();

        res.json({
            success: true,
            message: 'Admin registered successfully'
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during registration'
        });
    }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { name, password } = req.body;
        const admin = await Admin.findOne({ name });
        
        if (!admin) {
            return res.status(400).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Generate token with adminId included
        const token = jwt.sign(
            { adminId: admin._id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                name: admin.name
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Add this new endpoint for admin verification
app.get('/api/admin/verify', async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Find admin by ID
            const admin = await Admin.findById(decoded.adminId);
            if (!admin) {
                return res.status(403).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            return res.json({
                success: true,
                admin: {
                    id: admin._id,
                    name: admin.name
                }
            });
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError);
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        console.error('Admin verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

const sendPasswordResetEmail = async (userEmail, tempPassword) => {
  const msg = {
    to: userEmail,
    from: 'your-email@domain.com', // Replace with your verified sender
    subject: 'Password Reset Notification',
    text: `Your password has been reset. Your temporary password is: ${tempPassword}`,
    html: `<p>Your password has been reset.</p><p>Your temporary password is: <strong>${tempPassword}</strong></p>`,
  };

  try {
    await sgMail.send(msg);
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Routes
// app.use('/api', authRoutes);
// app.use('/api', userRoutes);
// app.use('/api', profileRoutes);
app.use('/api', blogPostRoutes);
app.use('/api', logRoutes);

// Add logout endpoint if you don't have one
app.post('/api/logout', auth, async (req, res) => {
  try {
    // Log the logout activity
    await logUserActivity(req.user.userId, 'logout', req);
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Error handling for undefined routes
app.use((req, res, next) => {
  console.log('404 - Route not found:', req.path);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Add this route to test Twilio credentials
app.get('/api/test-twilio', async (req, res) => {
  try {
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    res.json({
      success: true,
      status: account.status,
      type: account.type,
      friendlyName: account.friendlyName
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Twilio credentials are invalid',
      error: error.message
    });
  }
});

// Register the blog routes with /api prefix

// Add this after your other routes but before error handlers

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
