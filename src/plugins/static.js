import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { config } from '../config/index.js';
export async function registerStatic(app) {
  await app.register(fastifyStatic, { root: join(config.root, 'public'), prefix: '/', decorateReply: false });
  await app.register(fastifyStatic, { root: join(config.root, 'admin'), prefix: '/admin/', decorateReply: false });
}
