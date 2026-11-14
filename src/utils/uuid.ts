const LOOSE_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Standard fixed demo user UUID (RFC 4122 v4 compliant)
 */
export const DEMO_USER_UUID = '00000000-0000-4000-8000-000000000001';

/**
 * Validates if a string is a valid UUID (standard or loose RFC 4122 format)
 */
export function isValidUUID(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  return LOOSE_UUID_REGEX.test(trimmed);
}

/**
 * Standard RFC 4122 Version 4 UUID Generator
 * Uses native crypto.randomUUID when available, or cryptographically secure random values fallback.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === 'function') {
      const buffer = new Uint8Array(16);
      crypto.getRandomValues(buffer);
      buffer[6] = (buffer[6] & 0x0f) | 0x40; // Version 4
      buffer[8] = (buffer[8] & 0x3f) | 0x80; // Variant 10
      const hex = Array.from(buffer).map((b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    }
  }

  // Fallback for non-crypto environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
