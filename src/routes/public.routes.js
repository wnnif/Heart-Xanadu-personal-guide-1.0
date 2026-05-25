import { getContent } from '../services/content.service.js';
import { getStats, bumpPv } from '../services/stats.service.js';
import { recordVisit } from '../services/visits.service.js';
import { pickWallpaperUrl } from '../services/wallpaper.service.js';
import { loadWeather } from '../services/weather.service.js';
export async function publicRoutes(app) {
  app.get('/content', async () => getContent());
  app.get('/stats', async () => getStats());
  app.post('/visit', async (req) => { await recordVisit(req); return bumpPv(); });
  app.get('/wallpaper', async (_req, reply) => reply.redirect(pickWallpaperUrl()));
  app.get('/weather', async (req, reply) => { try { return await loadWeather(req); } catch { reply.code(502); return { error: 'Weather API unavailable' }; } });
}
