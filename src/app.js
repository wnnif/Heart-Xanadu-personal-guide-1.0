import Fastify from 'fastify';
import { migrate } from './db/index.js';
import { registerCookie } from './plugins/cookie.js';
import { registerMultipart } from './plugins/multipart.js';
import { registerStatic } from './plugins/static.js';
import { healthRoutes } from './routes/health.routes.js';
import { publicRoutes } from './routes/public.routes.js';
import { adminRoutes } from './routes/admin.routes.js';

export async function buildApp() {
  migrate();
  const app = Fastify({ logger: false, bodyLimit: 10 * 1024 * 1024 });
  await registerCookie(app);
  await registerMultipart(app);
  await registerStatic(app);
  await app.register(healthRoutes);
  app.get('/admin', async (_req, reply) => reply.redirect('/admin/'));
  await app.register(publicRoutes, { prefix: '/api' });
  await app.register(adminRoutes, { prefix: '/api' });
  return app;
}
