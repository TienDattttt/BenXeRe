/**
 * Application configuration
 * Contains environment-specific settings
 */

// API and WebSocket URLs
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
    REGISTER: `${API_URL}/api/auth/register`,
    REFRESH: `${API_URL}/api/auth/refresh`,
  },
  
  // User endpoints
  USER: {
    PROFILE: `${API_URL}/api/users`,
    BY_ROLE: `${API_URL}/api/users/by-role`,
  },
  
  // Chat endpoints
  CHAT: {
    HISTORY: `${API_URL}/api/chat/history`,
    UNREAD: `${API_URL}/api/chat/unread`,
  },
  
  // WebSocket endpoint
  WS: WS_URL,
};

export default {
  API_URL,
  WS_URL,
  ENDPOINTS,
}; 