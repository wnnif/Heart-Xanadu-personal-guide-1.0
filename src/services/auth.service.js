import crypto from 'crypto';
import { getDb } from '../db/index.js';
import { config } from '../config/index.js';
import { hashPassword, randomToken, verifyPassword } from '../utils/crypto.js';
import { isoNow } from '../utils/time.js';
import { updateAdminPasswordPlainForCompatibility } from './content.service.js';

const sessions = new Map();
const COOKIE_NAME = 'session';
const SESSION_MAX_AGE_SECONDS = 24 * 3600;

function signToken(token) {
  return crypto.createHmac('sha256', config.sessionSecret).update(token).digest('base64url');
}

export function encodeSessionCookie(token) {
  return `${token}.${signToken(token)}`;
}

export function decodeSessionCookie(cookieValue) {
  const value = String(cookieValue || '');
  const splitAt = value.lastIndexOf('.');
  if (splitAt <= 0) return '';
  const token = value.slice(0, splitAt);
  const signature = value.slice(splitAt + 1);
  const expected = signToken(token);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return '';
  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer) ? token : '';
}

export function sessionCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookieSecure,
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function login(password) {
  const admin = getDb().prepare('SELECT * FROM admins ORDER BY id LIMIT 1').get();
  if (!admin || !verifyPassword(password, admin.password_hash)) return null;
  const token = randomToken(32);
  sessions.set(token, { expires: Date.now() + SESSION_MAX_AGE_SECONDS * 1000, adminId: admin.id });
  return encodeSessionCookie(token);
}
export function logout(cookieValue) {
  const token = decodeSessionCookie(cookieValue);
  if (token) sessions.delete(token);
}
export function checkAuth(req) {
  const token = decodeSessionCookie(req.cookies?.[COOKIE_NAME]);
  if (!token || !sessions.has(token)) return false;
  const s = sessions.get(token);
  if (Date.now() > s.expires) { sessions.delete(token); return false; }
  return true;
}
export function changePassword(oldPassword, newPassword) {
  const admin = getDb().prepare('SELECT * FROM admins ORDER BY id LIMIT 1').get();
  if (!admin || !verifyPassword(oldPassword, admin.password_hash)) throw new Error('旧密码错误');
  if (!newPassword || newPassword.length < 8) throw new Error('新密码至少8位');
  getDb().prepare('UPDATE admins SET password_hash=?, updated_at=? WHERE id=?').run(hashPassword(newPassword), isoNow(), admin.id);
  sessions.clear();
  updateAdminPasswordPlainForCompatibility(newPassword);
}
