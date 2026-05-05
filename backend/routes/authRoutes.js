const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendOTP,
  login,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
