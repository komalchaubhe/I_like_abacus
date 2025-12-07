// Input validation utilities
// Validates user inputs to prevent invalid data and security issues

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, error?: string}} - Validation result
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  return { valid: true };
};

/**
 * Validates user role
 * @param {string} role - Role to validate
 * @returns {boolean} - True if valid role
 */
export const validateRole = (role) => {
  const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
  return validRoles.includes(role?.toUpperCase());
};

/**
 * Validates abacus state structure
 * @param {any} abacusState - Abacus state to validate
 * @returns {{valid: boolean, error?: string}} - Validation result
 */
export const validateAbacusState = (abacusState) => {
  if (!Array.isArray(abacusState)) {
    return { valid: false, error: 'Abacus state must be an array' };
  }
  if (abacusState.length === 0 || abacusState.length > 20) {
    return { valid: false, error: 'Abacus state must have 1-20 rods' };
  }
  for (let i = 0; i < abacusState.length; i++) {
    const rod = abacusState[i];
    if (typeof rod !== 'object' || rod === null) {
      return { valid: false, error: `Rod ${i} must be an object` };
    }
    if (typeof rod.upperBead !== 'boolean') {
      return { valid: false, error: `Rod ${i} must have a boolean upperBead property` };
    }
    if (typeof rod.lowerBeads !== 'number' || !Number.isInteger(rod.lowerBeads) || rod.lowerBeads < 0 || rod.lowerBeads > 4) {
      return { valid: false, error: `Rod ${i} must have 0-4 lowerBeads (integer)` };
    }
  }
  return { valid: true };
};

/**
 * Validates class number (1-8)
 * @param {number} classNum - Class number to validate
 * @returns {boolean} - True if valid class number
 */
export const validateClass = (classNum) => {
  const num = Number(classNum);
  return Number.isInteger(num) && num >= 1 && num <= 8;
};

/**
 * Validates level number (1-5)
 * @param {number} level - Level number to validate
 * @returns {boolean} - True if valid level number
 */
export const validateLevel = (level) => {
  const num = Number(level);
  return Number.isInteger(num) && num >= 1 && num <= 5;
};

