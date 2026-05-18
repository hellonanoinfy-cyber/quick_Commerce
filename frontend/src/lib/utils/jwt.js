/**
 * JWT Utility Functions
 */

/**
 * Decode a JWT without verifying signature (client-side only)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export function decodeJWT(token) {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode base64url (browser-compatible)
    const base64url = parts[1];
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');

    // Pad with '=' if needed
    const padded = base64 + '=='.substring(0, (4 - (base64.length % 4)) % 4);

    // Use atob for browser environment
    const decoded = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(decoded);
  } catch (error) {
    console.warn('Failed to decode JWT:', error.message);
    return null;
  }
}

/**
 * Check if JWT is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired or invalid
 */
export function isJWTExpired(token) {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
}

/**
 * Get claim value from JWT
 * @param {string} token - JWT token
 * @param {string} claimName - Claim name to retrieve
 * @returns {any|null} - Claim value or null
 */
export function getJWTClaim(token, claimName) {
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  return decoded[claimName] || null;
}

/**
 * Check if user is guest based on JWT
 * @param {string} token - JWT token
 * @returns {boolean} - True if isGuest claim is true or no token
 */
export function isGuestUser(token) {
  if (!token) return true;

  const isGuest = getJWTClaim(token, 'isGuest');
  // isGuest might be string "true" or boolean true
  return isGuest === true || isGuest === 'true';
}
