// URL parsing utilities
// Safely extracts parameters from Vercel serverless function URLs

/**
 * Extracts ID from URL path
 * @param {string} url - Full request URL
 * @param {string} pattern - Regex pattern to match (should include capture group)
 * @returns {string|null} - Extracted ID or null if not found
 */
export const extractIdFromUrl = (url, pattern) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const match = url.match(pattern);
    return match && match[1] ? match[1] : null;
  } catch (error) {
    console.error('Error extracting ID from URL:', error);
    return null;
  }
};

/**
 * Safely parses JSON from request body
 * @param {any} body - Request body (string or object)
 * @returns {any} - Parsed body or original if already object
 * @throws {Error} If JSON parsing fails
 */
export const parseRequestBody = (body) => {
  if (!body) return null;
  if (typeof body === 'object') return body;
  if (typeof body !== 'string') {
    throw new Error('Invalid request body type');
  }
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
};

