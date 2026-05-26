import crypto from 'crypto';

/**
 * Generates a cryptographically secure, collision-safe v4 UUID.
 * @returns {string} RFC 4122 v4 UUID
 */
export function generateUUID() {
  // Built-in high-performance cryptographically secure UUID generator
  return crypto.randomUUID();
}

/**
 * Generates a collision-safe prefixed identifier.
 * @param {string} prefix - The identifier prefix
 * @returns {string} Collision-safe prefixed ID
 */
export function generatePrefixedId(prefix) {
  const p = String(prefix || '').trim();
  const suffix = crypto.randomUUID();
  return p ? `${p}-${suffix}` : suffix;
}

export default {
  generateUUID,
  generatePrefixedId,
};
