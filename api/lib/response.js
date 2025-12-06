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

export const errorResponse = (error, statusCode = 500) => {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: error.message || error }),
  };
};

