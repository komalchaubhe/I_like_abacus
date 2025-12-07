import { corsHeaders } from './cors.js';

export const jsonResponse = (data, statusCode = 200) => {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
};

/**
 * Creates error response with proper error handling
 * Security fix: Don't expose internal error details in production
 */
export const errorResponse = (error, statusCode = 500) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Determine error message based on environment
  let message;
  if (error instanceof Error) {
    // In production, don't expose internal error messages
    message = isDevelopment ? error.message : 'Internal server error';
    // Log full error for debugging (in production, this should go to logging service)
    if (!isDevelopment) {
      console.error('Error:', {
        message: error.message,
        stack: error.stack,
        statusCode
      });
    }
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Internal server error';
  }
  
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: message }),
  };
};

