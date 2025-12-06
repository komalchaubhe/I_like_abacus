import { handleCors, jsonResponse } from './lib/response.js';

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  return jsonResponse({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
}

