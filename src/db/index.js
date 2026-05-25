import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { config } from '../config/index.js';
import { hashPassword } from '../utils/crypto.js';
import { isoNow } from '../utils/time.js';

let db;
export function getDb() {
  if (!db) {
    mkdirSync(dirname(config.dbPath), { recursive: true });
    db = new Database(config.dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function migrate() {
  const d = getDb();
  const schema = readFileSync(join(config.root, 'src/db/schema.sql'), 'utf8');
  d.exec(schema);
  seedFromJsonIfNeeded(d);
}

function seedFromJsonIfNeeded(d) {
  const exists = d.prepare('SELECT json FROM app_content WHERE id=1').get();
  if (exists) return;
  const contentPath = join(config.dataDir, 'content.json');
  let content = defaultContent();
  if (existsSync(contentPath)) content = JSON.parse(readFileSync(contentPath, 'utf8'));
  normalizeContent(content);
  d.prepare('INSERT INTO app_content (id,json,updated_at) VALUES (1,?,?)').run(JSON.stringify(content), isoNow());
  const password = content.admin?.password || config.adminPassword || 'admin123456';
  d.prepare('INSERT OR IGNORE INTO admins (username,password_hash,created_at,updated_at) VALUES (?,?,?,?)')
    .run(config.adminUsername, hashPassword(password), isoNow(), isoNow());

  const statsPath = join(config.dataDir, 'stats.json');
  if (existsSync(statsPath)) {
    try {
      const stats = JSON.parse(readFileSync(statsPath, 'utf8'));
      const insert = d.prepare('INSERT OR REPLACE INTO stats_daily (date,pv) VALUES (?,?)');
      const tx = d.transaction(() => {
        for (const [date, pv] of Object.entries(stats.daily || {})) insert.run(date, Number(pv) || 0);
        if (stats.date && stats.today) insert.run(stats.date, Number(stats.today) || 0);
      }); tx();
    } catch {}
  }
  const visitsPath = join(config.dataDir, 'visits.json');
  if (existsSync(visitsPath)) {
    try {
      const visits = JSON.parse(readFileSync(visitsPath, 'utf8'));
      const insert = d.prepare(`INSERT INTO visits (visit_key,ip,location,user_agent,device,os,browser,method,path,referer,created_at) VALUES (@visit_key,@ip,@location,@user_agent,@device,@os,@browser,@method,@path,@referer,@created_at)`);
      const tx = d.transaction(() => {
        for (const [day, group] of Object.entries(visits || {})) {
          for (const v of (group.visitors || [])) {
            const history = Array.isArray(v.history) && v.history.length ? v.history : [{ time: v.firstTime || v.lastTime || '', method: v.method, path: v.path, referer: v.referer }];
            for (const h of history) insert.run({
              visit_key: v.key || `${v.ip || ''}|${v.userAgent || ''}`,
              ip: v.ip || '', location: v.location || '', user_agent: v.userAgent || '', device: v.device || '', os: v.os || '', browser: v.browser || '',
              method: h.method || v.method || '', path: h.path || v.path || '', referer: h.referer || v.referer || '', created_at: h.time || `${day} 00:00:00`
            });
          }
        }
      }); tx();
    } catch {}
  }
}

export function normalizeContent(c) {
  if (!c.profile) c.profile = {};
  if (!Array.isArray(c.contacts)) c.contacts = [];
  if (!Array.isArray(c.sites)) c.sites = [];
  if (!c.footer) c.footer = {};
  if (!c.weather) c.weather = { enabled: true, mode: 'visitor-ip', api: 'https://wttr.in/?format=j1' };
  if (!c.wallpaperMode) c.wallpaperMode = 'api-random';
  if (!c.wallpaperApi) c.wallpaperApi = 'https://api.dujin.org/bing/1920.php';
  if (!c.wallpaperDailyApi) c.wallpaperDailyApi = 'https://api.dujin.org/bing/1920.php';
  if (!Array.isArray(c.wallpaperApis)) c.wallpaperApis = ['https://api.dujin.org/bing/1920.php'];
  if (!Array.isArray(c.wallpapers)) c.wallpapers = [];
  if (!c.admin) c.admin = {};
  return c;
}
function defaultContent() { return normalizeContent({ profile: { name: 'Wnn', avatar: '', bio: '', location: '', startDate: '' }, contacts: [], sites: [], wallpapers: [], footer: {}, admin: {} }); }
