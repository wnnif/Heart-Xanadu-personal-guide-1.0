import multipart from '@fastify/multipart';
import { config } from '../config/index.js';
export async function registerMultipart(app) {
  await app.register(multipart, {
    limits: {
      files: 1,
      fileSize: config.maxUploadBytes,
      fields: 5,
      parts: 6,
    },
  });
}
