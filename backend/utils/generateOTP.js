const crypto = require('crypto');

/**
 * Generate a cryptographically secure 6-digit OTP
 * @returns {string} A 6-digit numeric OTP string
 */
const generateOTP = () => {
  // crypto.randomInt generates a cryptographically secure random integer
  const otp = crypto.randomInt(100000, 999999);
  return otp.toString();
};

module.exports = { generateOTP };
