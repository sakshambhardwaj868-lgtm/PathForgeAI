import crypto from 'crypto';

/**
 * Generate a cryptographically unpredictable 32-byte hexadecimal sharing token.
 * 32 bytes = 256 bits of entropy = 64 hex characters.
 */
export function generateSecureShareToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a share token using SHA-256 for secure database storage.
 * The database never stores the raw token, preventing link hijacking even if DB is dumped.
 */
export function hashShareToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}
