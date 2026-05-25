import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const config = {
  root: ROOT,
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 3000),
  dbPath: process.env.DB_PATH || join(ROOT, 'data', 'daohang.sqlite'),
  dataDir: process.env.DATA_DIR || join(ROOT, 'data'),
  uploadDir: process.env.UPLOAD_DIR || join(ROOT, 'public', 'uploads'),
  sessionSecret: process.env.SESSION_SECRET || 'change-this-session-secret',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || '',
};
