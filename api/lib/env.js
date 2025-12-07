// Environment variable validation
// Ensures required environment variables are set and valid

/**
 * Validates that all required environment variables are set
 * @throws {Error} If any required variable is missing
 */
export const validateEnv = () => {
  const required = ['JWT_SECRET', 'DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Security: Never allow wildcard CORS in production
  if (process.env.NODE_ENV === 'production' && (!process.env.FRONTEND_URL || process.env.FRONTEND_URL === '*')) {
    throw new Error('FRONTEND_URL must be set to a specific domain in production (cannot be "*")');
  }
  
  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('WARNING: JWT_SECRET should be at least 32 characters long for security');
  }
};

/**
 * Gets JWT_SECRET with validation
 * @returns {string} - JWT secret
 * @throws {Error} If JWT_SECRET is not set
 */
export const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return process.env.JWT_SECRET;
};

