import { getDb } from '../db/index.js';
import { sha256 } from '../utils/crypto.js';
import { getVisitorIp, parseUa } from '../utils/ip.js';
import { shDate, shTime } from '../utils/time.js';

export async function ipGeo(ip) {
  if (!ip) return '本机/内网';
  try {
    const r = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?lang=zh-CN&fields=status,country,regionName,city,isp,query`, { signal: AbortSignal.timeout(3000) });
    const j = await r.json();
    if (j.status === 'success') return [j.country, j.regionName, j.city, j.isp].filter(Boolean).join(' ');
  } catch {}
  return '未知';
}
export async function recordVisit(req) {
  const ip = getVisitorIp(req) || req.headers['x-real-ip'] || req.ip || '';
  const ua = req.headers['user-agent'] || '';
  const key = sha256(ip + '|' + ua);
  const parsed = parseUa(ua);
  const location = await ipGeo(ip);
  const created_at = shTime();
  getDb().prepare(`INSERT INTO visits (visit_key,ip,location,user_agent,device,os,browser,method,path,referer,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(key, ip, location, ua, parsed.device, parsed.os, parsed.browser, req.method, req.url || '/', req.headers.referer || req.headers.referrer || '', created_at);
  return { key, ip, location, ...parsed, created_at };
}
export function getVisitsGroupedByDay() {
  const rows = getDb().prepare('SELECT * FROM visits ORDER BY created_at DESC LIMIT 5000').all();
  const out = {};
  for (const r of rows) {
    const day = (r.created_at || '').slice(0,10) || shDate();
    if (!out[day]) out[day] = { count: 0, visitors: [] };
    let v = out[day].visitors.find(x => x.key === r.visit_key);
    const hit = { time: r.created_at, method: r.method, path: r.path, referer: r.referer };
    if (!v) {
      v = { key: r.visit_key, ip: r.ip, location: r.location, firstTime: r.created_at, lastTime: r.created_at, hits: 0, history: [], method: r.method, path: r.path, referer: r.referer, userAgent: r.user_agent, device: r.device, os: r.os, browser: r.browser };
      out[day].visitors.push(v);
    }
    v.hits += 1; v.history.push(hit);
    if (String(r.created_at) > String(v.lastTime)) v.lastTime = r.created_at;
    if (String(r.created_at) < String(v.firstTime)) v.firstTime = r.created_at;
  }
  for (const d of Object.keys(out)) out[d].count = out[d].visitors.length;
  return out;
}
