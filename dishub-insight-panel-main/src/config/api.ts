export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Dishub Monitoring';

// Validate required environment variables
if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL not set, using default:', API_BASE_URL);
}