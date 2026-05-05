const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validateUniversityEmail } = require('../utils/emailValidator');
const { generateOTP } = require('../utils/generateOTP');
const { sendVerificationEmail } = require('../utils/emailService');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, confirmPassword',
      });
    }

    // Check passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Validate university email
    const emailValidation = validateUniversityEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.error,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // If user exists but is not verified, allow re-registration with new OTP
      if (!existingUser.isVerified) {
        const otp = generateOTP();
        const hashedOTP = await bcrypt.hash(otp, 10);

        existingUser.name = name;
        existingUser.password = password; // Will be hashed by pre-save hook
        existingUser.otp = hashedOTP;
        existingUser.otpExpiry = new Date(
          Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60 * 1000
        );
        await existingUser.save();

        // Send verification email
        await sendVerificationEmail(email, otp, name);

        return res.status(200).json({
          success: true,
          message: 'A new verification code has been sent to your email.',
          data: {
            email: existingUser.email,
            role: existingUser.role,
          },
        });
      }

      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: emailValidation.role,
      otp: hashedOTP,
      otpExpiry: new Date(
        Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60 * 1000
      ),
    });

    // Send verification email
    await sendVerificationEmail(email, otp, name);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the verification code.',
      data: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email with OTP
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code',
      });
    }

    // Find user with OTP fields
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+otp +otpExpiry'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified. Please log in.',
      });
    }

    // Check OTP expiry
    if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Compare OTP
    const isOTPValid = await bcrypt.compare(otp.toString(), user.otp);
    if (!isOTPValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please try again.',
      });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateModifiedOnly: true });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to Thes-ease.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP verification code
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified. Please log in.',
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);

    user.otp = hashedOTP;
    user.otpExpiry = new Date(
      Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60 * 1000
    );
    await user.save({ validateModifiedOnly: true });

    // Send verification email
    await sendVerificationEmail(email, otp, user.name);

    res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email,
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  resendOTP,
  login,
  getMe,
};
