/**
 * Validates that an email belongs to an allowed university domain.
 * 
 * Allowed domains:
 *   - Students:    @g.bracu.ac.bd
 *   - Supervisors: @bracu.ac.bd
 */

const ALLOWED_DOMAINS = {
  'g.bracu.ac.bd': 'student',
  'bracu.ac.bd': 'supervisor',
};

/**
 * Validate a university email address
 * @param {string} email - The email address to validate
 * @returns {{ valid: boolean, role: string|null, error: string|null }}
 */
const validateUniversityEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, role: null, error: 'Email is required' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, role: null, error: 'Invalid email format' };
  }

  // Extract domain
  const domain = trimmedEmail.split('@')[1];

  // Check against allowed domains
  if (ALLOWED_DOMAINS[domain]) {
    return {
      valid: true,
      role: ALLOWED_DOMAINS[domain],
      error: null,
    };
  }

  return {
    valid: false,
    role: null,
    error: 'Only BRACU university email addresses are allowed (@g.bracu.ac.bd for students, @bracu.ac.bd for supervisors)',
  };
};

module.exports = { validateUniversityEmail };
