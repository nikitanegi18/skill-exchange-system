// Centralized API configuration for local and cloud production
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const USER_API_URL = import.meta.env.VITE_USER_API_URL || (isLocal ? 'http://localhost:5001' : 'https://user-service.onrender.com');
export const SKILL_API_URL = import.meta.env.VITE_SKILL_API_URL || (isLocal ? 'http://localhost:5002' : 'https://skill-service.onrender.com');
export const EXCHANGE_API_URL = import.meta.env.VITE_EXCHANGE_API_URL || (isLocal ? 'http://localhost:5003' : 'https://exchange-service.onrender.com');
export const MESSAGING_API_URL = import.meta.env.VITE_MESSAGING_API_URL || (isLocal ? 'http://localhost:3001' : 'https://messaging-service.onrender.com');


