const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your university email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@(g\.)?bracu\.ac\.bd$/,
        'Please provide a valid BRACU email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'supervisor'],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to detect role from email
userSchema.statics.detectRole = function (email) {
  if (email.endsWith('@g.bracu.ac.bd')) {
    return 'student';
  } else if (email.endsWith('@bracu.ac.bd')) {
    return 'supervisor';
  }
  return null;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
