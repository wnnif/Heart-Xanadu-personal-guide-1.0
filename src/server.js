import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';

// ===== Runtime paths and data files =====
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const UPLOAD_DIR = join(ROOT, 'public', 'uploads');
const CONTENT_FILE = join(DATA_DIR, 'content.json');
const STATS_FILE = join(DATA_DIR, 'stats.json');
const VISITS_FILE = join(DATA_DIR, 'visits.json');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

function readContent() {
  return JSON.parse(readFileSync(CONTENT_FILE, 'utf8'));
}
function writeContent(data) {
  writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), 'utf8');
}
function normalizeContent(c) {
  if (!c.wallpaperMode) c.wallpaperMode = 'api-random';
  if (!c.wallpaperApi) c.wallpaperApi = 'https://api.dujin.org/bing/1920.php';
  if (!c.wallpaperDailyApi) c.wallpaperDailyApi = 'https://api.dujin.org/bing/1920.php';
  if (!Array.isArray(c.wallpaperApis)) c.wallpaperApis = ['https://api.dujin.org/bing/1920.php'];
  if (!Array.isArray(c.wallpapers)) c.wallpapers = [];
  return c;
}


function shDate(d = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
function shTime(d = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(d);
}
function htmlEscape(v) {
  return String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function parseUa(ua='') {
  const lower = ua.toLowerCase();
  const device = /mobile|android|iphone|ipad|phone/.test(lower) ? '手机/平板' : '电脑';
  let os = '未知';
  if (/windows/.test(lower)) os = 'Windows'; else if (/iphone|ipad|ios/.test(lower)) os = 'iOS'; else if (/android/.test(lower)) os = 'Android'; else if (/mac os|macintosh/.test(lower)) os = 'macOS'; else if (/linux/.test(lower)) os = 'Linux';
  let browser = '未知';
  if (/edg\//.test(lower)) browser = 'Edge'; else if (/chrome\//.test(lower) && !/chromium/.test(lower)) browser = 'Chrome'; else if (/safari\//.test(lower) && !/chrome/.test(lower)) browser = 'Safari'; else if (/firefox\//.test(lower)) browser = 'Firefox'; else if (/micromessenger/.test(lower)) browser = '微信'; else if (/telegram/.test(lower)) browser = 'Telegram';
  return { device, os, browser };
}
function readVisits() {
  if (!existsSync(VISITS_FILE)) writeFileSync(VISITS_FILE, JSON.stringify({}, null, 2), 'utf8');
  return JSON.parse(readFileSync(VISITS_FILE, 'utf8'));
}
function writeVisits(data) { writeFileSync(VISITS_FILE, JSON.stringify(data, null, 2), 'utf8'); }
async function ipGeo(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) return '本机/内网';
  try {
    const r = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?lang=zh-CN&fields=status,country,regionName,city,isp,query`, { signal: AbortSignal.timeout(3000) });
    const j = await r.json();
    if (j.status === 'success') return [j.country, j.regionName, j.city, j.isp].filter(Boolean).join(' ');
  } catch {}
  return '未知';
}
async function recordVisit(req) {
  const ip = getVisitorIp(req) || req.headers['x-real-ip'] || req.ip || '';
  const ua = req.headers['user-agent'] || '';
  const today = shDate();
  const now = shTime();
  const visits = readVisits();
  if (!visits[today]) visits[today] = { count: 0, visitors: [] };
  const key = crypto.createHash('sha256').update(ip + '|' + ua).digest('hex');
  let item = visits[today].visitors.find(v => v.key === key);
  const hit = {
    time: now,
    method: req.method,
    path: req.url || '/',
    referer: req.headers.referer || req.headers.referrer || ''
  };
  if (!item) {
    const parsed = parseUa(ua);
    item = {
      key,
      ip,
      location: await ipGeo(ip),
      firstTime: now,
      lastTime: now,
      hits: 1,
      history: [hit],
      method: hit.method,
      path: hit.path,
      referer: hit.referer,
      userAgent: ua,
      ...parsed
    };
    visits[today].visitors.unshift(item);
  } else {
    item.lastTime = now;
    item.hits = (item.hits || 1) + 1;
    if (!Array.isArray(item.history)) item.history = [];
    item.history.push(hit);
    item.history = item.history.slice(-200);
    item.method = hit.method;
    item.path = hit.path;
    item.referer = hit.referer || item.referer || '';
  }
  visits[today].count = visits[today].visitors.length;
  const days = Object.keys(visits).sort().slice(-30);
  const trimmed = {}; days.forEach(k => trimmed[k] = visits[k]);
  writeVisits(trimmed);
  return item;
}

function readStats() {
  if (!existsSync(STATS_FILE)) {
    writeFileSync(STATS_FILE, JSON.stringify({ total: 0, today: 0, date: new Date().toISOString().slice(0, 10), daily: {} }), 'utf8');
  }
  return JSON.parse(readFileSync(STATS_FILE, 'utf8'));
}
function writeStats(data) {
  writeFileSync(STATS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function bumpVisit() {
  const stats = readStats();
  const today = new Date().toISOString().slice(0, 10);
  if (stats.date !== today) {
    stats.date = today;
    stats.today = 0;
  }
  stats.total++;
  stats.today++;
  if (!stats.daily) stats.daily = {};
  stats.daily[today] = (stats.daily[today] || 0) + 1;
  const keys = Object.keys(stats.daily).sort().slice(-30);
  const trimmed = {};
  keys.forEach(k => trimmed[k] = stats.daily[k]);
  stats.daily = trimmed;
  writeStats(stats);
  return stats;
}

const bootContent = normalizeContent(readContent());
if (!bootContent.admin) bootContent.admin = {};
if (!bootContent.admin.password) {
  bootContent.admin.password = crypto.randomBytes(16).toString('hex');
  console.log(`[INIT] Admin password generated: ${bootContent.admin.password}`);
}
writeContent(bootContent);

const sessions = new Map();
const app = Fastify({ logger: false, bodyLimit: 10 * 1024 * 1024 });
await app.register(fastifyCookie);
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

await app.register(fastifyStatic, {
  root: join(ROOT, 'public'),
  prefix: '/',
  decorateReply: false,
});
await app.register(fastifyStatic, {
  root: join(ROOT, 'admin'),
  prefix: '/admin/',
  decorateReply: false,
});

// ===== Public APIs: content, stats, wallpaper, weather =====
app.get('/api/content', async () => {
  const c = normalizeContent(readContent());
  const { admin, ...publicContent } = c;
  return publicContent;
});

app.get('/api/stats', async () => {
  const stats = readStats();
  const visits = readVisits();
  const today = shDate();
  const todayVisitors = visits[today]?.visitors?.length || 0;
  return { ...stats, todayPv: stats.today || 0, todayVisitors };
});
app.post('/api/visit', async (req) => {
  await recordVisit(req);
  return bumpVisit();
});

app.get('/api/wallpaper', async (req, reply) => {
  const c = normalizeContent(readContent());
  let url = c.wallpaperApi || c.wallpaperDailyApi || c.wallpapers?.[0] || 'https://api.dujin.org/bing/1920.php';
  if (c.wallpaperMode === 'daily') url = c.wallpaperDailyApi || url;
  if (c.wallpaperMode === 'api-random') {
    const apis = (c.wallpaperApis || []).filter(Boolean);
    url = apis.length ? apis[Math.floor(Math.random() * apis.length)] : url;
    url += (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
  }
  if (c.wallpaperMode === 'list' || c.wallpaperMode === 'upload') {
    const list = (c.wallpapers || []).filter(Boolean);
    url = list.length ? list[Math.floor(Math.random() * list.length)] : url;
  }
  reply.redirect(url);
});


function weatherCodeZh(code, fallback = '') {
  const map = {
    113: '晴', 116: '局部多云', 119: '多云', 122: '阴', 143: '雾',
    176: '局部小雨', 179: '局部小雪', 182: '雨夹雪', 185: '冻雨', 200: '雷阵雨',
    227: '吹雪', 230: '暴风雪', 248: '雾', 260: '冻雾',
    263: '局部小雨', 266: '小雨', 281: '冻毛毛雨', 284: '大冻毛毛雨',
    293: '局部小雨', 296: '小雨', 299: '中雨', 302: '大雨',
    305: '大雨', 308: '暴雨', 311: '冻雨', 314: '大冻雨', 317: '雨夹雪',
    320: '小雪', 323: '局部小雪', 326: '小雪', 329: '中雪', 332: '大雪',
    335: '大雪', 338: '暴雪', 350: '冰粒', 353: '小阵雨', 356: '中阵雨',
    359: '强阵雨', 362: '雨夹雪阵雨', 365: '雨夹雪阵雨', 368: '小雪阵雪',
    371: '大雪阵雪', 374: '冰粒阵雨', 377: '冰粒阵雨', 386: '局部雷雨',
    389: '雷雨', 392: '雷雪', 395: '大雪伴雷'
  };
  return map[parseInt(code)] || fallback || '未知天气';
}

function getVisitorIp(req) {
  const xff = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(xff) ? xff[0] : xff || req.headers['x-real-ip'] || req.ip || '')
    .split(',')[0]
    .trim()
    .replace(/^::ffff:/, '');
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return '';
  return ip;
}

app.get('/api/weather', async (req, reply) => {
  try {
    const c = readContent();
    const fallbackUrl = c.weather?.api || 'https://wttr.in/?format=j1&lang=zh';
    const mode = c.weather?.mode || 'visitor-ip';
    let url = fallbackUrl;

    let geoLabel = '';
    if (mode === 'visitor-ip') {
      const ip = getVisitorIp(req);
      if (ip) {
        try {
          // ip-api 支持 lang=zh-CN，城市名优先中文；失败再回退 ipwho.is
          const geoResp = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,lat,lon&lang=zh-CN`, { signal: AbortSignal.timeout(3500) });
          const geo = await geoResp.json();
          if (geo.status === 'success' && geo.lat && geo.lon) {
            url = `https://wttr.in/${geo.lat},${geo.lon}?format=j1&lang=zh`;
            geoLabel = [geo.regionName, geo.city].filter(Boolean).join(' ');
          }
        } catch {}
        if (!geoLabel) {
          const geoResp = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country,region,city,latitude,longitude`, { signal: AbortSignal.timeout(3500) });
          const geo = await geoResp.json();
          if (geo.success && geo.latitude && geo.longitude) {
            url = `https://wttr.in/${geo.latitude},${geo.longitude}?format=j1&lang=zh`;
            geoLabel = [geo.region, geo.city].filter(Boolean).join(' ');
          }
        }
      }
    }

    const resp = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const data = await resp.json();
    if (geoLabel) {
      data.nearest_area = [{ areaName: [{ value: geoLabel }] }];
      data.locationLabel = geoLabel;
    }
    if (data?.current_condition?.[0]) {
      const cur = data.current_condition[0];
      const zh = weatherCodeZh(cur.weatherCode, cur.weatherDesc?.[0]?.value);
      cur.weatherDesc = [{ value: zh }];
      cur.weatherDescZh = zh;
    }
    return data;
  } catch (e) {
    reply.code(502);
    return { error: 'Weather API unavailable' };
  }
});

// ===== Admin APIs: login, content edit, password, upload =====
function checkAuth(req) {
  const token = req.cookies?.session;
  if (!token || !sessions.has(token)) return false;
  const s = sessions.get(token);
  if (Date.now() > s.expires) { sessions.delete(token); return false; }
  return true;
}

app.post('/api/admin/login', async (req, reply) => {
  const { password } = req.body || {};
  const c = readContent();
  if (password === c.admin.password) {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { expires: Date.now() + 24 * 3600 * 1000 });
    reply.setCookie('session', token, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 86400 });
    return { ok: true };
  }
  reply.code(401);
  return { error: '密码错误' };
});

app.post('/api/admin/logout', async (req, reply) => {
  const token = req.cookies?.session;
  if (token) sessions.delete(token);
  reply.clearCookie('session', { path: '/' });
  return { ok: true };
});

app.get('/api/admin/content', async (req, reply) => {
  if (!checkAuth(req)) { reply.code(401); return { error: '未登录' }; }
  return normalizeContent(readContent());
});

app.put('/api/admin/content', async (req, reply) => {
  if (!checkAuth(req)) { reply.code(401); return { error: '未登录' }; }
  const current = normalizeContent(readContent());
  const incoming = normalizeContent(req.body || {});
  incoming.admin = { password: current.admin.password }; // 永远以磁盘当前密码为准，防止后台旧页面覆盖新密码
  writeContent(incoming);
  return { ok: true };
});

app.put('/api/admin/password', async (req, reply) => {
  if (!checkAuth(req)) { reply.code(401); return { error: '未登录' }; }
  const { oldPassword, newPassword } = req.body || {};
  const c = normalizeContent(readContent());
  if (oldPassword !== c.admin.password) { reply.code(400); return { error: '旧密码错误' }; }
  if (!newPassword || newPassword.length < 6) { reply.code(400); return { error: '新密码至少6位' }; }
  c.admin.password = newPassword;
  writeContent(c);
  return { ok: true };
});

app.post('/api/admin/upload', async (req, reply) => {
  if (!checkAuth(req)) { reply.code(401); return { error: '未登录' }; }
  const file = await req.file();
  if (!file) { reply.code(400); return { error: '没有文件' }; }
  const allow = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = extname(file.filename || '').toLowerCase();
  if (!allow.includes(ext)) { reply.code(400); return { error: '只支持 jpg/png/webp/gif' }; }
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  const dest = join(UPLOAD_DIR, name);
  await pipeline(file.file, createWriteStream(dest));
  return { ok: true, url: `/uploads/${name}` };
});

app.get('/api/admin/stats', async (req, reply) => {
  if (!checkAuth(req)) { reply.code(401); return { error: '未登录' }; }
  const stats = readStats();
  const visits = readVisits();
  const today = shDate();
  const todayVisitors = visits[today]?.visitors?.length || 0;
  return { ...stats, todayPv: stats.today || 0, todayVisitors };
});


app.get('/api/visits', async (req, reply) => {
  if (!checkAuth(req)) { reply.code(401); return { error: '未登录' }; }
  return readVisits();
});

// ===== IP record page =====
app.get('/ip', async (req, reply) => {
  if (!checkAuth(req)) {
    reply.type('text/html; charset=utf-8').header('Cache-Control', 'no-store');
    return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IP 访问记录登录</title>
    <style>body{margin:0;background:#0f0f1a;color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}.box{width:360px;background:#1a1a2e;border:1px solid #2a2a4a;border-radius:16px;padding:36px}h1{font-size:20px;text-align:center;margin:0 0 22px}input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:8px;border:1px solid #2a2a4a;background:#0f0f1a;color:#fff;font-size:15px;margin-bottom:12px}button{width:100%;padding:12px;border:0;border-radius:8px;background:#0066ff;color:#fff;font-size:15px;cursor:pointer}.msg{display:none;margin-bottom:12px;color:#ff6b6b;font-size:14px;text-align:center}.back{display:block;text-align:center;margin-top:16px;color:#60a5fa;text-decoration:none;font-size:14px}</style></head><body><div class="box"><h1>🔐 查看访问 IP</h1><input id="pwd" type="password" placeholder="输入后台密码" onkeydown="if(event.key==='Enter')login()"><div id="msg" class="msg"></div><button onclick="login()">登录查看</button><a class="back" href="/admin/">返回后台</a></div><script>async function login(){const p=document.getElementById('pwd').value;const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:p})});if(r.ok){location.reload()}else{const m=document.getElementById('msg');m.textContent='密码错误';m.style.display='block'}}</script></body></html>`;
  }
  const visits = readVisits();
  const groups = new Map();
  const days = Object.keys(visits).sort().reverse();
  for (const day of days) {
    for (const v of (visits[day].visitors || [])) {
      const key = v.ip || '未知';
      if (!groups.has(key)) groups.set(key, {
        ip: key,
        location: v.location || '',
        total: 0,
        firstTime: v.firstTime || '',
        lastTime: v.lastTime || '',
        device: `${v.device || ''} / ${v.os || ''} / ${v.browser || ''}`,
        userAgent: v.userAgent || '',
        details: []
      });
      const g = groups.get(key);
      g.total += (v.hits || 1);
      if ((v.lastTime || '') > (g.lastTime || '')) g.lastTime = v.lastTime;
      if (!g.firstTime || (v.firstTime || '') < g.firstTime) g.firstTime = v.firstTime || g.firstTime;
      const history = Array.isArray(v.history) && v.history.length ? v.history : [{ time: v.firstTime || v.lastTime || '', method: v.method, path: v.path, referer: v.referer }];
      for (const h of history) {
        g.details.push({ day, time: h.time || '', method: h.method || v.method || '', path: h.path || v.path || '', referer: h.referer || v.referer || '', device: `${v.device || ''} / ${v.os || ''} / ${v.browser || ''}`, ua: v.userAgent || '' });
      }
    }
  }
  const list = [...groups.values()].sort((a,b) => b.total - a.total || String(b.lastTime).localeCompare(String(a.lastTime)));
  const rows = list.map((g, idx) => {
    const details = g.details.sort((a,b) => String(b.time).localeCompare(String(a.time))).map(d => `<tr class="detail detail-${idx}"><td></td><td colspan="8"><b>${htmlEscape(d.day)} ${htmlEscape(d.time)}</b>　${htmlEscape(d.method)}　${htmlEscape(d.path)}　来源：${htmlEscape(d.referer || '-')}<br><span class="ua">${htmlEscape(d.device)}　${htmlEscape(d.ua)}</span></td></tr>`).join('');
    return `<tr class="main" onclick="toggleDetail(${idx})">
      <td>▶</td><td>${htmlEscape(g.ip)}</td><td>${htmlEscape(g.location)}</td><td class="count">${htmlEscape(g.total)}</td><td>${htmlEscape(g.firstTime)}</td><td>${htmlEscape(g.lastTime)}</td><td>${htmlEscape(g.device)}</td><td class="ua">${htmlEscape(g.userAgent)}</td>
    </tr>${details}`;
  }).join('');
  reply.type('text/html; charset=utf-8').header('Cache-Control', 'no-store');
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>访问 IP 记录</title>
  <style>body{margin:0;background:#0f0f1a;color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}.wrap{padding:24px;max-width:1500px;margin:auto}h1{font-size:22px}.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}a{color:#60a5fa}.card{background:#1a1a2e;border:1px solid #2a2a4a;border-radius:12px;overflow:auto}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:10px 12px;border-bottom:1px solid #2a2a4a;text-align:left;vertical-align:top;white-space:nowrap}th{background:#111827;color:#93c5fd;position:sticky;top:0}.ua{white-space:normal;min-width:360px;color:#b6bdd0}.main{cursor:pointer}.main:hover{background:#20203a}.detail{display:none;background:#111827}.detail td{color:#cbd5e1}.count{font-size:18px;font-weight:700;color:#60a5fa}.muted{color:#9ca3af;font-size:13px}</style></head><body><div class="wrap"><div class="top"><div><h1>访问 IP 记录</h1><div class="muted">按 IP 汇总总访问次数；点击 IP 行可展开查看每天每次访问时间、路径、来源。</div></div><a href="/admin/">返回后台</a></div><div class="card"><table><thead><tr><th></th><th>IP</th><th>归属地</th><th>总访问</th><th>首次访问</th><th>最后访问</th><th>设备</th><th>User-Agent</th></tr></thead><tbody>${rows || '<tr><td colspan="8">暂无记录</td></tr>'}</tbody></table></div></div><script>function toggleDetail(i){document.querySelectorAll('.detail-'+i).forEach(e=>{e.style.display=e.style.display==='table-row'?'none':'table-row'})}</script></body></html>`;
});

const port = parseInt(process.env.PORT || '3000');
await app.listen({ host: '0.0.0.0', port });
console.log(`Server running on http://0.0.0.0:${port}`);
