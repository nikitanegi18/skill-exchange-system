// Centralized API configuration for local and cloud production
const isRender = typeof window !== 'undefined' && window.location.hostname.includes('onrender.com');

export const USER_API_URL = import.meta.env.VITE_USER_API_URL || (isRender ? 'https://user-service.onrender.com' : 'http://localhost:5001');
export const SKILL_API_URL = import.meta.env.VITE_SKILL_API_URL || (isRender ? 'https://skill-service.onrender.com' : 'http://localhost:5002');
export const EXCHANGE_API_URL = import.meta.env.VITE_EXCHANGE_API_URL || (isRender ? 'https://exchange-service.onrender.com' : 'http://localhost:5003');
export const MESSAGING_API_URL = import.meta.env.VITE_MESSAGING_API_URL || (isRender ? 'https://messaging-service.onrender.com' : 'http://localhost:3001');
