/**
 * @typedef {Object} User
 * @property {string} id - User's unique identifier
 * @property {string} email - User's email address
 * @property {string} name - User's full name
 * @property {string} role - User's role (admin, busOwner, user)
 * @property {string} avatar - URL to user's avatar image
 * @property {string} phone - User's phone number
 * @property {boolean} isVerified - Whether the user's email is verified
 * @property {string} createdAt - Account creation timestamp
 */

/**
 * @typedef {Object} AuthCredentials
 * @property {string} email - User's email
 * @property {string} password - User's password
 */

/**
 * @typedef {Object} AuthTokens
 * @property {string} accessToken - JWT access token
 * @property {string} refreshToken - JWT refresh token
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} email - User's email
 * @property {string} password - User's password
 * @property {string} name - User's full name
 * @property {string} phone - User's phone number
 */

/**
 * User roles in the system
 */
export const UserRoles = {
  ADMIN: 'admin',
  BUS_OWNER: 'busOwner',
  USER: 'user',
};

/**
 * Authentication status
 */
export const AuthStatus = {
  IDLE: 'idle',
  AUTHENTICATING: 'authenticating',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error',
};

/**
 * Verification status
 */
export const VerificationStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
};