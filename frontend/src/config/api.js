// API configuration
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? window.location.origin + '/api'
    : 'http://localhost:4000/api');

export default API_URL;

