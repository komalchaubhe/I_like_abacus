// CORS headers for Vercel serverless functions
// Security fix: Never use wildcard in production
const getCorsOrigin = () => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (process.env.NODE_ENV === 'production') {
    // Production: Require explicit FRONTEND_URL, never allow wildcard
    if (!frontendUrl || frontendUrl === '*') {
      console.error('ERROR: FRONTEND_URL must be set in production');
      return null; // Will cause CORS to fail, which is safer than allowing all origins
    }
    return frontendUrl;
  }
  // Development: Allow wildcard or specific URL
  return frontendUrl || '*';
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': getCorsOrigin() || process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export const handleCors = (req) => {
  if (req.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({}),
    };
  }
  return null;
};

