// Frontend error handling utility
// Provides user-friendly error messages from API responses

/**
 * Extracts user-friendly error message from API error
 * @param {Error} error - Axios error object
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.error;
    
    switch (status) {
      case 401:
        return 'Please log in to continue';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'The requested resource was not found';
      case 400:
        return message || 'Invalid request. Please check your input.';
      case 500:
        return 'Server error. Please try again later';
      default:
        return message || 'An error occurred';
    }
  }
  
  if (error.request) {
    return 'Network error. Please check your connection';
  }
  
  return error.message || 'An unexpected error occurred';
};

