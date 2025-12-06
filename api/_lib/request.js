// Request handler wrapper for Vercel serverless functions
export function createHandler(handler) {
  return async (req, res) => {
    try {
      // Normalize request object for Vercel
      const normalizedReq = {
        method: req.method || req.httpMethod,
        url: req.url || req.path,
        headers: req.headers || {},
        body: req.body,
        query: req.query || {},
        params: req.params || {}
      };

      // Extract path parameters from URL
      const urlParts = normalizedReq.url.split('?')[0].split('/');
      normalizedReq.urlParts = urlParts;

      const result = await handler(normalizedReq);

      // If result is a response object, send it
      if (result && typeof result === 'object' && result.statusCode) {
        res.status(result.statusCode);
        if (result.headers) {
          Object.keys(result.headers).forEach(key => {
            res.setHeader(key, result.headers[key]);
          });
        }
        return res.send(result.body);
      }

      // Otherwise, assume it's JSON
      return res.json(result);
    } catch (error) {
      console.error('Handler error:', error);
      return res.status(500).json({ error: error.message });
    }
  };
}

