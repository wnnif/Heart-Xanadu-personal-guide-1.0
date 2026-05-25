import multipart from '@fastify/multipart';
export async function registerMultipart(app) { await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }); }
