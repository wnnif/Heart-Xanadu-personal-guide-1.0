import { getDb, normalizeContent } from '../db/index.js';
import { isoNow } from '../utils/time.js';
export function getContent({ includeAdmin = false } = {}) {
  const row = getDb().prepare('SELECT json FROM app_content WHERE id=1').get();
  const content = normalizeContent(JSON.parse(row.json));
  if (!includeAdmin) delete content.admin;
  return content;
}
export function saveContent(incoming) {
  const current = getContent({ includeAdmin: true });
  const content = normalizeContent(incoming || {});
  content.admin = current.admin || {};
  getDb().prepare('UPDATE app_content SET json=?, updated_at=? WHERE id=1').run(JSON.stringify(content), isoNow());
  return content;
}
export function updateAdminPasswordPlainForCompatibility(password) {
  const content = getContent({ includeAdmin: true });
  content.admin = { ...(content.admin || {}), password };
  getDb().prepare('UPDATE app_content SET json=?, updated_at=? WHERE id=1').run(JSON.stringify(content), isoNow());
}
