import fastifyCookie from '@fastify/cookie';
export async function registerCookie(app) { await app.register(fastifyCookie); }
