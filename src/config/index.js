import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET || 'change-this-session-secret';

if (isProduction && sessionSecret === 'change-this-session-secret') {
  console.warn('[security] SESSION_SECRET is using the default value. Set a strong random value in .env for production.');
}

export const config = {
  root: ROOT,
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 3000),
  dbPath: process.env.DB_PATH || join(ROOT, 'data', 'daohang.sqlite'),
  dataDir: process.env.DATA_DIR || join(ROOT, 'data'),
  uploadDir: process.env.UPLOAD_DIR || join(ROOT, 'public', 'uploads'),
  sessionSecret,
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || '123456',
  trustProxy: process.env.TRUST_PROXY !== 'false',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024),
};
