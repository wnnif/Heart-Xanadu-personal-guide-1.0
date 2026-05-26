import { changePassword, checkAuth, login, logout, sessionCookieOptions } from '../services/auth.service.js';
import { getContent, saveContent } from '../services/content.service.js';
import { getStats } from '../services/stats.service.js';
import { getVisitsGroupedByDay } from '../services/visits.service.js';
import { saveUpload } from '../services/upload.service.js';
import { renderIpPage } from './ip-page.js';
function unauthorized(reply) { reply.code(401); return { error: '未登录' }; }
export async function adminRoutes(app) {
  app.post('/admin/login', async (req, reply) => {
    const sessionCookie = login(req.body?.password || '');
    if (!sessionCookie) { reply.code(401); return { error: '密码错误' }; }
    reply.setCookie('session', sessionCookie, sessionCookieOptions());
    return { ok: true };
  });
  app.post('/admin/logout', async (req, reply) => { logout(req.cookies?.session); reply.clearCookie('session', { path: '/' }); return { ok: true }; });
  app.get('/admin/content', async (req, reply) => checkAuth(req) ? getContent({ includeAdmin: true }) : unauthorized(reply));
  app.put('/admin/content', async (req, reply) => checkAuth(req) ? (saveContent(req.body || {}), { ok: true }) : unauthorized(reply));
  app.put('/admin/password', async (req, reply) => {
    if (!checkAuth(req)) return unauthorized(reply);
    try { changePassword(req.body?.oldPassword, req.body?.newPassword); return { ok: true }; }
    catch (e) { reply.code(400); return { error: e.message }; }
  });
  app.post('/admin/upload', async (req, reply) => {
    if (!checkAuth(req)) return unauthorized(reply);
    try { const url = await saveUpload(await req.file()); return { ok: true, url }; }
    catch (e) { reply.code(400); return { error: e.message }; }
  });
  app.get('/admin/stats', async (req, reply) => checkAuth(req) ? getStats() : unauthorized(reply));
  app.get('/visits', async (req, reply) => checkAuth(req) ? getVisitsGroupedByDay() : unauthorized(reply));
  app.get('/ip', async (req, reply) => {
    reply.type('text/html; charset=utf-8').header('Cache-Control', 'no-store');
    return renderIpPage({ authenticated: checkAuth(req), visits: getVisitsGroupedByDay() });
  });
}
