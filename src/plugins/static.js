import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { config } from '../config/index.js';

function cacheHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
}

export async function registerStatic(app) {
  app.addHook('onSend', async (req, reply, payload) => {
    if (req.url.startsWith('/api/') || req.url === '/' || req.url.endsWith('.html') || req.url.endsWith('.js') || req.url.endsWith('.css')) {
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');
      reply.header('Surrogate-Control', 'no-store');
    }
    return payload;
  });
  await app.register(fastifyStatic, { root: join(config.root, 'public'), prefix: '/', decorateReply: false, setHeaders: cacheHeaders });
  await app.register(fastifyStatic, { root: join(config.root, 'admin'), prefix: '/admin/', decorateReply: false, setHeaders: cacheHeaders });
}
