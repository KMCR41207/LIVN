/**
 * Token utility functions for JWT handling
 */

/**
 * Parse JWT token payload
 * @param {string} token - JWT token
 * @returns {Object | null} Decoded payload or null if invalid
 */
export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT:', e);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;

  return payload.exp * 1000 < Date.now();
};

/**
 * Get token expiry time in milliseconds
 * @param {string} token - JWT token
 * @returns {number | null} Expiry timestamp or null if invalid
 */
export const getTokenExpiry = (token) => {
  const payload = parseJwt(token);
  return payload?.exp ? payload.exp * 1000 : null;
};

/**
 * Get time remaining until token expires
 * @param {string} token - JWT token
 * @returns {number} Milliseconds until expiry
 */
export const getTimeUntilExpiry = (token) => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return 0;
  return Math.max(0, expiry - Date.now());
};
