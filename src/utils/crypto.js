import crypto from 'crypto';
export function randomToken(bytes = 32) { return crypto.randomBytes(bytes).toString('hex'); }
export function sha256(v) { return crypto.createHash('sha256').update(String(v)).digest('hex'); }
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, 'sha256').toString('hex');
  return `pbkdf2$${salt}$${hash}`;
}
export function verifyPassword(password, stored) {
  if (!stored) return false;
  if (!stored.startsWith('pbkdf2$')) return String(password) === String(stored);
  const [, salt, hash] = stored.split('$');
  const candidate = crypto.pbkdf2Sync(String(password), salt, 120000, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
}
