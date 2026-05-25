import { getDb } from '../db/index.js';
import { hashPassword, randomToken, verifyPassword } from '../utils/crypto.js';
import { isoNow } from '../utils/time.js';
import { updateAdminPasswordPlainForCompatibility } from './content.service.js';

const sessions = new Map();
export function login(password) {
  const admin = getDb().prepare('SELECT * FROM admins ORDER BY id LIMIT 1').get();
  if (!admin || !verifyPassword(password, admin.password_hash)) return null;
  const token = randomToken(32);
  sessions.set(token, { expires: Date.now() + 24 * 3600 * 1000, adminId: admin.id });
  return token;
}
export function logout(token) { if (token) sessions.delete(token); }
export function checkAuth(req) {
  const token = req.cookies?.session;
  if (!token || !sessions.has(token)) return false;
  const s = sessions.get(token);
  if (Date.now() > s.expires) { sessions.delete(token); return false; }
  return true;
}
export function changePassword(oldPassword, newPassword) {
  const admin = getDb().prepare('SELECT * FROM admins ORDER BY id LIMIT 1').get();
  if (!admin || !verifyPassword(oldPassword, admin.password_hash)) throw new Error('旧密码错误');
  if (!newPassword || newPassword.length < 6) throw new Error('新密码至少6位');
  getDb().prepare('UPDATE admins SET password_hash=?, updated_at=? WHERE id=?').run(hashPassword(newPassword), isoNow(), admin.id);
  sessions.clear();
  updateAdminPasswordPlainForCompatibility(newPassword);
}
